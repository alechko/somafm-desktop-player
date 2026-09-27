import { useEffect } from 'react'
import { playStream, setPlayerDevice, setPlayerVolume, stopStream } from '../../lib/audio'
import { useMainContext } from '../../lib/context'
import { getStationUrl } from '../../lib/somafm'

// Drives the native player; renders nothing
export const Player = () => {
  const {
    state: { playing, volume, station, device },
  } = useMainContext()

  // Device and volume effects run first so a restored station starts on the right output
  useEffect(() => {
    setPlayerDevice(device).catch(e => console.error(e))
  }, [device])

  useEffect(() => {
    setPlayerVolume(volume).catch(e => console.error(e))
  }, [volume])

  const stationId = station ? station.id : null
  useEffect(() => {
    const action = playing && stationId ? playStream(getStationUrl(stationId)) : stopStream()
    action.catch(e => console.error(e))
  }, [playing, stationId])

  return null
}
