import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  nativeTheme,
  Tray,
} from 'electron'
import defaultMenu from 'electron-default-menu'
import path from 'path'

let mainWindow: BrowserWindow | null
let tray: Tray | null
let contextMenu: Menu | null
let playing: boolean | null

type MenuState = {
  station: string | null
  favorites: { id: string; title: string }[]
  devices: { deviceId: string; label: string }[]
  device: string | undefined
}
let menuState: MenuState = { station: null, favorites: [], devices: [], device: undefined }

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const assetsPath = process.env.NODE_ENV === 'production' ? process.resourcesPath : app.getAppPath()
const iconPath = path.join(assetsPath, 'assets', 'icon.png')

const darkBackgroundColor = 'black'
const lightBackgroundColor = 'white'

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: iconPath,
    width: 1100,
    height: 700,
    titleBarStyle: 'hiddenInset',
    title: 'SomaFM Desktop Player',
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? darkBackgroundColor : lightBackgroundColor,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow && mainWindow.show()
  })
}

const PlayMenuItemTemplate = (): MenuItemConstructorOptions => {
  return {
    id: 'playing',
    label: playing ? 'Pause' : 'Play',
    enabled: true,
    click: event => {
      mainWindow && playing !== null && mainWindow.webContents.send('playToggle', playing)
    },
    accelerator: 'Space',
  }
}

const sendMenuAction = (action: Record<string, unknown>) => {
  mainWindow && mainWindow.webContents.send('menuAction', action)
}

const stationNavItems = (): MenuItemConstructorOptions[] => {
  const hasStation = menuState.station !== null
  return [
    {
      label: 'Next Station',
      enabled: hasStation,
      click: () => sendMenuAction({ type: 'next' }),
    },
    {
      label: 'Previous Station',
      enabled: hasStation,
      click: () => sendMenuAction({ type: 'prev' }),
    },
  ]
}

const audioOutputMenu = (): MenuItemConstructorOptions => {
  const selectedDevice = menuState.device || 'default'
  return {
    label: 'Audio Output',
    enabled: menuState.devices.length > 0,
    submenu: menuState.devices.map(({ deviceId, label }) => ({
      label: label || 'Unknown device',
      type: 'checkbox',
      checked: deviceId === selectedDevice,
      click: () => sendMenuAction({ type: 'setDevice', deviceId }),
    })),
  }
}

const favoritesMenu = (): MenuItemConstructorOptions => ({
  label: 'Favorites',
  submenu: menuState.favorites.length
    ? menuState.favorites.map(({ id, title }) => ({
        label: title,
        type: 'checkbox',
        checked: id === menuState.station,
        click: () => sendMenuAction({ type: 'playStation', id }),
      }))
    : [{ label: 'No favorites yet', enabled: false }],
})

function createTray() {
  const PlayMenuItem = PlayMenuItemTemplate()
  const trayTemplate: MenuItemConstructorOptions[] = [
    { role: 'about' },
    { type: 'separator' },
    { ...PlayMenuItem },
    ...stationNavItems(),
    { type: 'separator' },
    favoritesMenu(),
    audioOutputMenu(),
    { type: 'separator' },
    { role: 'quit' },
  ]
  const image = nativeImage.createFromPath(iconPath)
  tray = tray || new Tray(image.resize({ width: 16, height: 16 }))
  contextMenu = Menu.buildFromTemplate(trayTemplate)
  tray.setToolTip('SomaFM Desktop Player')
  tray.setContextMenu(contextMenu)
}

function createMenu() {
  const PlayMenuItem = PlayMenuItemTemplate()
  const menu = defaultMenu(app, shell)
  menu.splice(4, 0, {
    label: 'Controls',
    submenu: [{ ...PlayMenuItem }],
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
}

async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', (_, message) => {
    console.log(message)
  })
  ipcMain.on('playing', (_, message) => {
    console.log('PLAYING', message)
    playing = message

    createTray()
    createMenu()
  })
  ipcMain.on('menuState', (_, state: MenuState) => {
    menuState = state
    createTray()
  })
}

app
  .on('ready', () => {
    // In dev the app runs inside the stock Electron.app, so its Dock icon is Electron's
    if (process.platform === 'darwin' && !app.isPackaged) {
      app.dock?.setIcon(iconPath)
    }
    createWindow()
    createTray()
    createMenu()
  })
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
