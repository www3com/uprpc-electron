import {makeAutoObservable} from "mobx";
import {createContext} from "react";
import {FullMethod, Proto, Response, Tab} from "@/types/types";

export default class Rpc {
    constructor() {
        console.log('init rpc store')
        makeAutoObservable(this)
        this.init()
    }

    protos: Proto[] = [];
    fullMethods: FullMethod[] = [];
    openTabs: Tab[] = [{key: '1', title: 'New Tab', type: 'file'}];
    selectedTab = '1';
    pathsDrawerVisible = false;
    paths: string[] = [];
    responses: any = {};

    * init(): any {
        window.rpc.handleResponse((event: any, value: any) => this.handleResponse(value))
        this.paths = yield window.rpc.getPaths()
        this.protos = JSON.parse(yield window.rpc.getFiles())
        this.protos.forEach((proto) => {
            proto.services.forEach((service) => {
                service.methods.forEach((method) => {
                    this.fullMethods.push({
                        host: proto.host,
                        path: proto.path,
                        namespace: service.namespace,
                        service: service.name,
                        ...method
                    })
                })
            })
        })
    }

    selectTab(key: string) {
        this.selectedTab = key;
    }

    openTab(key: string, title: string, type: string) {
        if (this.openTabs.length == 1 && this.openTabs[0].key === '1') {
            this.openTabs.splice(0, 1);
        }
        for (let tab of this.openTabs) {
            if (tab.key === key) {
                this.selectedTab = key
                return;
            }
        }
        this.openTabs.push({key: key, title: title, type: type})
        this.selectedTab = key
    }

    remove(key: any) {
        if (this.openTabs.length == 1) {
            return
        }
        this.openTabs.forEach((item, index) => {
            if (item.key == key) {
                this.openTabs.splice(index, 1);
                let pos = index < this.openTabs.length ? index : this.openTabs.length - 1;
                this.selectedTab = this.openTabs[pos].key
            }
        })

    }

    * send(method: any): any {
        console.log("request parameter: ", method)
        let s = yield window.rpc.send(JSON.stringify(method))
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

    handleResponse(response: Response) {
        this.responses[response.id] = response.responseBody;
        console.log("处理数据：", response.responseBody, this.responses)
    }


}

export const store = new Rpc();

export const context = createContext({store: store});