import { createApp } from 'vue'
import '@assets/main.css'
import App from './App.vue'
import router from './routers/index.ts'

//scss
import '@assets/variable.scss'

//cesium
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
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

//element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App)
    .use(router)
    .use(ElementPlus)
    .mount('#app')
