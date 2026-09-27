import { Menu } from '@tauri-apps/api/menu'
import { TrayIcon } from '@tauri-apps/api/tray'
import { useEffect, useRef } from 'react'
import { OutputDevice } from './audio'
import { StationType } from './context'
import { inTauri } from './tauri'

const APP_NAME = 'SomaFM Desktop Player'

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

// The tray icon itself is declared in tauri.conf.json; this keeps its menu in sync
export const useTrayMenu = (
  { playing, station, favorites, devices, device }: TrayState,
  actions: TrayActions
) => {
  // Menu callbacks read the latest handlers, not the ones from when the menu was built
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const currentMenu = useRef<Menu | null>(null)

  useEffect(() => {
    if (!inTauri) return
    let cancelled = false
    const run = (fn: (a: TrayActions) => void) => () => fn(actionsRef.current)

    const update = async () => {
      const menu = await Menu.new({
        items: [
          // Named explicitly: in dev the unbundled binary would show its package name
          { text: `About ${APP_NAME}`, item: { About: { name: APP_NAME } } },
          { item: 'Separator' },
          { text: playing ? 'Pause' : 'Play', enabled: !!station, action: run(a => a.toggle()) },
          { text: 'Next Station', enabled: !!station, action: run(a => a.next()) },
          { text: 'Previous Station', enabled: !!station, action: run(a => a.prev()) },
          { item: 'Separator' },
          {
            text: 'Favorites',
            items: favorites.length
              ? favorites.map(({ id, title }) => ({
                  text: title,
                  checked: !!station && station.id === id,
                  action: run(a => a.playStation(id)),
                }))
              : [{ text: 'No favorites yet', enabled: false }],
          },
          {
            text: 'Audio Output',
            items: [{ id: undefined, name: 'System Default' }, ...devices].map(({ id, name }) => ({
              text: name,
              checked: id === device,
              action: run(a => a.setDevice(id)),
            })),
          },
          { item: 'Separator' },
          { item: 'Quit' },
        ],
      })
      if (cancelled) return menu.close()
      const tray = await TrayIcon.getById('main')
      await tray?.setMenu(menu)
      await currentMenu.current?.close()
      currentMenu.current = menu
    }
    update().catch(e => console.error(e))
    return () => {
      cancelled = true
    }
  }, [playing, station, favorites, devices, device])
}
