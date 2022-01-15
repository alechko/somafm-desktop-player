import { render } from '@testing-library/react'
import { SongCard } from './song-card'

const songMock = {
  title: 'Babylon Sisters',
  artist: 'Steely Dan',
  album: 'Citizen 1972-1980',
  albumart: '',
  date: 1642256775,
}

test('song card should render', () => {
  render(<SongCard song={songMock} current={false} />)
})
