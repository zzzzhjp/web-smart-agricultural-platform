<template>
    <div id="map" v-loading="loading"></div>
    <HeaderCom title="智慧农业可视化平台"></HeaderCom>
    <el-dialog class="monitor" v-model="dialogVisible" :title="monitorName" width="600">
        <ul class="monitor-infos">
            <li class="monitor-infos-item" v-for="item in monitorInfos" :key="item.key">
                <div class="monitor-infos-main">
                    <div class="monitor-infors-img">{{ item.key }}</div>
                    <div class="monitor-infos-content">
                        <p>{{ item.label }}</p>
                        <p>{{ item.value }}{{ item.unit }}</p>
                    </div>
                </div>
                <el-slider
                    class="monitor-infos-range"
                    :class="{ 'is-danger': outSoilRange(item.value, item.key)}"
                    :model-value="clampedValue(item.value, item.key)"
                    disabled
                    :show-tooltip="false"
                    :min="minSoilRange(item.key)"
                    :max="maxSoilRange(item.key)"
                ></el-slider>
            </li>
        </ul>
    </el-dialog>

    //侧边展示栏
    <div class="chart-aside" style="left: 1vw">
        <div class="chart-item">
            <div class="chart-title">气象监测</div>
            <div class="weather">
                <div 
                    v-for="item in WEATHER"
                    :key="item.id"
                    class="weather-item"
                >
                    <img :src="leaf" alt="">
                    <span>{{ item.name }}</span>
                    <span>{{ item.value }}</span>
                </div>
            </div>
        </div>
        <div class="chart-item">
            <div class="chart-title">温室大棚</div>
            <div class="greenhouse">
                <div v-for="item in GREENHOUSE" :key="item.id" class="greenhouse-item">
                    <img :src="leaf" alt="" />
                    <span>{{ item.name }}</span>
                    <span>{{ item.value }}</span>
                </div>
            </div>
        </div>
        <div class="chart-item">
            <div class="chart-title">智能告警</div>
            <ul class="alarm">
                <li v-for="(item, index) in ALARM" :key="index">{{ item.value }}</li>
            </ul>
        </div>
    </div>
    <div class="chart-aside" style="right: 1vw">
        <div class="chart-item">
            <div class="chart-title">无人机情况</div>
            <div class="drone">
                <div class="drone-item">
                <img :src="irrigate" alt="" />
                当前无人机：{{ DRONE.isFlyOpen ? '启动' : '关闭' }}
                </div>
                <div class="drone-item">
                <img :src="monitor" alt="" />
                当前喷洒农药：{{ DRONE.isPesticideOpen ? '启动' : '关闭' }}
                </div>
                <div class="drone-item">
                <img :src="moist" alt="" />
                大约剩余时间：{{ DRONE.remainingTime }}
                </div>
            </div>
        </div>
        <div class="chart-item">
            <div class="chart-title">作物面积占比</div>
            <div class="cropArea">
                <CropArea :data="cropArea" />
            </div>
            </div>
        <div class="chart-item">
            <div class="chart-title">产量历史占比</div>
            <div class="producHistory">
                <ProducHistory :data="PRODUC" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium'
import { onMounted, ref , reactive} from 'vue';

//api
import { getMonitors , getCrops , getRoutes } from '@/api';

//工具和设置
import { 
    lockPosition, 
    mapLoaded,
    initCesium, 
    expandRange, 
    loadModel,
    tooltip,
} from '@/utils';

import { FARM , SOIL_RANGE} from '@/configs/Farm';
import { WEATHER } from '@/configs/Weather';
import { GREENHOUSE } from '@/configs/Greenhouse';
import { ALARM } from '@/configs/Alarm';
import { DRONE } from '@/configs/Drone'
import { PRODUC } from '@/configs/Product';

//组件
import HeaderCom from '@/components/HeaderCom.vue';
import CropArea from '@/components/CropArea.vue';

//png
import fence from '@/assets/images/fence.png'
import leaf from '@/assets/images/leaf.png'
import irrigate from '@/assets/images/irrigate.png'
import moist from '@/assets/images/moist.png'
import monitor from '@/assets/images/monitor.png'
import smoke from '@/assets/images/smoke.png'
import type { Crop, Monitor , MonitorInfo , Route} from '@/interface';
import router from '@/routers';


let viewer: Cesium.Viewer
const loading = ref(false)
const dialogVisible = ref(false)
const monitorName = ref('')
const monitorInfos = ref<MonitorInfo[]>([])

const cropArea = reactive<Record<string, number>>({})

//设置围墙
function setWallEntity(){
    const height = 50
    const wall: number[] = []
    for(let i = 0; i < FARM.range.length ; i += 2){
        wall.push(FARM.range[i] ?? 0 , FARM.range[i + 1] ?? 0 , height)
    }
    wall.push(FARM.range[0] ?? 0 , FARM.range[1] ?? 0 , height)
    // console.log(wall);
    viewer.entities.add({
        wall: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(wall),
            material: new Cesium.ImageMaterialProperty({
                image: fence,
                transparent: true,
                repeat: new Cesium.Cartesian2(30.0, 1.0),
                color: Cesium.Color.WHITE.withAlpha(0.8),
            })
        }
    })
}

//显示农场范围
function showFarmRange(){
    const outRange = expandRange(FARM.range, 3)
    viewer.entities.add({
        polygon: {
            hierarchy: {
                positions: Cesium.Cartesian3.fromDegreesArray(outRange),
                holes: [
                    {
                        positions: Cesium.Cartesian3.fromDegreesArray(FARM.range),
                        holes: [],
                    }
                ]
            },
            material: Cesium.Color.fromCssColorString('#081c2c').withAlpha(0.5)
        }
    })
}


//添加温室模型
function greenhouseModel(){
    FARM.greenhouse.forEach((item)=>{
        loadModel(viewer,{
            url: '/models/greenhouse.glb',
            lon: item.lon,
            lat: item.lat,
            heading: 45,
            scale: 100
        })
    })
}

//加载监控模型
function monitorModel() {
    getMonitors().then((res:Monitor[])=>{
        res.forEach((item)=>{
            loadModel(viewer,
                {
                    url: 'models/monitor.glb',
                    lon: item.lon,
                    lat: item.lat,
                    heading: -45,
                    scale: 30,
                    height: -8
                },
                (entity) => {
                    if (entity.model) {
                        const monitorStatusColor =
                        FARM.monitorStatus.find((monitor) => monitor.status === item.status)?.color ||
                        Cesium.Color.WHITE
                        const monitorStatusTitle =
                        FARM.monitorStatus.find((monitor) => monitor.status === item.status)?.title || ''
                        const monitorIsDialog =
                        FARM.monitorStatus.find((monitor) => monitor.status === item.status)?.isDialog ||
                        false

                        entity.model.silhouetteColor = new Cesium.ConstantProperty(monitorStatusColor)
                        entity.model.silhouetteSize = new Cesium.ConstantProperty(1)
                        entity.monitorStatusTitle = monitorStatusTitle
                        entity.monitorIsDialog = monitorIsDialog
                        entity.monitorName = item.name
                        entity.monitorInfos = item.infos
                    }
                }
            )
        })
    })
}

function minSoilRange(key: string):number {
    const ret = SOIL_RANGE.find((item) => {
        item.key === key
    })
    
    return ret?.range[0] ?? 0
}

function maxSoilRange(key:string):number {
    const ret = SOIL_RANGE.find((item) => {
        item.key === key
    })
    
    return ret?.range[1] ?? 0
}

function outSoilRange( value:number ,key:string): boolean{
    const min = minSoilRange(key)
    const max = maxSoilRange(key)
    return value < min || value > max
}

function clampedValue(value:number , key:string): number{
    const min = minSoilRange(key)
    const max = maxSoilRange(key)
    return Math.max(min , Math.min(max, value))
}

//鼠标移入
function toMouseMove(){
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((e:Cesium.ScreenSpaceEventHandler.MotionEvent)=>{
        const pick = viewer.scene.pick(e.endPosition)
        const tooltipTitle = pick?.id?.monitorStatusTitle || pick?.id?.cropBillboardTitle
        const areaEntity = pick?.id?.areaEntity

        if(areaEntity){
            areaEntity.polygon.material = new Cesium.ColorMaterialProperty(
                Cesium.Color.fromCssColorString(areaEntity.areaColor).withAlpha(0.7)
            )
        }else{
            viewer.entities.values.forEach((entity)=>{
                if(entity.areaColor && entity.polygon) {
                    entity.polygon.material = new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromCssColorString(entity.areaColor).withAlpha(0.3)
                    )
                }
            })
        }

        if(tooltipTitle) {
            tooltip.show(e.endPosition.x, e.endPosition.y, tooltipTitle)
            viewer.canvas.style.cursor = 'pointer'
        } else {
            tooltip.hide()
            viewer.canvas.style.cursor = 'default'
        }
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE)
}

//双击效果
function toDubleClick() {
    //移除默认双击效果
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((e: Cesium.ScreenSpaceEventHandler.PositionedEvent)=>{
        const pick = viewer.scene.pick(e.position)
        const monitorIsDialog = pick?.id?.monitorIsDialog
        const cropId = pick?.id?.cropId

        if(cropId){
            router.push(`/detail/${cropId}`)
        }

        if(monitorIsDialog){
            dialogVisible.value = true
            monitorName.value = pick.id.monitorName
            monitorInfos.value = pick.id.monitorInfos
        }
    },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}

//添加农作物实体
function cropEntity(){
    getCrops().then((res:Crop[])=>{
        res.forEach((item)=>{
            const height = FARM.cropType.find((crop)=>{
                crop.type === item.type
            })?.height || 100

            const billboardImg = FARM.cropType.find((crop) => {
                crop.type === item.type
            })?.img || ''

            const areaColor = FARM.cropType.find((crop)=> {
                crop.type === item.type
            })?.color || '#ffffff'

            const name = item.name.slice(0,2)
            const areaSize = cropArea[name]

            if(areaSize){
                cropArea[name] = areaSize + item.areaSize
            }else{
                cropArea[name] = item.areaSize
            }
            
            const areaEntity = viewer.entities.add({
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(item.area),
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromCssColorString(areaColor).withAlpha(0.3)
                    )
                }
            })
            areaEntity.areaColor = areaColor

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, height - 30),
                cylinder: {
                    length: 30,
                    topRadius: new Cesium.CallbackProperty(() => {
                        const time = new Date().getTime() * 0.002
                        return 10 + Math.abs(Math.sin(time)) * 5
                    }, false),
                    bottomRadius: 1.0,
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromCssColorString('#c8ff6f').withAlpha(0.6),
                    ),
                    outline: false,
                },
            })

            const billboardEntity = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(item.lon,item.lat,height),
                billboard: {
                    image: billboardImg,
                    width: new Cesium.CallbackProperty(()=>{
                        const time = new Date().getTime() * 0.002
                        return 10 + Math.abs(Math.sin(time)) * 10
                    },false)
                }
            })

            billboardEntity.areaEntity = areaEntity
            billboardEntity.cropBillboardTitle = `${item.name}(双击查看详情)`
            billboardEntity.cropId = item.id
        })
    })
}

//无人机飞行
function droneFlight(){
    let droneEntity: Cesium.Entity
    const emitterModelMatrix = new Cesium.Matrix4()
    const translation = new Cesium.Cartesian3()
    const rotation = new Cesium.Quaternion()
    let hpr = new Cesium.HeadingPitchRoll()
    const trs = new Cesium.TranslationRotationScale()

    function computeEmitterModelMatrix(){
        hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, -90.0, 0.0, hpr)
        trs.translation = Cesium.Cartesian3.fromElements(-20.0, 0.0, -5.0, translation)
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation)
        return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix)
    }

    getRoutes().then((res: Route[]) =>{
        const timeStepInSeconds = 10
        const totalSeconds = timeStepInSeconds * (res.length - 1)
        const start = Cesium.JulianDate.fromIso8601('2024-01-01T00:00:00Z')
        const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())

        viewer.clock.startTime = start.clone()
        viewer.clock.stopTime = stop.clone()
        viewer.clock.currentTime = start.clone()
        viewer.clock.multiplier = 5
        viewer.clock.shouldAnimate = DRONE.isFlyOpen

        const positionProperty = new Cesium.SampledPositionProperty()

        for(let i = 0; i < res.length; i++){
            const dataPotion = res[i]
            const time = Cesium.JulianDate.addSeconds(
                start,
                i * timeStepInSeconds,
                new Cesium.JulianDate()
            )
            const position = Cesium.Cartesian3.fromDegrees(
                dataPotion?.longitude as number,
                dataPotion?.latitude as number,
                dataPotion?.height as number
            )
            positionProperty.addSample(time, position)
        }

        droneEntity = viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start, stop})]),
            position: positionProperty,
            model: {
                uri: '/models/drone.glb',
                scale: 15,
                minimumPixelSize: 64,
            },
            orientation: new Cesium.VelocityOrientationProperty(positionProperty),
            viewFrom: new Cesium.Cartesian3(0, -100, 100)
        })
    })

    if(DRONE.isPesticideOpen){
        const particleSystem = viewer.scene.primitives.add(
            new Cesium.ParticleSystem({
                image: smoke,
                imageSize: new Cesium.Cartesian2(5 ,5),
                emissionRate: 5,
                minimumParticleLife: 3.2,
                maximumParticleLife: 8.2,
                minimumSpeed: 0.2,
                maximumSpeed: 1,
                startScale: 1,
                endScale: 4,
                emitter: new Cesium.CircleEmitter(2),
                emitterModelMatrix: computeEmitterModelMatrix(),
                lifetime: 16,
            })
        )

        viewer.scene.preUpdate.addEventListener((Scene, time)=>{
            if(droneEntity){
                particleSystem.modelMatrix = droneEntity.computeModelMatrix(time, new Cesium.Matrix4())
                particleSystem.emitterModelMatrix = computeEmitterModelMatrix()
            }
        })
    }
}

onMounted(()=>{
    viewer = initCesium('map')

    lockPosition(viewer, {
        lon: FARM.lon,
        lat: FARM.lat,
        heading: 45
    })

    mapLoaded(viewer, () => {
        loading.value = false
  })

  setWallEntity()
  showFarmRange()
  greenhouseModel()
  monitorModel()
  toMouseMove()
  toDubleClick()
  cropEntity()
  droneFlight()
})

</script>

<style scoped>
#map {
    position: absolute;
    inset: 0;
}

.chart-aside {
    position: absolute;
    right: 1vw;
    top: 4.7vw;
    width: 16vw;
    height: calc(100vh - 4.7vw);
    display: flex;
    flex-direction: column;
    gap: 1.04vw;
}

.chart-item {
    flex: 1;
    color: #ededed;
}

.chart-title {
  height: 2vw;
  line-height: 1.8vw;
  padding-left: 2vw;
  background-image: url('@/assets/images/title_bg.png');
  background-size: cover;
}

.weather,
.greenhouse {
    height: calc(100% - 2vw);
    display: grid;
    grid-template-columns: repeat(3,1fr);
    grid-template-rows: repeat(2,auto);
    gap: 0.8vw;
    padding: 0.2vw;
    margin-top: 0.5vw;
    font-size: 0.6vw;
}

.weather-item,
.greenhouse-item {
    display: flex;
    background-color: #137e5a2c;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    border-radius: 0.5vw;
}

.alarm li {
  margin-top: 0.5vw;
  font-size: 0.7vw;
  padding: 0.4vw;
  background-color: #137e5a2c;
  border-radius: 0.4vw;
}

.drone {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: calc(100% - 2vw);
}
.drone-item {
  display: flex;
  align-items: center;
}
.cropArea,
.producHistory {
  height: calc(100% - 2vw);
}
</style>