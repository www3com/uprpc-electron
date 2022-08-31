import {addFile, getFiles} from './store';
import {ipcMain} from 'electron';
import * as electron from "electron";
import {v4} from "uuid";

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
        return;
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

export function init() {
    ipcMain.handle("importFile", (event: any) => importFile())
    ipcMain.handle("getFiles", (event: any) => listFiles())
}
