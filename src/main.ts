import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routers/index.ts'
import * as Cesium from 'cesium'
import type { MonitorInfo } from './interface/index.ts'
import { CESIUM_ACCESS_TOKEN, CESIUM_BASE_URL } from './configs/CesiumBase.ts'

declare global {
    interface Window {
        CESIUM_BASE_URL: string
    }
}

declare module 'cesium' {
    interface Entity {
        monitorStatusTitle?: string
        monitorIsDialog?: boolean
        monitorName?: string
        monitorInfos?: MonitorInfo[]
        areaColor?: string
        areaEntity?: Cesium.Entity
        cropBillboardTitle?: string
        cropId: number
    }
}

window.CESIUM_BASE_URL = CESIUM_BASE_URL
Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN

createApp(App).use(router).mount('#app')
