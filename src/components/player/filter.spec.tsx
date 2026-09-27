import { render } from '@testing-library/react'
import { Filter } from './filter'

test('filter should render', () => {
  render(<Filter />)
})

test('"Sort by" option should not be selectable', () => {
  const { getByRole } = render(<Filter />)
  expect(getByRole('option', { name: 'Sort by' })).toBeDisabled()
})
