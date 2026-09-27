import {
  Box,
  BoxProps,
  Center,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  useInterval,
} from '@chakra-ui/react'
import { isEqual } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { listOutputDevices, OutputDevice } from '../../lib/audio'
import { useMainContext } from '../../lib/context'
import { MediaAction, onMediaAction, updateNowPlaying } from '../../lib/media'
import { useTrayMenu } from '../../lib/tray'
import { Check, DropInvert, Headphones, Img, Next, Pause, Play, Prev } from '../common/icons'
import { Player } from './player'

export const Controls = (props: BoxProps) => {
  const {
    state: { playing, station, stations, volume, bgImage, bgParty, device },
    dispatch,
  } = useMainContext()

  const togglePlay = () => {
    if (playing) {
      dispatch({ type: 'pause' })
    } else if (station) {
      dispatch({ type: 'play', payload: { data: station } })
    }
  }

  // Output devices come from the native side; refresh them to catch plugged-in headphones
  const [devices, setDevices] = useState<OutputDevice[]>([])
  const loadDevices = () =>
    listOutputDevices()
      .then(next => setDevices(prev => (isEqual(prev, next) ? prev : next)))
      .catch(e => console.error(e))
  // Undefined follows the system default output
  const selectDevice = (id: string | undefined) => dispatch({ type: 'setDevice', payload: id })
  useEffect(() => {
    loadDevices()
  }, [])
  useInterval(loadDevices, 5000)

  // Step through the list in its current order, wrapping around at either end
  const playOffset = (offset: number) => {
    if (!stations.length) return
    const index = station ? stations.findIndex(v => v.id === station.id) : -1
    const next =
      index === -1
        ? stations[offset > 0 ? 0 : stations.length - 1]
        : stations[(index + offset + stations.length) % stations.length]
    dispatch({
      type: 'play',
      payload: { data: next },
    })
  }
  const playNext = () => playOffset(1)
  const playPrev = () => playOffset(-1)

  // Media keys reach the latest handlers through a ref; the listener is registered once
  const onMedia = useRef<(action: MediaAction) => void>(() => {})
  onMedia.current = action => {
    if (action === 'next') return playNext()
    if (action === 'prev') return playPrev()
    if (action === 'toggle' || (action === 'play') !== playing) togglePlay()
  }
  useEffect(() => {
    const unlisten = onMediaAction(action => onMedia.current(action))
    return () => {
      unlisten.then(stop => stop())
    }
  }, [])

  useEffect(() => {
    updateNowPlaying(playing, station?.title, station ? 'SomaFM' : undefined).catch(e =>
      console.error(e)
    )
  }, [playing, station])

  const favorites = useMemo(() => stations.filter(s => s.fav), [stations])
  useTrayMenu(
    { playing, station, favorites, devices, device },
    {
      toggle: togglePlay,
      next: playNext,
      prev: playPrev,
      playStation: id => {
        const next = stations.find(s => s.id === id)
        next && dispatch({ type: 'play', payload: { data: next } })
      },
      setDevice: selectDevice,
    }
  )

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
            aria-label="Toggle background image"
            icon={<Icon as={Img} />}
            color={bgImage ? 'whiteAlpha.600' : 'whiteAlpha.200'}
            onClick={() => {
              dispatch({
                type: 'setBgImage',
                payload: !bgImage,
              })
            }}
          />
          <IconButton
            aria-label="Toggle party mode"
            icon={<Icon as={DropInvert} />}
            color={bgParty ? 'whiteAlpha.600' : 'whiteAlpha.200'}
            onClick={() => {
              dispatch({
                type: 'setBgParty',
                payload: !bgParty,
              })
            }}
          />
          <Spacer />
          <IconButton
            aria-label="Prev"
            icon={<Icon as={Prev} />}
            disabled={!playing}
            onClick={playPrev}
          />
          {playing ? (
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
            disabled={!playing}
            onClick={playNext}
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
          <Menu>
            <MenuButton as={IconButton} icon={<Icon as={Headphones} />} />
            <MenuList>
              {[{ id: undefined, name: 'System Default' }, ...devices].map(({ id, name }) => (
                <MenuItem
                  key={id ?? 'default'}
                  icon={id === device ? <Icon as={Check} /> : <></>}
                  iconSpacing={4}
                  onClick={() => selectDevice(id)}
                >
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
      </Center>
    </Box>
  )
}
