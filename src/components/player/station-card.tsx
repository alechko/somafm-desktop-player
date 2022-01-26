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
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMainContext } from '../../lib/context'
import { getSongsList } from '../../lib/somafm'
import { Music } from '../common/icons'
import { ListItem } from '../common/list-item'
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
    state: { station, playing },
  } = useMainContext()

  const [songs, setSongs] = useState<SongType[]>([])

  useEffect(() => {
    if (station) {
      getSongsList(station.id).then(r => setSongs(r.songs))
    }
  }, [station])

  useInterval(() => {
    if (station && playing) {
      getSongsList(station.id).then(r => r.songs !== songs && setSongs(r.songs))
    }
  }, 1000 * 30)

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
        <VStack w="full" bg="blackAlpha.700" rounded="md" p={8} minH="full">
          <Flex justifyContent="center" alignItems="center" w="full">
            <Box flexGrow={1}>
              <Heading
                textAlign="center"
                bg="white"
                bgGradient="linear(to-b, #7928CA40, #FF008060)"
                bgClip="text"
              >
                {station.title}
              </Heading>
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
            {/* <VStack h="full" w="full" spacing={8}> */}
            <AnimatePresence>
              {songs &&
                songs.map((song, i) => (
                  <ListItem key={song.title}>
                    <SongCard song={song} index={i} last={i === songs.length - 1} />
                  </ListItem>
                ))}
            </AnimatePresence>
            {/* </VStack> */}
          </Box>
        </VStack>
      </Flex>
    </Box>
  )
}
