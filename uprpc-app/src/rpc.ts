import {addFile, getFiles, getPaths, savePaths} from './store';
import {ipcMain} from 'electron';
import * as electron from "electron";

const {parser} = require('./proto')

async function importFile() {
    const result = await electron.dialog.showOpenDialog({
        title: "Import File",
        properties: ["openFile", 'multiSelections'],
        filters: [
            {name: 'proto', extensions: ['proto']},
        ],
    })

    if (result.canceled) {
        return {success: true}
    }

    for (let path of result.filePaths) {
        try {
            let services = await parser(path);
            addFile(path, services)
        } catch (e: any) {
            return {success: false, message: e.message}
        }
    }
    return {success: true}
}

function listFiles() {
    return JSON.stringify(getFiles());
}

async function addPath() {
    const result = await electron.dialog.showOpenDialog({
        title: "Import Paths",
        properties: ["openDirectory"]
    })

    if (result.canceled) {
        return {success: false}
    }

    let paths = getPaths();
    let path = result.filePaths[0];
    if (paths.indexOf(path) == -1) {
        paths.push(path);
        savePaths(paths)
    }

    return {success: true, paths: paths}
}

function removePath(path: string) {
    console.log("remove ", path)
    let paths = getPaths();
    paths.forEach((value, index) => {
        if (value == path) {
            paths.splice(index, 1);
        }
    })
    savePaths(paths)
}


export function init() {
    ipcMain.handle("importFile", (event: any) => importFile())
    ipcMain.handle("getFiles", (event: any) => listFiles())
    ipcMain.handle("addPath", (event: any) => addPath())
    ipcMain.handle("removePath", (event: any, path) => removePath(path))
    ipcMain.handle("getPaths", (event: any) => getPaths())
}
