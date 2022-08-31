const Store = require('electron-store');
const uuid = require('uuid')
const FILES_KEY = "files";
const NAMESPACE_KEY = "namespace";
import {basename} from 'path';
let option = {
    name: "uprpc",//文件名称,默认 config
    fileExtension: "json",//文件后缀,默认json
    // cwd:app.getPath('userData'),//文件位置,尽量不要动，默认情况下，它将通过遵循系统约定来选择最佳位置。C:\Users\xxx\AppData\Roaming\test\config.json
//    encryptionKey:"aes-256-cbc" ,//对配置文件进行加密
//     clearInvalidConfig:true,
}
const store = new Store(option);

export function getFiles() {
    let files = store.get(FILES_KEY)
    return files == null ? [] : files;
}

export function addFile(path: string, services: any) {

    let localFiles = getFiles()
    for (let i = 0; i < localFiles.length; i++) {
        if (localFiles[i].path === path) {
            localFiles.splice(i, 1)
            break
        }
    }

    localFiles.push({
        id: uuid.v4(),
        name: basename(path),
        path: path,
        services: services
    })

    store.set(FILES_KEY, localFiles)
}
