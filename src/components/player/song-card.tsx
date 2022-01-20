import { Box, BoxProps, Center, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { Disc } from '../common/icons'
import { RotatingItem } from '../common/rotating-item'
import { SongType } from './station-card'

type SongCardProps = {
  index: number
  last: boolean
  song: SongType
  props?: BoxProps
}

export const SongCard = ({ song, index, last, ...rest }: SongCardProps) => {
  return (
    <Box
      border="thin"
      rounded="sm"
      bg={index === 0 ? 'whiteAlpha.200' : `blackAlpha.${(index + 1) * 100}`}
      fontWeight={index === 0 ? 'bold' : 'normal'}
      opacity={index > 0 ? 1 - index / 10 : 1}
      mb={!last ? 2 : 0}
      w="full"
      {...rest}
    >
      <Flex p={4}>
        <Center>
          <HStack space={4}>
            <RotatingItem enabled={index === 0}>
              <Disc height={8} width={8} color="whiteAlpha.400" />
            </RotatingItem>
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
            <Text color="whiteAlpha.600">{song.album || '-'}</Text>
          </HStack>
        </VStack>
      </Flex>
    </Box>
  )
}
