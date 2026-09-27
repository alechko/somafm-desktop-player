import { Box, BoxProps, Flex, Icon, IconButton, Select, Spacer } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useMainContext } from '../../lib/context'
import { SortAsc, SortDesc } from '../common/icons'

export const Filter = (props: BoxProps) => {
  const {
    state: { sortBy, sortOrder },
    dispatch,
  } = useMainContext()

  useEffect(() => {
    dispatch({
      type: 'sortStations',
      payload: {
        sortBy,
        sortOrder,
      },
    })
  }, [sortBy, sortOrder])

  return (
    <Box {...props} w="full">
      <Flex>
        <Box>
          <Select
            flexGrow={1}
            value={sortBy}
            onChange={v =>
              dispatch({
                type: 'setSortBy',
                payload: v.target.value,
              })
            }
          >
            <option value="" disabled>
              Sort by
            </option>
            <option value="title">Title</option>
            <option value="listeners">Listeners</option>
          </Select>
        </Box>
        <Spacer />
        <Box>
          <IconButton
            icon={<Icon as={sortOrder === 'asc' ? SortAsc : SortDesc} color="whiteAlpha.600" />}
            aria-label={`Sort ${sortOrder === 'asc' ? 'desc' : 'asc'}`}
            onClick={() => {
              dispatch({
                type: 'setSortOrder',
                payload: sortOrder === 'asc' ? 'desc' : 'asc',
              })
            }}
          />
        </Box>
      </Flex>
    </Box>
  )
}
