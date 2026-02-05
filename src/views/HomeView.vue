<template>
    <div id="map"></div>
</template>

<script setup lang="ts">
// import type { MonitorInfo } from '@/interface';
import { mapLoaded } from '@/utils';
import { initCesium } from '@/utils';
import * as Cesium from 'cesium'
import { onMounted, ref } from 'vue';
// import { useRouter } from 'vue-router';

let viewer: Cesium.Viewer
const loading = ref(false)
// const dialogVisible = ref(false)
// const monitorName = ref('')
// const monitorInfos = ref<MonitorInfo[]>([])
// const cropArea = reactive<Record<string,number>>({})
// const router = useRouter()

onMounted(()=>{
    viewer = initCesium('map')

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