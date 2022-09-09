import {makeAutoObservable} from "mobx";
import {createContext} from "react";
import {Proto, RequestCache, RequestData, ResponseCache, ResponseData, Tab} from "@/types/types";

export default class Rpc {
    constructor() {
        console.log('init rpc store')
        makeAutoObservable(this)
        this.init()
    }

    protos: Proto[] = [];
    selectedTab = '1';
    pathsDrawerVisible = false;
    paths: string[] = [];
    openTabs: Tab[] = [{key: '1', title: 'New Tab', type: 'file', pos: '0'}];
    requestCaches: Map<string, RequestCache> = new Map<string, RequestCache>();
    responseCaches: Map<string, ResponseCache> = new Map<string, ResponseCache>();

    * init(): any {
        window.rpc.handleResponse((event: any, value: ResponseData) => {
            let responseCache = this.responseCaches.get(value.id);
            if (responseCache == null) {
                this.responseCaches.set(value.id, {
                    body: value.body,
                    metadata: value.metadata
                })
                return;
            }

            // 对响应流处理
            let streams = responseCache.streams;
            if (streams == null) return;
            if (streams.length > 20) {
                streams.pop();
            }

            this.responseCaches.set(value.id, {...responseCache, streams: streams});
        });

        this.paths = yield window.rpc.getPaths()
        this.protos = JSON.parse(yield window.rpc.getFiles())
    }

    selectTab(key: string) {
        this.selectedTab = key;
    }

    openTab(tab: Tab) {
        if (this.openTabs.length == 1 && this.openTabs[0].key === '1') {
            this.openTabs.splice(0, 1);
        }

        let index = this.openTabs.findIndex((value) => value.key === tab.key);
        if (index == -1) {
            this.openTabs.push(tab)
        }

        this.selectedTab = tab.key
    }

    remove(key: any) {
        if (this.openTabs.length == 1) return;

        this.openTabs.forEach((item, index) => {
            if (item.key == key) {
                this.openTabs.splice(index, 1);
                let pos = index < this.openTabs.length ? index : this.openTabs.length - 1;
                this.selectedTab = this.openTabs[pos].key
            }
        })
    }

    * send(requestData: RequestData): any {
        console.log("request parameter: ", requestData)
        let s = yield window.rpc.send(JSON.stringify(requestData))
        console.log(s)
    }

    * importFile(): any {
        return yield window.rpc.importFile()
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

export const store = new Rpc();

export const context = createContext({store: store});