import { Box, BoxProps, Flex, Icon, IconButton, Select, Spacer } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useMainContext } from '../../lib/context'
import { SortAz, SortZa } from '../icons'

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
            placeholder="Sort by"
            flexGrow={1}
            value={sortBy}
            onChange={v =>
              dispatch({
                type: 'setSortBy',
                payload: v.target.value,
              })
            }
          >
            <option value="title">Title</option>
            <option value="listeners">Listeners</option>
          </Select>
        </Box>
        <Spacer />
        <Box>
          <IconButton
            icon={<Icon as={SortAz} color={sortOrder === 'asc' ? 'red.500' : 'whiteAlpha.400'} />}
            aria-label="Sort Asc"
            variant="ghost"
            onClick={() => {
              dispatch({
                type: 'setSortOrder',
                payload: 'asc',
              })
            }}
          />
          <IconButton
            icon={<Icon as={SortZa} />}
            color={sortOrder === 'desc' ? 'red.500' : 'whiteAlpha.400'}
            aria-label="Sort Desc"
            variant="ghost"
            onClick={() => {
              dispatch({
                type: 'setSortOrder',
                payload: 'desc',
              })
            }}
          />
        </Box>
      </Flex>
    </Box>
  )
}
