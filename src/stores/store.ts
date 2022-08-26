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

export interface EditorProp {
    id: number,
    type: string,
    title: string,
    host: string,
    request: RequestProp,
    response: ResponseProp
}

export default class Rpc {
    constructor() {
        makeAutoObservable(this)
    }

    tabs: EditorProp[] = [{
        id: 1,
        title: 'New Tab1',
        type: TAB_TYPE_RPC,
        host: "host",
        request: {body: `{"id": 1, "name": 'zhangsan'}`, metadata: [{key: '1', value: 'v', method: ""}]},
        response: {body: `{"id": 2, "name": 'zhang'}`, metadata: [{key: '2', value: 'value', method: ""}]},
    }]


    add() {
        // this.tabs.push({
        //     id: this.len + 1, title: 'title ' + this.len, type: TAB_TYPE_RPC,
        //     data: {}
        // })


    }

    remove(id: any) {
        this.tabs.forEach((item, index) => {
            if (item.id == id) {
                this.tabs.splice(index, 1);
            }
        })
    }

    * send(editor: EditorProp): any {
        let s = yield window.rpc.send(JSON.stringify(editor))
        console.log(s)
    }
}


export const context = createContext({store: new Rpc()});