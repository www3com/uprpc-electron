import { BrowserWindow, ipcMain } from "electron";
import * as service from "./service";
import * as rpc from "./rpc/client";

export function register(window: BrowserWindow) {
    ipcMain.handle("importFile", (event: any) => service.importFile());
    ipcMain.handle("getFiles", (event: any) => service.listFiles());
    ipcMain.handle("addPath", (event: any) => service.addPath());
    ipcMain.handle("removePath", (event: any, path) => service.removePath(path));
    ipcMain.handle("getPaths", (event: any) => service.getPaths());
    ipcMain.handle("send", (event: any, method) => service.sendRequest(window, method));
    ipcMain.handle("stopStream", (event: any, method) => service.stopStream(window, method));
}
