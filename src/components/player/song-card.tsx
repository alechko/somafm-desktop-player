import { Box, BoxProps, Center, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { Disc } from '../icons'
import { SongType } from './station-card'

type SongCardProps = {
  current: boolean
  song: SongType
  props?: BoxProps
}

export const SongCard = ({ song, current, ...rest }: SongCardProps) => {
  return (
    <Box
      border="thin"
      rounded="sm"
      bg={current ? 'whiteAlpha.300' : 'whiteAlpha.100'}
      w="full"
      {...rest}
    >
      <Flex p={4}>
        <Center>
          <HStack space={4}>
            <Disc height={8} width={8} color="whiteAlpha.400" />
            <Text>{song.title}</Text>
          </HStack>
        </Center>
        <Spacer />
        <VStack fontSize={12} alignItems="flex-end">
          <HStack>
            <Text color="whiteAlpha.400">By</Text>
            <Text color="whiteAlpha.600">{song.artist}</Text>
          </HStack>
          <HStack>
            <Text color="whiteAlpha.400">From</Text>
            <Text color="whiteAlpha.600">{song.album}</Text>
          </HStack>
        </VStack>
      </Flex>
    </Box>
  )
}
