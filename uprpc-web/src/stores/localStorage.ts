import {Method, Proto} from "@/types/types";

const INCLUDE_DIRS_KEY = "includeDirs";
const PROTOS_KEY = "protos";

export function listIncludeDir(): string[] {
    let includeDirs = localStorage.getItem(INCLUDE_DIRS_KEY);
    return includeDirs == null ? [] : JSON.parse(includeDirs);
}

export function addIncludeDir(path: string): void {
    let includeDirs = listIncludeDir();
    for (let i = 0; i < includeDirs.length; i++) {
        if (includeDirs[i] === path) {
            includeDirs.splice(i, 1);
            break;
        }
    }
    includeDirs.push(path);
    localStorage.setItem(INCLUDE_DIRS_KEY, JSON.stringify(includeDirs));
}

export function removeIncludeDir(path: string): void {
    let includeDirs = listIncludeDir();
    for (let i = 0; i < includeDirs.length; i++) {
        if (includeDirs[i] === path) {
            includeDirs.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(INCLUDE_DIRS_KEY, JSON.stringify(includeDirs));
}

export function listProto(): Proto[] {
    let protos = localStorage.getItem(PROTOS_KEY);
    return protos == null ? [] : JSON.parse(protos);
}

export function addProto(protos: Proto[]): void {
    let localProtos = listProto();
    for (let proto of protos) {
        for (let i = 0; i < localProtos.length; i++) {
            if (localProtos[i].path === proto.path) {
                localProtos.splice(i, 1);
                break;
            }
        }
    }

    localProtos.push(...protos);
    localStorage.setItem(PROTOS_KEY, JSON.stringify(localProtos));
}

export function removeProto(id: string): void {
    let localProtos = listProto();
    for (let i = 0; i < localProtos.length; i++) {
        if (localProtos[i].id === id) {
            localProtos.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(PROTOS_KEY, JSON.stringify(localProtos));
}

export function listMethod(protoId: string): Method[] {
    let methods = [];
    let proto = getProto(protoId);
    if (proto == null) return [];
    for (let service of proto.services) {
        for (let method of service.methods) {
            methods.push(method);
        }
    }
    return methods;
}

function getProto(protoId: string): Proto | null {
    let protos = listProto();
    for (let proto of protos) {
        if (proto.id == protoId) {
            return proto;
        }
    }
    return null;
}
