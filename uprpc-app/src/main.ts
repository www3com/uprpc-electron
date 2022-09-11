import * as router from "./router";

const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    title: "upRpc",
    webPreferences: {
      preload: path.join(__dirname, "bridge.js"),
    },
  });

  // mainWindow.loadFile('./dist/index.html')
  mainWindow.loadURL("http://localhost:8000");
  // mainWindow.webContents.openDevTools();
  router.register(mainWindow);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
