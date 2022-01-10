import { Box, Center, HStack, VStack } from '@chakra-ui/react'
import { useContext } from 'react'
import { MainContext } from '../../lib/context'
import { StationCard } from '../player/station-card'
import { Controls } from '../player/controls'
import { Side } from './side'

export const Home = () => {
  const {
    state: { playing, station },
  } = useContext(MainContext)
  return (
    <Box
      h="full"
      w="full"
      backgroundImage={playing && station ? station.xlimage : ''}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      bgPos="center"
      className="drag"
    >
      <Box h="full" w="full" p={4} className={playing && station ? 'player-overlay' : ''} pt={8}>
        <HStack h="full" spacing={4}>
          <Side />
          <Center flexGrow={1} h="full">
            <VStack h="full" w="full" spacing={4}>
              <StationCard flexGrow={1} className="no-drag" />
              <Controls w="full" className="no-drag" />
            </VStack>
          </Center>
        </HStack>
      </Box>
    </Box>
  )
}
