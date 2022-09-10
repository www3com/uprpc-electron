import {makeAutoObservable} from "mobx";
import {createContext} from "react";
import {Proto, RequestCache, RequestData, ResponseCache, ResponseData, Tab} from "@/types/types";
import protoList from '../../mock/rpc.json';

export default class ProtoStore {
    constructor() {
        console.log('init rpc store')
        makeAutoObservable(this)
        this.init()
    }

    protos: Proto[] = [];
    requestCaches: Map<string, RequestCache> = new Map<string, RequestCache>();
    responseCaches: Map<string, ResponseCache> = new Map<string, ResponseCache>();

    * init(): any {
        this.responseCaches.set("64f973c8-8b8b-4200-ab4d-3e22558def63", {body: 'body', streams:['sss1', 's2']})
        this.protos = protoList.files;//JSON.parse(yield window.rpc.getFiles())
        this.onResponse();
    }

    onResponse() {
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
    }

    * importFile(): any {
        return yield window.rpc.importFile()
    }

    * send(requestData: RequestData): any {
        // 清空缓存
        this.requestCaches.clear();
        this.responseCaches.clear();
        let s = yield window.rpc.send(JSON.stringify(requestData))
        console.log(s)
    }

    * push(requestData: RequestData): any {
        let s = yield window.rpc.send(JSON.stringify(requestData))
        console.log(s)
    }

    * stop() {

    }

}