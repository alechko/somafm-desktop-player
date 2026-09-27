import { fireEvent, render } from '@testing-library/react'
import { MainContext, StationType } from '../../lib/context'
import { Controls } from './controls'

const groove = { id: 'groovesalad', title: 'Groove Salad' } as StationType
const drone = { id: 'dronezone', title: 'Drone Zone' } as StationType

const renderControls = (state: object) => {
  const dispatch = jest.fn()
  const value = {
    state: {
      stations: [groove, drone],
      station: null,
      playing: false,
      volume: 0.5,
      device: undefined,
      sortBy: 'listeners',
      sortOrder: 'desc' as const,
      bgImage: true,
      bgParty: true,
      favs: [],
      ...state,
    },
    dispatch,
  }
  const utils = render(
    <MainContext.Provider value={value}>
      <Controls />
    </MainContext.Provider>
  )
  return { ...utils, dispatch }
}

test('controls should render', () => {
  render(<Controls />)
})

test('pause keeps the current station', () => {
  const { getByLabelText, dispatch } = renderControls({ station: drone, playing: true })
  fireEvent.click(getByLabelText('Pause'))
  expect(dispatch).toHaveBeenCalledWith({ type: 'pause' })
})

test('play resumes the last station', () => {
  const { getByLabelText, dispatch } = renderControls({ station: drone, playing: false })
  fireEvent.click(getByLabelText('Play'))
  expect(dispatch).toHaveBeenCalledWith({ type: 'play', payload: { data: drone } })
})

test('play picks a random station when nothing has played yet', () => {
  const { getByLabelText, dispatch } = renderControls({ station: null, playing: false })
  fireEvent.click(getByLabelText('Play'))
  const [action] = dispatch.mock.calls.find(([a]) => a.type === 'play')!
  expect([groove, drone]).toContain(action.payload.data)
})
