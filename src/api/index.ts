import { id } from "element-plus/es/locales.mjs"

const host = 'http://localhost:3000'

export const getMonitors = async () => {
    const res = await fetch(`${host}/monitors`)
    if (!res.ok) {
        throw new Error('error connecttion')
    }
    return res.json()
}

export const getCrops = async () => {
    const res = await fetch(`${host}/crops`)
    if (!res.ok) {
        throw new Error('error to get crops')
    }
    return res.json()
}

export const getRoutes = async () => {
    const res = await fetch(`${host}/routes`)
    if (!res.ok) {
        throw new Error('error to get routes')
    }
    return res.json()
}

export const getCrop = async (id: number) => {
    const res = await fetch(`${host}/crops/${id}`)
    if (!res.ok) {
        throw new Error('error to get crop')
    }
    return res.json()
}

export const getMonitor = async (id: number) => {
    const res = await fetch(`${host}/monitors/${id}`)
    if (!res.ok) {
        throw new Error('error to get monitor')
    }
    return res.json()
}