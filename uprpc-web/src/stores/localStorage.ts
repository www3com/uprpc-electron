import {FlatMethod, Method, Proto} from "@/types/types";

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

function getProto(protoId: string): Proto | null {
    let protos = listProto();
    for (let proto of protos) {
        if (proto.id == protoId) {
            return proto;
        }
    }
    return null;
}

export function listProto(): Proto[] {
    let protos = localStorage.getItem(PROTOS_KEY);
    return protos == null ? [] : JSON.parse(protos);
}

export function addProto(protos: Proto[], isMerge: boolean = true): void {
    let localProtos = listProto();
    for (let i = 0; i < protos.length; i++) {
        for (let j = 0; j < localProtos.length; i++) {
            let proto = protos[i];
            if (localProtos[j].path === proto.path) {
                if (isMerge) {
                    protos.splice(i, 1, mergeProto(proto, localProtos[j]));
                }
                localProtos.splice(j, 1);
                break;
            }
        }
    }
    localProtos.push(...protos);
    localStorage.setItem(PROTOS_KEY, JSON.stringify(localProtos));
}

function mergeProto(newProto: Proto, origProto: Proto): Proto {
    let mergedProto = {...newProto, host: origProto.host, id: origProto.id};
    for (let service of mergedProto.services) {
        for (let method of service.methods) {
            let origMethod = getFullMethod(origProto, service.name, method.name);
            if (origMethod == null) {
                continue;
            }
            service.id = origMethod.serviceId;
            method.id = origMethod.id;
            method.requestMds = origMethod.requestMds;
            method.responseMds = origMethod.responseMds;
            method.requestBody = mergeParams(JSON.parse(method.requestBody), JSON.parse(origMethod.requestBody))
        }
    }
    return mergedProto;
}

function mergeParams(newParams: any, origParams: any): string {
    if (newParams == null) {
        return JSON.stringify("{}")
    }

    for (let key in newParams) {
        if (origParams[key] != null) {
            newParams[key] = origParams[key]
        }
    }
    return JSON.stringify(newParams, null, '\t');
}

function getFullMethod(proto: Proto, serviceName: string, methodName: string): FlatMethod | null {
    for (let service of proto.services) {
        if (service.name == serviceName) {
            for (let method of service.methods) {
                if (method.name == methodName) {
                    return {...method, namespace: service.namespace, serviceId: service.id, serviceName: service.name};
                }
            }
        }
    }
    return null;
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

export function updateMethod(protoId: string, serviceId: string, method: Method) {
    let proto = getProto(protoId);
    if (proto?.services == null) {
        return;
    }

    for (let i = 0; i < proto?.services.length; i++) {
        let service = proto.services[i];
        if (service.id == serviceId) {
            for (let j = 0; j < service.methods.length; j++) {
                let m = service.methods[j];
                if (m.id == method.id) {
                    service.methods.splice(j, 1, method);
                }
            }
            proto.services.splice(i, 1, service);
        }
    }
    addProto([proto], false)
}