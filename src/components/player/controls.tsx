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
import { useEffect, useState } from 'react'
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
      navigator.mediaDevices
        .enumerateDevices()
        .then(mediaDevices => {
          setDevices(mediaDevices.filter(({ kind }) => kind === 'audiooutput'))
        })
        .catch(e => console.error(e))
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

  const playNext = () => {
    const index = stations.findIndex(v => v.id === station!.id)
    index &&
      dispatch({
        type: 'play',
        payload: { data: stations[index + 1] },
      })
  }

  const playPrev = () => {
    const index = stations.findIndex(v => v.id === station!.id)
    index &&
      dispatch({
        type: 'play',
        payload: { data: stations[index - 1] },
      })
  }
  return (
    <Box {...props}>
      <Player />

      <Center
        bg="blackAlpha.500"
        h="32"
        rounded="md"
        _hover={{
          bg: 'blackAlpha.900',
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
