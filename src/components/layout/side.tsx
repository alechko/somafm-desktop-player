import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useMainContext } from '../../lib/context'
import { getAllStations } from '../../lib/somafm'
import { Headphones, HeartOutline, HeartSolid, Play } from '../common/icons'
import { ListItem } from '../common/list-item'
import { Filter } from '../player/filter'

export const Side = (props: BoxProps) => {
  const {
    state: { stations, station },
    dispatch,
  } = useMainContext()
  useEffect(() => {
    getAllStations().then(r => {
      dispatch({
        type: 'setStations',
        payload: {
          data: r.channels,
        },
      })
    })
  }, [])

  return (
    <Box
      w="sm"
      h="full"
      rounded="md"
      overflow="auto"
      p={4}
      bg="blackAlpha.500"
      _hover={{
        bg: 'blackAlpha.700',
      }}
      className="no-drag"
    >
      <Filter mb={2} />
      <AnimatePresence initial={false}>
        {stations.map((item, index) => (
          <ListItem
            key={item.title}
            animation={{
              // whileTap: 'tapped',
              whileHover: 'hover',
            }}
          >
            <Box
              key={item.id}
              bg={station && item.id === station.id ? 'whiteAlpha.300' : 'whiteAlpha.50'}
              _hover={{
                bg: 'whiteAlpha.100',
              }}
              w="full"
              p={2}
              mb={index !== stations.length - 1 ? 2 : 0}
              rounded="sm"
              className="no-select"
            >
              <HStack>
                <HStack
                  spacing={4}
                  w="full"
                  onClick={e => {
                    dispatch({
                      type: 'play',
                      payload: { data: item },
                    })
                  }}
                  cursor="pointer"
                >
                  <Image src={item.image} alt={item.description} w={12} h={12} />
                  <Box w="full">
                    <VStack w="full">
                      <Tooltip
                        label={item.description}
                        aria-label="Radio description"
                        openDelay={500}
                        bg="blackAlpha.700"
                        color="white"
                        rounded="md"
                        p={4}
                      >
                        <Flex w="full">
                          <Box flexGrow={1}>
                            <VStack alignItems="start">
                              <Text fontWeight="bold">{item.title}</Text>
                              <Text fontSize={12} color="whiteAlpha.400">
                                {item.genre.replace('|', ', ')}
                              </Text>
                            </VStack>
                          </Box>
                        </Flex>
                      </Tooltip>
                    </VStack>
                  </Box>
                </HStack>
                <VStack>
                  <HStack color="whiteAlpha.600">
                    <Headphones height={4} width={4} />
                    <Text fontSize={12} fontWeight="bold">
                      {item.listeners}
                    </Text>
                  </HStack>
                  <HStack>
                    <IconButton
                      aria-label="Favorite station"
                      size="sm"
                      icon={<Icon color="red.500" as={item.fav ? HeartSolid : HeartOutline} />}
                      onClick={e => {
                        dispatch({
                          type: 'toggleFavorite',
                          payload: item.id,
                        })
                      }}
                    />
                    <IconButton
                      aria-label="Play station"
                      size="sm"
                      icon={<Icon as={Play} />}
                      onClick={() => {
                        dispatch({
                          type: 'play',
                          payload: { data: item },
                        })
                      }}
                    />
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          </ListItem>
        ))}
      </AnimatePresence>
    </Box>
  )
}
