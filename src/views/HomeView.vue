<template>
    <div id="map" v-loading="loading"></div>
    <HeaderCom title="智慧农业可视化平台"></HeaderCom>
    <el-dialog ></el-dialog>

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
                    <img src="" alt="">
                    <span>{{ item.name }}</span>
                    <span>{{ item.value }}</span>
                </div>
            </div>
        </div>
        <div class="chart-item">
            <div class="chart-title">温室大棚</div>
            <div class="greenhouse">
                <div v-for="item in GREENHOUSE" :key="item.id" class="greenhouse-item">
                    <img src="" alt="" />
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
                <img src="" alt="" />
                当前无人机：{{ DRONE.isFlyOpen ? '启动' : '关闭' }}
                </div>
                <div class="drone-item">
                <img src="" alt="" />
                当前喷洒农药：{{ DRONE.isPesticideOpen ? '启动' : '关闭' }}
                </div>
                <div class="drone-item">
                <img src="" alt="" />
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

//工具和设置
import { lockPosition, mapLoaded ,initCesium } from '@/utils';
import { FARM } from '@/configs/Farm';

import { WEATHER } from '@/configs/Weather';
import { GREENHOUSE } from '@/configs/Greenhouse';
import { ALARM } from '@/configs/Alarm';
import { DRONE } from '@/configs/Drone'
import { PRODUC } from '@/configs/Product';

//组件
import HeaderCom from '@/components/HeaderCom.vue';
import CropArea from '@/components/CropArea.vue';


let viewer: Cesium.Viewer
const loading = ref(false)

const cropArea = reactive<Record<string, number>>({})

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
</style>