import {makeAutoObservable} from "mobx";
import {createContext} from "react";
import {Proto, RequestCache, RequestData, ResponseCache, ResponseData, Tab} from "@/types/types";
import protoList from '../../mock/rpc.json';

export default class PathStore {
    constructor() {
        console.log('init paths store')
        makeAutoObservable(this)
        this.init()
    }

    pathsDrawerVisible = false;
    paths: string[] = [];

    * init(): any {
        this.paths = yield window.rpc.getPaths()
    }

    showPaths(visible: boolean) {
        this.pathsDrawerVisible = visible
    }

    * addPath(): any {
        let res = yield window.rpc.addPath()
        if (res.success) {
            this.paths = res.paths;
        }
    }

    * removePath(path: string) {
        yield window.rpc.removePath(path)
        this.paths = yield window.rpc.getPaths()
    }
}