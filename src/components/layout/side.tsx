import { Box, BoxProps, Flex, HStack, Image, Text, Tooltip, VStack } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useMainContext } from '../../lib/context'
import { getAllStations } from '../../lib/somafm'
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
      {/* <VStack spacing={1} alignItems="start"> */}
      <Filter mb={2} />
      <AnimatePresence initial={false}>
        {stations.map((item, index) => (
          <ListItem
            key={item.title}
            animation={{
              whileTap: 'tapped',
              whileHover: 'hover',
            }}
          >
            <Box
              key={item.id}
              onClick={() =>
                dispatch({
                  type: 'play',
                  payload: { data: item },
                })
              }
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
              <HStack spacing={4}>
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
                        <Text color="whiteAlpha.400">{item.listeners}</Text>
                      </Flex>
                    </Tooltip>
                  </VStack>
                </Box>
              </HStack>
            </Box>
          </ListItem>
        ))}
      </AnimatePresence>
      {/* </VStack> */}
    </Box>
  )
}
