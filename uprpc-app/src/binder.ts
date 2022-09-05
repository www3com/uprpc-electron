import { BrowserWindow, ipcMain } from "electron";
import * as app from "./app";
import * as rpc from "./rpc/client";

export function bind(window: BrowserWindow) {
  ipcMain.handle("importFile", (event: any) => app.importFile());
  ipcMain.handle("getFiles", (event: any) => app.listFiles());
  ipcMain.handle("addPath", (event: any) => app.addPath());
  ipcMain.handle("removePath", (event: any, path) => app.removePath(path));
  ipcMain.handle("getPaths", (event: any) => app.getPaths());
  ipcMain.handle("send", (event: any, method) => app.send(window, method));
}
