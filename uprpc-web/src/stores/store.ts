import {makeAutoObservable} from "mobx";
import React, {createContext} from "react";

const TAB_TYPE_RPC = "rpc";

declare global {  //设置全局属性
    interface Window {  //window对象属性
        rpc: any;   //加入对象
    }
}

export interface MetadataProp {
    key: string,
    value: string,
    method: string
}

export interface RequestProp {
    body: string
    metadata: MetadataProp[]
}

export interface ResponseProp {
    body: string
    metadata: MetadataProp[]
}

export interface File {
    id: string,
    name: string,
    type: string,
    children: any
}

export default class Rpc {
    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    files: any = [];

    tabs = [{
        key: '1',
        title: 'New Tab',
        type: 'file'
    }];

    selectedTab = '1';

    * init(): any {
        let files = yield window.rpc.getFiles()
        this.files = JSON.parse(files)
        console.log(this.files)
    }

    selectTab(key: string) {
        this.selectedTab = key;
    }

    openTab(key: string, title: string, type: string) {
        if (this.tabs.length == 1 && this.tabs[0].key === '1') {
            this.tabs.splice(0, 1);
        }
        for (let tab of this.tabs) {
            if (tab.key === key) {
                this.selectedTab = key
                return;
            }
        }
        this.tabs.push({key: key, title: title, type: type})
        this.selectedTab = key
    }


    remove(key: any) {
        if (this.tabs.length == 1) {
            return
        }
        this.tabs.forEach((item, index) => {
            if (item.key == key) {
                this.tabs.splice(index, 1);
                let pos = index  < this.tabs.length ? index : this.tabs.length - 1;
                this.selectedTab = this.tabs[pos].key
            }
        })

    }

    * send(editor: any): any {
        let s = yield window.rpc.send(JSON.stringify(editor))
        console.log(s)
    }

    * importFile(): any {
        let res = yield window.rpc.importFile()
        console.log('import file ', res)
        return res;
    }
}


export const context = createContext({store: new Rpc()});