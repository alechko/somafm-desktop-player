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
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useMainContext } from '../../lib/context'
import { Check, DropInvert, Headphones, Img, Next, Pause, Play, Prev } from '../common/icons'
import { Player } from './player'

export const Controls = (props: BoxProps) => {
  const {
    state: { playing, station, stations, volume, bgImage, bgParty, device },
    dispatch,
  } = useMainContext()

  useEffect(
    () =>
      window.Main &&
      window.Main.on('playToggle', (playing: boolean | undefined) => {
        if (playing) {
          dispatch({
            type: 'pause',
          })
        } else {
          dispatch({
            type: station ? 'play' : 'resume',
            payload: station ? { data: station } : {},
          })
        }
      }),
    []
  )

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  useEffect(() => {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      const loadDevices = () =>
        navigator.mediaDevices
          .enumerateDevices()
          .then(mediaDevices => {
            setDevices(mediaDevices.filter(({ kind }) => kind === 'audiooutput'))
          })
          .catch(e => console.error(e))
      loadDevices()
      navigator.mediaDevices.addEventListener('devicechange', loadDevices)
    }
    if (navigator.mediaSession) {
      navigator.mediaSession.setActionHandler('play', () => {
        dispatch({
          type: station ? 'play' : 'resume',
          payload: station ? { data: station } : {},
        })
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        dispatch({
          type: 'pause',
        })
      })
    }
  }, [])

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

  // Keep the app menu (Controls / Favorites) in sync with the player
  useEffect(() => {
    window.Main &&
      window.Main.sendMessage('menuState', {
        station: station ? station.id : null,
        favorites: stations.filter(s => s.fav).map(({ id, title }) => ({ id, title })),
        devices: devices.map(({ deviceId, label }) => ({ deviceId, label })),
        device,
      })
  }, [station, stations, devices, device])

  // The listener is registered once, so it reads the latest handlers through a ref
  const onMenuAction = useRef<(action: any) => void>()
  onMenuAction.current = action => {
    switch (action.type) {
      case 'next':
        return playNext()
      case 'prev':
        return playPrev()
      case 'playStation': {
        const next = stations.find(s => s.id === action.id)
        return next && dispatch({ type: 'play', payload: { data: next } })
      }
      case 'setDevice':
        return dispatch({ type: 'setDevice', payload: action.deviceId })
    }
  }
  useEffect(() => {
    window.Main && window.Main.on('menuAction', (action: any) => onMenuAction.current?.(action))
  }, [])
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
              {devices.map(({ deviceId, label }: MediaDeviceInfo) => (
                <MenuItem
                  key={deviceId}
                  icon={device && device === deviceId ? <Icon as={Check} /> : <></>}
                  iconSpacing={4}
                  onClick={() =>
                    dispatch({
                      type: 'setDevice',
                      payload: deviceId,
                    })
                  }
                >
                  {label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
      </Center>
    </Box>
  )
}
