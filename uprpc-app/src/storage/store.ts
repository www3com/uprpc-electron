import { Proto, Service, Method } from "../types";

const Store = require("electron-store");
const uuid = require("uuid");
const FILES_KEY = "files";
const PATHS_KEY = "paths";

import { basename } from "path";

let option = {
    name: "uprpc",
    fileExtension: "json",
    //    encryptionKey:"aes-256-cbc" ,
};
const store = new Store(option);

export function getFiles() {
    let files = store.get(FILES_KEY);
    return files == null ? [] : files;
}

export function addFile(proto: Proto) {
    let localFiles = getFiles();
    for (let i = 0; i < localFiles.length; i++) {
        if (localFiles[i].path === proto.path) {
            localFiles.splice(i, 1);
            break;
        }
    }
    localFiles.push(proto);
    store.set(FILES_KEY, localFiles);
}

export function savePaths(paths: string[]) {
    store.set(PATHS_KEY, paths);
}

export function getPaths(): string[] {
    let paths = store.get(PATHS_KEY);
    return paths == null ? [] : paths;
}
