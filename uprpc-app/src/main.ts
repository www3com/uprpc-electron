import {init} from './rpc'

const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // mainWindow.loadFile('./dist/index.html')
    mainWindow.loadURL('http://localhost:8000')
    mainWindow.webContents.openDevTools()
    init()
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
