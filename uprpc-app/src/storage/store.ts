import { Proto, Service, Method, MethodInfo } from "../types";

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

export function getMethodInfo2(id: string): MethodInfo | null {
    let protos = getFiles();
    if (protos.length > 0) {
        protos.forEach((proto: Proto) => {
            proto.services.forEach((service: Service) => {
                service.methods.forEach((method: Method) => {
                    if (method.id == id) {
                        return {
                            id: id,
                            protoPath: proto.path,
                            namespace: service.namespace,
                            serviceName: service.name,
                            name: method.name,
                            mode: method.mode,
                        };
                    }
                });
            });
        });
    }
    return null;
}

export function getMethodInfo(id: string, pos: string): MethodInfo | null {
    let protos = getFiles();
    let posArr = pos.split("-").map(Number);
    let proto = protos[posArr[1]];
    let service = proto.services[posArr[2]];
    let method = service.methods[posArr[3]];
    if (method.id == id) {
        return {
            id: id,
            protoPath: proto.path,
            namespace: service.namespace,
            serviceName: service.name,
            name: method.name,
            mode: method.mode,
        };
    }
    return null;
}
