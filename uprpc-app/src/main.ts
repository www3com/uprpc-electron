import * as router from "./router";

const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

const path = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 1000,
        title: "upRpc",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:8000");
    } else {
        mainWindow.loadFile("./static/index.html");
    }

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
    app.quit();
});
