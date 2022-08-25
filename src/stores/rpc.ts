import {makeAutoObservable} from "mobx";
import React, {createContext, useContext} from "react";

const TAB_TYPE_RPC = "rpc";

export default class Rpc {
    constructor() {
        makeAutoObservable(this)
    }

    tabs = [{
        id: 1,
        title: 'New Tab1',
        type: TAB_TYPE_RPC,
        data: {}
    }]

    len = 1;

    obj1233 = {rr: 2222}

    add() {
        this.len += 1;
        this.tabs.push({
            id: this.len + 1, title: 'title ' + this.len, type: TAB_TYPE_RPC,
            data: {}
        })
    }

    remove(id: any) {
        this.tabs.forEach((item, index) => {
            if (item.id == id) {
                this.tabs.splice(index, 1);
            }
        })
    }
}


export const context = createContext({store: new Rpc()});