<template>
  <div id="cesiumContainer" v-loading="loading"></div>
  <header-com :title="headerTitle"></header-com>
  <div class="nav">
    <div class="nav-back" @click="handleBackHome">
      <el-icon class="nav-back-arrow">
        <arrow-left-bold></arrow-left-bold>
      </el-icon>
    </div>
    <div class="nav-btns">
      <div
        v-for="(crop, index) in crops"
        :class="{ active: Number(id) === crop.id }"
        :key="crop.id"
        :style="getOffsetStyle(index)"
        @click="handleChangeArea(crop.id)"
      >
        {{ crop.name }}
      </div>
    </div>
  </div>
  <div class="chart-aside">
    <div class="chart-item">
      <div class="chart-title">灌溉监测</div>
      <div class="irrigate">
        <div class="irrigate-item">
          <img :src="monitor" alt="" />
          当前监控设备：{{ monitorStatusValue }}
        </div>
        <div class="irrigate-item">
          <img :src="irrigate" alt="" />
          当前灌溉设备：{{ irrigateStatusValue }}
        </div>
        <div class="irrigate-item">
          <img :src="moist" alt="" />
          当前土壤湿度：{{ moistInfo.value ?? '暂无' }} {{ moistInfo.unit }}
        </div>
      </div>
    </div>
    <div class="chart-item">
      <div class="chart-title">健康指数</div>
      <div class="health">
        <HealthIndex :value="healthIndex" />
      </div>
    </div>
    <div class="chart-item">
      <div class="chart-title">生长阶段</div>
      <div class="growth">
        <GrowthStage :data="GROWTH_STAGE.find((item) => item.key === cropType)?.data || []" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium'
import * as turf from "@turf/turf"
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useRoute , useRouter } from 'vue-router';

import HeaderCom from '@/components/HeaderCom.vue';
import HealthIndex from '@/components/HealthIndex.vue';
import GrowthStage from '@/components/GrowthStage.vue';

import { getCrops , getCrop , getMonitor } from '@/api';
import type { Crop, Monitor, MonitorInfo } from '@/interface';

import { GROWTH_STAGE } from '@/configs/GrowthStage';

import monitor from '@assets/images/monitor.png'
import irrigate from '@assets/images/irrigate.png'
import moist from '@assets/images/moist.png'
import water from '@assets/images/water.png'

import { expandRange, initCesium, lockPosition, mapLoaded } from '@utils/index'

import type { Position } from 'geojson'

let viewer: Cesium.Viewer
let rangeEntity: Cesium.Entity
let waterParticleSystem: Cesium.ParticleSystem
let nozzleEntity: Cesium.Entity
const cropEntities: Cesium.Entity[] = []

const loading = ref(true)
const headerTitle = ref('')
const healthIndex = ref(0)
const cropType = ref('')
const monitorStatusValue = ref('')
const irrigateStatusValue = ref('')
const moistInfo = ref<MonitorInfo>({} as MonitorInfo)

const crops = ref<Crop[]>([])
const route = useRoute()
const router = useRouter()
const id = computed(()=> route.params.id)

watchEffect(async (onCleanup)=>{
    if( id.value ){
        const crop: Crop = await getCrop(Number(id.value))
        const moniter: Monitor = await getMonitor(crop.id)
        headerTitle.value = crop.name
        healthIndex.value = crop.healthIndex
        cropType.value = crop.type

        monitorStatusValue.value = moniter.statusValue
        irrigateStatusValue.value = crop.isIrrigating ? '启动' : '关闭'
        moistInfo.value = moniter.infos.find((item)=> item.key === 'Moist') || {} as MonitorInfo

        lockPosition(viewer, {
            lon: crop.lon,
            lat: crop.lat,
            range: 800
        })

        initAndUpdateRange( crop.area)
        initAndUpateNozzle(crop.lon, crop.lat, crop.isIrrigating)
        addCropModel(crop.area, crop.type)
    }
    onCleanup(()=>{
        removeCropModel()
    })
})

// 初始化并更新范围
function initAndUpdateRange( area: number[]){
    if(!rangeEntity){
        const outRange = expandRange(area, 3)
        rangeEntity = viewer.entities.add({
            polygon:{
                hierarchy: {
                    positions: Cesium.Cartesian3.fromDegreesArray(outRange),
                    holes: [
                        {
                            positions: Cesium.Cartesian3.fromDegreesArray(area),
                            holes: [],
                        }
                    ]
                },
                material: Cesium.Color.fromCssColorString('#081c2c').withAlpha(0.5)
            }
        })
    }
    else {
        const outRange = expandRange(area, 3)
        rangeEntity.polygon!.hierarchy = new Cesium.ConstantProperty(
            new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(outRange),
                [
                    new Cesium.PolygonHierarchy(
                        Cesium.Cartesian3.fromDegreesArray(area),
                        []
                    )
                ]
            )
        )
    }
}

//添加农作物模型
function addCropModel( area: number[], type: string ) {
    const coords: Position[] = []
    for(let i = 0; i < area.length; i += 2){
        coords.push([area[i]!, area[i + 1]!])
    }
    coords.push(coords[0]!)

    const lons = area.filter((_,i)=> i % 2 === 0)
    const lats = area.filter((_,i)=> i % 2 === 1)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    const step = 0.0005
    const areaPolygon = turf.polygon([coords])

    for(let lon = minLon; lon <= maxLon; lon += step){
        for(let lat = minLat; lat <= maxLat; lat += step){
            const point  = turf.point([lon, lat])
            if(turf.booleanPointInPolygon(point, areaPolygon)){
                const cropEntity = viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
                    model: {
                        uri: `/models/${type}.glb`,
                        scale: 5
                    }
                })
                cropEntities.push(cropEntity)
            }
        }
    }
}

// 移除农作物模型
function removeCropModel(){
    cropEntities.forEach((item) => viewer.entities.remove(item))
    cropEntities.length = 0
}

// 初始化并更新喷头
function initAndUpateNozzle(lon: number, lat: number, isIrrigating: boolean){
    if(waterParticleSystem){
        viewer.scene.primitives.remove(waterParticleSystem)
    }
    if(!nozzleEntity){
        nozzleEntity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            model: {
                uri: '/models/nozzle.glb',
                scale: 5
            }
        })
    }
    else {
        nozzleEntity.position = new Cesium.ConstantPositionProperty(
            Cesium.Cartesian3.fromDegrees(lon, lat, 100)
        )
    }
    const position = Cesium.Cartesian3.fromDegrees(lon, lat, 100)
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position)
    waterParticleSystem = viewer.scene.primitives.add(
        new Cesium.ParticleSystem({
            image: water,
            emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(60)),
            emitterModelMatrix: modelMatrix,
            bursts: [
                new Cesium.ParticleBurst({
                    time: 0,
                    minimum: 20,
                    maximum: 30
                })
            ],
            emissionRate: 30,
            speed: 100,
            minimumParticleLife: 1,
            maximumParticleLife: 3,
            lifetime: 3,
            imageSize: new Cesium.Cartesian2(23, 23),
            color: Cesium.Color.WHITE.withAlpha(0.7)
        })
    )
    viewer.clock.shouldAnimate = isIrrigating
}

function getOffsetStyle(index: number){
    const center = (crops.value.length - 1) / 2
    const offset = Math.abs(index - center)
    return {
        transform: `translateX(${-Math.pow(offset,2) * 0.5}vw)`
    }
}

function handleChangeArea(id: number){
    router.push(`/detail/${id}`)
}

function handleBackHome(){
    router.push('/')
}

onMounted(async ()=>{
    viewer = initCesium('cesiumContainer')

    mapLoaded(viewer,()=>{
        loading.value = false
    })

    getCrops().then((res:Crop[])=>{
        crops.value = res
    })
})

onUnmounted(()=>{
    if(viewer){
        viewer.destroy()
    }
})
</script>

<style scoped>
#cesiumContainer {
  position: absolute;
  inset: 0;
}

.nav {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  width: 15vw;
  height: 64vh;
  color: #ededed;
}

.nav-back {
  position: absolute;
  top: 50%;
  left: -24vw;
  transform: translateY(-50%);
  width: 30vw;
  height: 30vw;
  background: radial-gradient(circle, #2e7d3266 0%, #80ce7566 100%);
  border-radius: 50%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 2vw;
  font-size: 2vw;
  cursor: pointer;
}

.nav-btns {
  position: absolute;
  right: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.nav-btns div {
  cursor: pointer;
  border-left: 0.3vw solid #2aee34;
  border-radius: 1vw;
  padding: 0.2vw 0.4vw;
  background: linear-gradient(90deg, #2e7d32 0%, transparent 100%);
}

.nav-btns div:hover,
.nav-btns div.active {
  background: linear-gradient(90deg, #80ce75 0%, transparent 100%);
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

.irrigate {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: calc(100% - 2vw);
}

.irrigate-item {
  display: flex;
  align-items: center;
}

.health,
.growth {
  height: calc(100% - 2vw);
}
</style>