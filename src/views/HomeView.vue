<template>
    <div id="map" v-loading="loading"></div>
    <HeaderCom title="智慧农业可视化平台"></HeaderCom>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium'
import { onMounted, ref } from 'vue';



import { lockPosition, mapLoaded ,initCesium } from '@/utils';
import { FARM } from '@/configs/Farm';

//组件
import HeaderCom from '@/components/HeaderCom.vue';

let viewer: Cesium.Viewer
const loading = ref(false)


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
</style>