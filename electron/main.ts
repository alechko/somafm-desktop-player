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

function createTray() {
  const PlayMenuItem = PlayMenuItemTemplate()
  const trayTemplate: MenuItemConstructorOptions[] = [
    { role: 'about' },
    { type: 'separator' },
    { ...PlayMenuItem },
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
}

app
  .on('ready', () => {
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
