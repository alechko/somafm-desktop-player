import { listen } from '@tauri-apps/api/event'
import { call, inTauri } from './tauri'

// OS media keys and the system Now Playing controls, handled natively

export type MediaAction = 'play' | 'pause' | 'toggle' | 'next' | 'prev'

export const onMediaAction = (handler: (action: MediaAction) => void) =>
  inTauri
    ? listen<MediaAction>('media-control', event => handler(event.payload))
    : Promise.resolve(() => {})

export const updateNowPlaying = (playing: boolean, title?: string, artist?: string) =>
  call('media_update', { playing, title: title ?? null, artist: artist ?? null })
