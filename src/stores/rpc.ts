import {makeAutoObservable} from "mobx";


export class Rpc {
    tabs = [
        {id: 1, title: 'New Tab'},
        {id: 2, title: '我的页面'}
    ]

    constructor() {
        makeAutoObservable(this)
    }

    add() {
        const len = this.tabs.length + 1;
        this.tabs.push({id: len, title: 'title ' + len})
    }

    remove(id: any) {
        this.tabs.forEach((item, index) => {
            debugger
            if (item.id == id) {
                this.tabs.splice(index, 1);
            }
        })
    }
}
