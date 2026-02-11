import * as Cesium from 'cesium'

export const FARM = {
    lon: 117.237599,
    lat: 38.469119,
    range: [
        117.238474, 38.478387, 117.249501, 38.469697, 117.238023, 38.460914, 117.227248, 38.469411,
    ],
    greenhouse: [
        { lon: 117.244838, lat: 38.471269 },
        { lon: 117.241122, lat: 38.468457 },
        { lon: 117.237904, lat: 38.465875 },
    ],
    monitorStatus: [
        { status: 0, color: Cesium.Color.GREEN, title: '双击弹出信息', isDialog: true },
        { status: 1, color: Cesium.Color.BLUE, title: '当前设备在维修', isDialog: false },
        { status: 2, color: Cesium.Color.RED, title: '当前设备已故障', isDialog: false },
    ]
}

export const SOIL_RANGE = [
    { key: 'PH', range: [5.5, 7.5] },
    { key: 'EC', range: [200, 1200] },
    { key: 'Temp', range: [10, 30] },
    { key: 'Moist', range: [20, 60] },
    { key: 'P', range: [10, 40] },
    { key: 'K', range: [100, 250] },
]