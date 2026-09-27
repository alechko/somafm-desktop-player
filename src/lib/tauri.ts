import { invoke } from '@tauri-apps/api/core'

// Outside the Tauri shell (e.g. in tests) there is no backend to call
export const inTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export const call = async (command: string, args?: Record<string, unknown>): Promise<void> => {
  if (inTauri) await invoke(command, args)
}
