import { useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { useMainContext } from '../../lib/context'
import { getStationUrl } from '../../lib/somafm'

export const Player = () => {
  const {
    state: { playing, volume, station, device },
  } = useMainContext()

  const player = useRef<ReactPlayer>(null)

  useEffect(() => {
    if (device) {
      changeDevice()
    }
  }, [device])

  const changeDevice = () => {
    if (device && player.current) {
      const audioEl = player.current.getInternalPlayer()
      audioEl.setSinkId(device)
    }
  }

  if (!playing || !station) {
    return <></>
  }
  const stationUrl = getStationUrl(station.id)
  return (
    <ReactPlayer
      ref={player}
      height={0}
      width={0}
      // url="https://ice2.somafm.com/dronezone-256-mp3"
      url={stationUrl}
      volume={volume}
      playing={playing}
      onReady={changeDevice}
      config={{
        file: {
          forceAudio: true,
        },
      }}
    />
  )
}
