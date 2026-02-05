import * as Cesium from 'cesium'
// import type { PositionOptions, ModelOptions } from '@/interface'

export function initCesium(containerId: string): Cesium.Viewer {
    const Viewer = new Cesium.Viewer(containerId, {


        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        terrain: Cesium.Terrain.fromWorldTerrain(),
        infoBox: false,
        selectionIndicator: false,
    })

    const baseLayerPicker = Viewer.baseLayerPicker.container as HTMLElement
    baseLayerPicker.style.display = 'none'

    const creditContainer = Viewer.cesiumWidget.creditContainer as HTMLElement
    creditContainer.style.display = 'none'

    const fullscreenButton = Viewer.fullscreenButton.container as HTMLDivElement
    fullscreenButton.style.top = '5px'
    fullscreenButton.style.right = '5px'
    fullscreenButton.style.zIndex = '100'

    return Viewer
}

//锁定视角


// 监听底图加载完成
export function mapLoaded(viewer: Cesium.Viewer, cb: () => void) {
    viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining: number) => {
        if (remaining === 0) {
            cb()
        }
    })
}