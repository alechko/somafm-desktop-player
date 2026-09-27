import { invoke } from '@tauri-apps/api/core'
import { call, inTauri } from './tauri'

// Playback runs natively so the player can use its own output device

export type OutputDevice = {
  id: string
  name: string
  isDefault: boolean
}

export const listOutputDevices = async (): Promise<OutputDevice[]> =>
  inTauri ? invoke<OutputDevice[]>('list_output_devices') : []

export const playStream = (url: string) => call('player_play', { url })

export const stopStream = () => call('player_stop')

export const setPlayerVolume = (volume: number) => call('player_set_volume', { volume })

// No device follows the system default output
export const setPlayerDevice = (device: string | undefined) =>
  call('player_set_device', { device: device ?? null })
