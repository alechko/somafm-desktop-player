import ReactPlayer from 'react-player'
import { useMainContext } from '../../lib/context'
import { getStationUrl } from '../../lib/somafm'

export const Player = () => {
  const {
    state: { playing, volume, station },
  } = useMainContext()

  if (!playing || !station) {
    return <></>
  }
  const stationUrl = getStationUrl(station.id)
  return (
    <ReactPlayer
      height={0}
      width={0}
      // url="https://ice2.somafm.com/dronezone-256-mp3"
      url={stationUrl}
      volume={volume}
      playing={playing}
      config={{
        file: {
          forceAudio: true,
        },
      }}
    />
  )
}
