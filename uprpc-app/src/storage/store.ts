import { Proto, Service, Method } from "../types";

// const Store = require("electron-store");
// const uuid = require("uuid");
// const PROTOS_KEY = "protos";
// const PATHS_KEY = "paths";

// let option = {
//     name: "uprpc",
//     fileExtension: "json",
//     //    encryptionKey:"aes-256-cbc" ,
// };
// const store = new Store(option);

// export function getProtos() {
//     let protos = store.get(PROTOS_KEY);
//     return protos == null ? [] : protos;
// }

// export function addProto(proto: Proto) {
//     let localProtos = getProtos();
//     for (let i = 0; i < localProtos.length; i++) {
//         if (localProtos[i].path === proto.path) {
//             localProtos.splice(i, 1);
//             break;
//         }
//     }
//     localProtos.push(proto);
//     store.set(PROTOS_KEY, localProtos);
// }

// export function deleteProto(id: string) {
//     let localProtos = getProtos();
//     for (let i = 0; i < localProtos.length; i++) {
//         if (localProtos[i].id === id) {
//             localProtos.splice(i, 1);
//             break;
//         }
//     }
//     store.set(PROTOS_KEY, localProtos);
// }

// export function savePaths(paths: string[]) {
//     store.set(PATHS_KEY, paths);
// }

// export function getPaths(): string[] {
//     let paths = store.get(PATHS_KEY);
//     return paths == null ? [] : paths;
// }
