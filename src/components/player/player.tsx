import { useContext } from 'react'
import ReactPlayer from 'react-player'
import { MainContext } from '../../lib/context'
import { getStationUrl } from '../../lib/somafm'

export const Player = () => {
  const {
    state: { volume, station },
  } = useContext(MainContext)
  if (!station) {
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
      playing
      config={{
        file: {
          forceAudio: true,
        },
      }}
    />
  )
}
