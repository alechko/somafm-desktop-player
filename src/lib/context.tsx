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
  fav: boolean
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
  favs: string[]
}

const sortStations = (
  stations: StationType[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): StationType[] => {
  return _.orderBy(stations, ['fav', sortBy], ['desc', sortOrder])
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
      // eslint-disable-next-line no-case-declarations
      const stations = action.payload.data.map((s: StationType) => {
        const fav =
          localState &&
          typeof localState.favs !== 'undefined' &&
          localState.favs.indexOf(s.id) !== -1
        return {
          ...s,
          title: s.title.charAt(0).toUpperCase() + s.title.slice(1),
          listeners: Number(s.listeners),
          fav,
        }
      })
      return {
        ...state,
        station,
        playing: playing,
        volume: localState && localState.volume ? localState.volume : state.volume,
        stations: sortStations(stations, state.sortBy, state.sortOrder),
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
      saveState({ sortBy: action.payload })
      return {
        ...state,
        sortBy: action.payload,
      }
    case 'setSortOrder':
      saveState({ sortOrder: action.payload })
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
    case 'toggleFavorite':
      // eslint-disable-next-line no-case-declarations
      const favs = _.xor(state.favs, [action.payload])
      saveState({ favs })
      // eslint-disable-next-line no-case-declarations
      const i = _.findIndex(state.stations, { id: action.payload })
      if (i !== -1) {
        state.stations[i].fav = !state.stations[i].fav
      }
      return {
        ...state,
        stations: sortStations(state.stations, state.sortBy, state.sortOrder),
        favs,
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
  sortBy: localState && typeof localState.sortBy !== 'undefined' ? localState.sortBy : 'listeners',
  sortOrder:
    localState && typeof localState.sortOrder !== 'undefined' ? localState.sortOrder : 'desc',
  bgImage: localState && typeof localState.bgImage !== 'undefined' ? localState.bgImage : true,
  bgParty: localState && typeof localState.bgParty !== 'undefined' ? localState.bgParty : true,
  favs: localState && typeof localState.favs !== 'undefined' ? localState.favs : [],
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
