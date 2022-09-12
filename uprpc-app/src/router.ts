import { BrowserWindow, ipcMain } from "electron";
import * as service from "./service";
import * as rpc from "./rpc/client";

export function register(window: BrowserWindow) {
    ipcMain.handle("importProto", (event: any) => service.importProto());
    ipcMain.handle("getProtos", (event: any) => service.getProtos());
    ipcMain.handle("reloadProto", (event: any) => service.reloadProto());
    ipcMain.handle("deleteProto", (event: any, id: string) => service.deleteProto(id));

    ipcMain.handle("addPath", (event: any) => service.addPath());
    ipcMain.handle("removePath", (event: any, path) => service.removePath(path));
    ipcMain.handle("getPaths", (event: any) => service.getPaths());
    ipcMain.handle("send", (event: any, method) => service.sendRequest(window, method));
    ipcMain.handle("stopStream", (event: any, method) => service.stopStream(window, method));
}
