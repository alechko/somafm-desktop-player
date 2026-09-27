import axios from 'axios'

const baseUrl = 'https://api.somafm.com'
const iceUrl = 'https://ice.somafm.com'

export const getAllStations = async () => {
  const url = `${baseUrl}/channels.json`
  return axios
    .get(url)
    .then(r => r.data)
    .catch(e => console.error(e))
}

export const getStationUrl = (id: string) => {
  const url = `${iceUrl}/${id}-128-mp3`
  return url
}

export const getSongsList = async (id: string) => {
  const url = `${baseUrl}/songs/${id}.json`
  return axios
    .get(url)
    .then(r => r.data)
    .catch(e => console.error(e))
}
