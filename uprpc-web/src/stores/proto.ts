import {makeAutoObservable} from "mobx";
import {Method, Proto, RequestCache, RequestData, ResponseCache, ResponseData} from "@/types/types";

export default class ProtoStore {
    constructor() {
        console.log("init rpc store");
        makeAutoObservable(this);
        this.init();
    }

    protos: Proto[] = [];
    requestCaches: Map<string, RequestCache> = new Map<string, RequestCache>();
    responseCaches: Map<string, ResponseCache> = new Map<string, ResponseCache>();

    * init(): any {
        this.protos = JSON.parse(yield window.rpc.getFiles())
        this.onResponse();
    }

    onResponse() {
        window.rpc.handleResponse((event: any, value: ResponseData) => {
            let responseCache = this.responseCaches.get(value.id);
            if (responseCache == null) {
                this.responseCaches.set(value.id, {
                    body: value.body,
                    metadata: value.metadata,
                    streams: [value.body]
                })
                return;
            }
            // 对响应流处理
            let streams = responseCache.streams;
            if (streams == null) return;
            streams.unshift(value.body);
            this.responseCaches.set(value.id, {...responseCache, streams: streams});
        });
    }

    * importFile(): any {
        return yield window.rpc.importFile();
    }

    * send(requestData: RequestData): any {
        // 清空缓存
        this.requestCaches.clear();
        this.responseCaches.clear();
        this.push(requestData);
    }

    * push(requestData: RequestData): any {
        console.log("push request data", requestData);
        let requestCache = this.requestCaches.get(requestData.id);
        if (requestCache == null) {
            this.requestCaches.set(requestData.id, {
                streams: [requestData.body]
            });
        } else {
            let streams = requestCache.streams;
            streams?.unshift(requestData.body);
            this.requestCaches.set(requestData.id, {streams: streams})
        }

        yield window.rpc.send(requestData);
    }

    * stop(methodId: string) {
        console.log('stop stream');
        // yield window.rpc.stop(methodId);
    }

    * save(method: Method) {
        console.log('save method', method);
        yield window.rpc.save(method);
    }

}
