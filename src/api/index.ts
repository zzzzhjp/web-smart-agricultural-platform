const host = 'http://localhost:3000'

export const getMonitors = async () => {
    const res = await fetch(`${host}/monitors`)
    if (!res.ok) {
        throw new Error('error connecttion')
    }
    return res.json()
}