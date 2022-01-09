import {
  Box,
  BoxProps,
  Center,
  Flex,
  Heading,
  Image,
  Text,
  useInterval,
  VStack,
} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { MainContext } from '../../lib/context'
import { getSongsList } from '../../lib/somafm'
import { Music } from '../icons'
import { SongCard } from './song-card'

export type SongType = {
  title: string
  artist: string
  album: string
  albumart: string | null
  date: number
}

export const StationCard = (props: BoxProps) => {
  const {
    state: { station },
  } = useContext(MainContext)

  const [songs, setSongs] = useState<SongType[]>([])

  useEffect(() => {
    if (station) {
      getSongsList(station.id).then(r => setSongs(r.songs))
    }
  }, [station])

  useInterval(() => {
    if (station) {
      getSongsList(station.id).then(r => setSongs(r.songs))
    }
  }, 1000 * 60)

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
    <Box bg="blackAlpha.500" w="full" h="full" rounded="md" overflow="auto" {...props}>
      <Flex h="full" w=" full" p={8} justifyContent="start" alignItems="start">
        <VStack w="full" bg="blackAlpha.700" rounded="md" p={8}>
          <Flex justifyContent="center" alignItems="center" w="full">
            <Box flexGrow={1}>
              <Heading textAlign="center">{station.title}</Heading>
              <VStack color="whiteAlpha.600">
                <Text>DJ: {station.dj}</Text>
                <Text fontSize={12}>{station.djmail}</Text>
              </VStack>
            </Box>
            <VStack>
              <Image src={station.largeimage} alt={station.description} w={120} />
            </VStack>
          </Flex>
          <Box h="full" w="full">
            <VStack h="full" w="full" spacing={8}>
              {songs && songs.map((song, i) => <SongCard key={i} song={song} current={i === 0} />)}
            </VStack>
          </Box>
        </VStack>
      </Flex>
    </Box>
  )
}
