import { ChakraProvider } from '@chakra-ui/react'
import { Home } from './components/layout/home'
import { MainProvider } from './lib/context'
import theme from './lib/theme'
import { GlobalStyle } from './styles/GlobalStyle'

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <GlobalStyle />
      <MainProvider>
        <Home />
      </MainProvider>
      {/* <Greetings /> */}
    </ChakraProvider>
  )
}
