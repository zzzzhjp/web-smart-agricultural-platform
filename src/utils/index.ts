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

//扩展范围（矩形）
export function expandRange(range: number[], size: number): number[] {
    let minLon = Infinity
    let maxLon = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    for (let i = 0; i < range.length; i += 2) {
        const lon = range[i] ?? 0
        const lat = range[i + 1] ?? 0
        if (lon < minLon) minLon = lon
        if (lon > maxLon) maxLon = lon
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
    }

    return [
        minLon - size,
        maxLat + size,
        maxLon + size,
        maxLat + size,
        maxLon + size,
        minLat - size,
        minLon - size,
        minLat - size,
    ]
}

//加载3D模型
export function loadModel(
    viewer: Cesium.Viewer,
    modelOptions: ModelOptions,
    cb?: (entity: Cesium.Entity) => void
) {
    const { url, lon, lat, heading = 0, pitch = 0, roll = 0, height = 0, scale = 1 } = modelOptions
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(lon, lat, height),
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading),
            Cesium.Math.toRadians(pitch),
            Cesium.Math.toRadians(roll)
        )
    )
    const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        model: {
            uri: url,
            scale
        },
        orientation,
    })
    if (cb) {
        cb(entity)
    }
}

export const tooltip = {
    element: null as HTMLElement | null,
    offsetTop: 55,
    show(x: number, y: number, text: string) {
        if (!this.element) {
            this.element = document.createElement('div')
            this.element.className = 'monitor-tooltip'
            this.element.innerText = text
            document.body.appendChild(this.element)
        }

        this.element.style.left = x - this.element.offsetWidth / 2 + 'px'
        this.element.style.top = y - this.offsetTop + 'px'
    },
    hide() {
        this.element?.remove()
        this.element = null
    }
}