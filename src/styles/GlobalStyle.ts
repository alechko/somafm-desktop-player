import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
  }
  html, body, #root {
    height: 100%
  }

  .drag {
    -webkit-app-region: drag;
  }

  .no-drag {
    -webkit-app-region: no-drag;
  }

  .grab {
    cursor: move;
    cursor: -webkit-grab;
    cursor: -moz-grab;
    cursor: grab;
  }

  .grab:active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
  }

  .no-select {
    -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
       -khtml-user-select: none; /* Konqueror HTML */
         -moz-user-select: none; /* Old versions of Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
              user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome, Edge, Opera and Firefox */
  }

  .player-overlay {
    background: linear-gradient(180deg, #df000060, #df6f0060, #dfdb0060, #95df0060, #3edf0060, #00df3760, #00df8f60, #00c3df60, #006cdf60, #1300df60, #7400df60, #df00de60, #df007460);
    background-size: 2600% 2600%;
    -webkit-animation: MovingBg 240s ease infinite;
    -moz-animation: MovingBg 240s ease infinite;
    animation: MovingBg 240s ease infinite;
  }

  @-webkit-keyframes MovingBg {
      0%{background-position:50% 0%}
      50%{background-position:50% 100%}
      100%{background-position:50% 0%}
  }
  @-moz-keyframes MovingBg {
      0%{background-position:50% 0%}
      50%{background-position:50% 100%}
      100%{background-position:50% 0%}
  }
  @keyframes MovingBg {
      0%{background-position:50% 0%}
      50%{background-position:50% 100%}
      100%{background-position:50% 0%}
  }
`
