import { getState, saveState } from './storage'

beforeEach(() => localStorage.clear())

test('a device choice replaces the saved one', () => {
  saveState({ device: 'speakers' })
  saveState({ device: 'headphones' })
  expect(getState().device).toBe('headphones')
})

test('choosing "System Default" replaces a saved device', () => {
  saveState({ device: 'headphones', volume: 0.3 })
  saveState({ device: null })
  expect(getState().device).toBeNull()
  expect(getState().volume).toBe(0.3)
})
