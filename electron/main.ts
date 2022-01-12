import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  Tray,
} from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null
let tray: Tray | null
let contextMenu: Menu | null
let playing: boolean | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const assetsPath = process.env.NODE_ENV === 'production' ? process.resourcesPath : app.getAppPath()
const iconPath = path.join(assetsPath, 'assets', 'icon.png')

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: iconPath,
    width: 1100,
    height: 700,
    titleBarStyle: 'hiddenInset',
    title: 'SomaFM Desktop Player',
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
}

const menuTemplate: MenuItemConstructorOptions[] = [
  { role: 'about' },
  { type: 'separator' },
  {
    id: 'playing',
    label: 'Play',
    enabled: false,
    click: event => {
      mainWindow && playing && mainWindow.webContents.send('playToggle', playing)
    },
    accelerator: 'Space',
  },
  { type: 'separator' },
  { role: 'quit' },
]

function createTray() {
  const image = nativeImage.createFromPath(iconPath)
  tray = new Tray(image.resize({ width: 16, height: 16 }))
  contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setToolTip('SomaFM Desktop Player')
  tray.setContextMenu(contextMenu)
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

    if (tray && contextMenu) {
      menuTemplate[2].enabled = true
      menuTemplate[2].label = playing ? 'Pause' : 'Play'
      contextMenu = Menu.buildFromTemplate(menuTemplate)
      tray.setContextMenu(contextMenu)
    }
  })
}

app
  .on('ready', () => {
    createTray()
    createWindow()
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
