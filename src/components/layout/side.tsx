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
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useMainContext } from '../../lib/context'
import { getAllStations } from '../../lib/somafm'
import { Headphones, HeartOutline, HeartSolid, Play } from '../common/icons'
import { ListItem } from '../common/list-item'
import { Filter } from '../player/filter'

const Overlay = motion<BoxProps>(Box)

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

  const constraintRef = useRef(null)

  return (
    <Box
      w="sm"
      h="full"
      rounded="md"
      overflow="hidden"
      p={4}
      bg="blackAlpha.500"
      _hover={{
        bg: 'blackAlpha.900',
      }}
      className="no-drag"
      ref={constraintRef}
    >
      <Overlay
        drag="y"
        dragConstraints={constraintRef}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 100 }}
      >
        <Filter mb={2} />
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
                bgGradient: 'linear(to-t, #081d8622, #00d4ff22)',
              }}
              w="full"
              p={2}
              mb={index !== stations.length - 1 ? 2 : 0}
              rounded="sm"
              className="no-select"
            >
              <HStack>
                <HStack spacing={4} w="full" cursor="pointer">
                  <Tooltip
                    label={item.description}
                    aria-label="Radio description"
                    openDelay={500}
                    bg="blackAlpha.700"
                    color="white"
                    rounded="md"
                    p={4}
                  >
                    <Image
                      src={item.image}
                      alt={item.description}
                      w={12}
                      h={12}
                      _hover={{
                        opacity: 0.92,
                      }}
                    />
                  </Tooltip>
                  <Box w="full">
                    <VStack w="full">
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
                    </VStack>
                  </Box>
                </HStack>
                <VStack>
                  <HStack color="whiteAlpha.600" w="full" justify="end">
                    <Headphones height={4} width={4} />
                    <Text fontSize={12} fontWeight="bold">
                      {item.listeners}
                    </Text>
                  </HStack>
                  <HStack>
                    <IconButton
                      aria-label="Play station"
                      size="sm"
                      width={16}
                      _groupHover={{
                        bgGradient: 'linear(to-b, #7928CA80, #FF008080)',
                      }}
                      icon={<Icon as={Play} />}
                      onClick={() => {
                        dispatch({
                          type: 'play',
                          payload: { data: item },
                        })
                      }}
                    />
                    <IconButton
                      aria-label="Favorite station"
                      size="sm"
                      _groupHover={{
                        bgGradient: 'linear(to-b, #7928CA40, #FF008040)',
                      }}
                      icon={<Icon color="red.500" as={item.fav ? HeartSolid : HeartOutline} />}
                      onClick={e => {
                        dispatch({
                          type: 'toggleFavorite',
                          payload: item.id,
                        })
                      }}
                    />
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          </ListItem>
        ))}
      </Overlay>
    </Box>
  )
}
