import * as Cesium from 'cesium'
import type { PositionOptions, ModelOptions } from '@/interface'

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
export function lockPosition(viewer: Cesium.Viewer, positionOptions: PositionOptions): void {
    const { lon, lat, height = 0, heading = 0, pitch = -30, range = 2000 } = positionOptions
    viewer.camera.lookAt(
        Cesium.Cartesian3.fromDegrees(lon, lat, height),
        new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(heading),
            Cesium.Math.toRadians(pitch),
            range,
        )
    )
}


// 监听底图加载完成
export function mapLoaded(viewer: Cesium.Viewer, cb: () => void) {
    viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining: number) => {
        if (remaining === 0) {
            cb()
        }
    })
}