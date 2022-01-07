import { extendTheme } from '@chakra-ui/react'

const config = {
  // initialColorMode: 'dark',
  useSystemColorMode: true,
}

const fonts = {
  heading: 'Assistant',
  body: 'Assistant',
}

const theme = extendTheme({ config, fonts })

export default theme
