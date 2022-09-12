import {BrowserWindow, ipcMain, ipcRenderer} from "electron";
import * as service from "./service";

export function register(window: BrowserWindow) {
    // Import File
    ipcMain.handle("parseProto", (event: any, paths: string[], includeDirs: string[]) => service.parseProto(paths, includeDirs));
    ipcMain.handle("openProto", (event: any) => service.openProto());

    ipcMain.handle("openIncludeDir", (event: any) => service.openIncludeDir());

    ipcMain.handle("send", (event: any, method) => service.sendRequest(window, method));
    ipcMain.handle("stopStream", (event: any, method) => service.stopStream(window, method));
}
