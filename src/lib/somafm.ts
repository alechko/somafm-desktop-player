const baseUrl = 'https://api.somafm.com'
const iceUrl = 'https://ice.somafm.com'

export const getAllStations = async () => {
  const url = `${baseUrl}/channels.json`
  return fetch(url)
    .then(r => r.json())
    .then(r => r)
    .catch(e => console.error(e))
}

export const getStationUrl = (id: string) => {
  const url = `${iceUrl}/${id}`
  return url
}
