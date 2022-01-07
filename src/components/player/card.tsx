import { Box, Image, Center, BoxProps, Heading, VStack, HStack, Text, Flex } from '@chakra-ui/react'
import { useContext } from 'react'
import { MainContext } from '../../lib/context'
import { Music } from '../icons'

export const Card = (props: BoxProps) => {
  const {
    state: { station },
  } = useContext(MainContext)
  if (!station) {
    return (
      <Center bg="blackAlpha.500" w="full" h="full" rounded="md">
        <VStack>
          <Music color="whiteAlpha.400" />
          <Text>Choose station...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box bg="blackAlpha.500" w="full" h="full" rounded="md" overflow="hidden" {...props}>
      <Flex h="full" w=" full" p={8} justifyContent="center" alignItems="center">
        <HStack w="full" bg="blackAlpha.700" rounded="md" p={8}>
          <VStack>
            <Image src={station.largeimage} alt={station.description} />
            <VStack>
              <Text>DJ: {station.dj}</Text>
              <Text fontSize={12} color="gray.400">
                {station.djmail}
              </Text>
            </VStack>
          </VStack>
          <Center h="full" w="full">
            <VStack h="full" w="full" spacing={8}>
              <Heading>{station.title}</Heading>
            </VStack>
          </Center>
        </HStack>
      </Flex>
    </Box>
  )
}
