import { createContext, FC, useReducer, Dispatch } from 'react'

type PlaylistType = {
  url: string
  format: string
  quality: string
}

export type StationType = {
  id: string
  title: string
  description: string
  dj: string
  djmail: string
  genre: string
  image: string
  largeimage: string
  xlimage: string
  twitter: string
  updated: number
  playlists: PlaylistType[]
  preroll: []
  listeners: number
  lastPlaying: string
}

type MainStateType = {
  stations: StationType[]
  station: StationType | null
  volume: number
}

// type MainContextActions = {
//   play: (data: any) => void
//   stop: () => void
//   setStations: (data: StationType[]) => void
//   setVolume: (volume: number) => void
// }

const mainReducer = (state: MainStateType, action: any) => {
  switch (action.type) {
    case 'play':
      localStorage.setItem('station', action.payload.data.id)
      return {
        ...state,
        station: action.payload.data,
      }
    case 'stop':
      localStorage.removeItem('station')
      return {
        ...state,
        station: null,
      }
    case 'setStations':
      // eslint-disable-next-line no-case-declarations
      let storedData: string | null = null
      if (state.station === null) {
        storedData = JSON.parse(JSON.stringify(localStorage.getItem('station')))
      }
      return {
        ...state,
        station: storedData
          ? action.payload.data.find((v: StationType) => v.id === storedData)
          : null,
        stations: action.payload.data,
      }
    case 'setVolume':
      return {
        ...state,
        volume: action.payload,
      }
    default:
      return state
  }
}

const initState: MainStateType = {
  stations: [],
  station: null,
  volume: 0.5,
  // play: () => {},
  // stop: () => {},
  // setStations: () => {},
  // setVolume: () => {},
}
export const MainContext = createContext<{ state: MainStateType; dispatch: Dispatch<any> }>({
  state: initState,
  dispatch: () => null,
})

export const MainProvider: FC = ({ children }) => {
  // const [state, setState] = useState({
  //   stations: [],
  //   station: null,
  //   volume: 0.5,
  //   play: (data: any) => setState({ ...state, station: data }),
  //   stop: () => setState({ ...state, station: null }),
  //   setStations: (data: any) => setState({ ...state, stations: data }),
  //   setVolume: (volume: number) => console.log(state),
  // })
  const [state, dispatch] = useReducer(mainReducer, initState)
  return <MainContext.Provider value={{ state, dispatch }}>{children}</MainContext.Provider>
}
