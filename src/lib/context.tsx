import _ from 'lodash'
import { createContext, FC, useReducer, Dispatch, useContext } from 'react'
import { getState, saveState } from './storage'

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
  playing: boolean
  volume: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  bgImage: boolean
  bgParty: boolean
}

// type MainContextActions = {
//   play: (data: any) => void
//   stop: () => void
//   setStations: (data: StationType[]) => void
//   setVolume: (volume: number) => void
// }

const sortStations = (
  stations: StationType[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): StationType[] => {
  return _.orderBy(
    stations,
    (o: StationType) => {
      if (sortBy === 'listeners') {
        return Number(o[sortBy])
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return o[sortBy]
    },
    sortOrder
  )
}

const mainReducer = (state: MainStateType, action: any) => {
  switch (action.type) {
    case 'play':
      saveState({ station: action.payload.data.id })
      window.Main.sendMessage('playing', true)
      return {
        ...state,
        station: action.payload.data,
        playing: true,
      }
    case 'stop':
      window.Main.sendMessage('playing', false)
      return {
        ...state,
        playing: false,
        station: null,
      }
    case 'pause':
      window.Main.sendMessage('playing', false)
      return {
        ...state,
        playing: false,
      }
    case 'resume':
      window.Main.sendMessage('playing', true)
      return {
        ...state,
        playing: true,
      }
    case 'setStations':
      // eslint-disable-next-line no-case-declarations
      const localState = getState()
      // eslint-disable-next-line no-case-declarations
      const station =
        localState && localState.station
          ? action.payload.data.find((v: StationType) => v.id === localState.station)
          : null
      // eslint-disable-next-line no-case-declarations
      const playing = !!station
      playing && window.Main.sendMessage('playing', true)
      return {
        ...state,
        station,
        playing: playing,
        volume: localState && localState.volume ? localState.volume : state.volume,
        stations: sortStations(action.payload.data, state.sortBy, state.sortOrder),
      }
    case 'sortStations':
      return {
        ...state,
        stations: sortStations(state.stations, action.payload.sortBy, action.payload.sortOrder),
      }
    case 'setVolume':
      saveState({ volume: action.payload })
      return {
        ...state,
        volume: action.payload,
      }
    case 'setSortBy':
      return {
        ...state,
        sortBy: action.payload,
      }
    case 'setSortOrder':
      return {
        ...state,
        sortOrder: action.payload,
      }
    case 'setBgImage':
      saveState({ bgImage: action.payload })
      return {
        ...state,
        bgImage: action.payload,
      }
    case 'setBgParty':
      saveState({ bgParty: action.payload })
      return {
        ...state,
        bgParty: action.payload,
      }
    default:
      return state
  }
}

const localState = getState()

const initState: MainStateType = {
  stations: [],
  station: null,
  volume: localState && localState.volume ? localState.volume : 0.5,
  playing: false,
  sortBy: 'listeners',
  sortOrder: 'desc',
  bgImage: localState && typeof localState.bgImage !== 'undefined' ? localState.bgImage : true,
  bgParty: localState && typeof localState.bgParty !== 'undefined' ? localState.bgParty : true,
}
export const MainContext = createContext<{ state: MainStateType; dispatch: Dispatch<any> }>({
  state: initState,
  dispatch: () => null,
})

export const useMainContext = () => useContext(MainContext)

export const MainProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initState)
  return <MainContext.Provider value={{ state, dispatch }}>{children}</MainContext.Provider>
}
