export type PositionOptions = {
    lon: number
    lat: number
    height?: number
    heading?: number
    pitch?: number
    range?: number
}

export type ModelOptions = {
    url: string
    lon: number
    lat: number
    heading?: number
    pitch?: number
    roll?: number
    height?: number
    scale?: number
}

export type MonitorInfo = {
    key: string
    label: string
    value: number
    unit: string
}

export type Monitor = {
    id: number
    name: string
    lon: number
    lat: number
    status: 0 | 1 | 2
    statusValue: '正常' | '维修' | '故障'
    infos: MonitorInfo[]
}

export type Crop = {
    id: number
    monitorId: number
    type: string
    name: string
    lon: number
    lat: number
    area: number[]
    areaSize: number
    isIrrigating: boolean
    healthIndex: number
}

export type ProducSeries = {
    name: string
    color: string
    data: number[]
}

export type ProducData = {
    years: number[]
    series: ProducSeries[]
}

export type Route = {
    id: number
    longitude: number
    latitude: number
    height: number
}
