import _ from 'lodash'

type LocalStateType = {
  volume?: number | undefined
  station?: string | undefined
  bgImage?: boolean | undefined
  bgParty?: boolean | undefined
  favs?: string[] | undefined
}

const LOCAL_STATE_KEY = 'somafmdesktopplayer'

export const getState = (): LocalStateType => {
  const state = localStorage.getItem(LOCAL_STATE_KEY)
  return state && JSON.parse(state)
}

export const saveState = (state: LocalStateType): LocalStateType => {
  const localState = getState()
  const newState = _.defaults({}, state, localState)
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(newState))
  return newState
}
