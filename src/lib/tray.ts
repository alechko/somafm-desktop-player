import { listen } from '@tauri-apps/api/event'
import { useEffect, useRef } from 'react'
import { OutputDevice } from './audio'
import { StationType } from './context'
import { call, inTauri } from './tauri'

// The tray menu is built natively (src-tauri/src/tray.rs); this keeps it in sync
// with the player and handles its clicks

type TrayState = {
  playing: boolean
  station: StationType | null
  favorites: StationType[]
  devices: OutputDevice[]
  device: string | undefined
}

type TrayActions = {
  toggle: () => void
  next: () => void
  prev: () => void
  playStation: (id: string) => void
  setDevice: (id: string | undefined) => void
}

type TrayAction =
  | { type: 'toggle' | 'next' | 'prev' }
  | { type: 'playStation'; id: string }
  | { type: 'setDevice'; id: string | null }

export const useTrayMenu = (
  { playing, station, favorites, devices, device }: TrayState,
  actions: TrayActions
) => {
  // The listener is registered once, so it reads the latest handlers through a ref
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    if (!inTauri) return
    const unlisten = listen<TrayAction>('tray-action', ({ payload }) => {
      const a = actionsRef.current
      switch (payload.type) {
        case 'toggle':
          return a.toggle()
        case 'next':
          return a.next()
        case 'prev':
          return a.prev()
        case 'playStation':
          return a.playStation(payload.id)
        case 'setDevice':
          return a.setDevice(payload.id ?? undefined)
      }
    })
    return () => {
      unlisten.then(stop => stop())
    }
  }, [])

  useEffect(() => {
    call('tray_update', {
      state: {
        playing,
        station: station ? station.id : null,
        favorites: favorites.map(({ id, title }) => ({ id, title })),
        devices: devices.map(({ id, name }) => ({ id, name })),
        device: device ?? null,
      },
    }).catch(e => console.error(e))
  }, [playing, station, favorites, devices, device])
}
