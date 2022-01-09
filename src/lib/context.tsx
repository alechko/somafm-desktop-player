import _ from 'lodash'
import { createContext, FC, useReducer, Dispatch } from 'react'
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
      return {
        ...state,
        station: action.payload.data,
        playing: true,
      }
    case 'stop':
      return {
        ...state,
        playing: false,
      }
    case 'setStations':
      // eslint-disable-next-line no-case-declarations
      const localState = getState()
      return {
        ...state,
        station: localState
          ? action.payload.data.find((v: StationType) => v.id === localState.station)
          : null,
        playing: true,
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
    default:
      return state
  }
}

const initState: MainStateType = {
  stations: [],
  station: null,
  volume: 0.5,
  playing: false,
  sortBy: 'title',
  sortOrder: 'asc',
}
export const MainContext = createContext<{ state: MainStateType; dispatch: Dispatch<any> }>({
  state: initState,
  dispatch: () => null,
})

export const MainProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initState)
  return <MainContext.Provider value={{ state, dispatch }}>{children}</MainContext.Provider>
}
