import {
  Box,
  BoxProps,
  Center,
  HStack,
  Icon,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react'
import { useContext } from 'react'
import { MainContext } from '../../lib/context'
import { Play, Pause, Next, Prev } from '../icons'
import { Player } from './player'

export const Controls = (props: BoxProps) => {
  const {
    state: { station, stations, volume },
    dispatch,
  } = useContext(MainContext)
  return (
    <Box {...props}>
      <Player />

      <Center
        bg="blackAlpha.500"
        h="32"
        rounded="md"
        _hover={{
          bg: 'blackAlpha.700',
        }}
      >
        <HStack spacing={4}>
          <IconButton
            aria-label="Prev"
            icon={<Icon as={Prev} />}
            disabled={!station}
            onClick={() => {
              const index = stations.findIndex(v => v.id === station!.id)
              dispatch({
                type: 'play',
                payload: { data: stations[index - 1] },
              })
            }}
          />
          {station ? (
            <IconButton
              aria-label="Pause"
              icon={<Icon as={Pause} />}
              size="lg"
              onClick={() =>
                dispatch({
                  type: 'stop',
                })
              }
            />
          ) : (
            <IconButton
              aria-label="Play"
              icon={<Icon as={Play} />}
              size="lg"
              disabled={!stations}
              onClick={() =>
                dispatch({
                  type: 'play',
                  payload: { data: stations[Math.floor(Math.random() * stations.length)] },
                })
              }
            />
          )}
          <IconButton
            aria-label="Next"
            icon={<Icon as={Next} />}
            disabled={!station}
            onClick={() => {
              const index = stations.findIndex(v => v.id === station!.id)
              dispatch({
                type: 'play',
                payload: { data: stations[index + 1] },
              })
            }}
          />
          <Slider
            aria-label="Volume"
            colorScheme="dark"
            defaultValue={5}
            value={volume * 10}
            onChange={v =>
              dispatch({
                type: 'setVolume',
                payload: v / 10,
              })
            }
            min={0}
            max={10}
            step={0.5}
            w={100}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </HStack>
      </Center>
    </Box>
  )
}