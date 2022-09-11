import {makeAutoObservable} from "mobx";
import {Method, Mode, Proto, RequestCache, RequestData, ResponseCache, ResponseData} from "@/types/types";

export default class ProtoStore {
    constructor() {
        console.log("init rpc store");
        makeAutoObservable(this);
        this.init();
    }

    protos: Proto[] = [];
    requestCaches: Map<string, RequestCache> = new Map<string, RequestCache>();
    responseCaches: Map<string, ResponseCache> = new Map<string, ResponseCache>();
    runningCaches: Map<string, boolean> = new Map<string, boolean>();

    init(): any {
        this.getProtos();
        this.onEndStream();
        this.onResponse();
    }

    * getProtos() {
        this.protos = JSON.parse(yield window.rpc.getFiles())
    }

    onEndStream() {
        window.rpc.handleEndStream((event: any, methodId: string) => {
            this.runningCaches.set(methodId, false);
        });
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


    * importProto(): any {
        let files = yield window.rpc.importFile();
        this.getProtos();
        return files;
    }

    * reloadProto(): any {
        console.log('reload file');
    }

    * deleteProto(id: string) {
        console.log('delete proto')
    }

    * send(requestData: RequestData): any {
        console.log('Request data: ', requestData)
        this.removeCache(requestData.id)
        yield this.push(requestData);
        if (requestData.methodMode != Mode.Unary) {
            this.runningCaches.set(requestData.id, true);
        }
    }

    removeCache(methodId: string) {
        // 清空缓存
        this.requestCaches.delete(methodId);
        this.responseCaches.delete(methodId);
        this.runningCaches.delete(methodId);
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

        requestData.metadata = this.getMetadata(requestData.metadata);
        yield window.rpc.send(requestData);
    }

    * stopStream(methodId: string) {
        console.log('request stop stream');
        yield window.rpc.stopStream(methodId);
        this.runningCaches.set(methodId, false);
    }

    * save(method: Method) {
        console.log('save method', method);
        method.requestMetadata = this.getMetadata(method.requestMetadata);
        yield window.rpc.save(method);
    }

    getMetadata(metadata: any) {
        if (metadata == null || metadata.length == 0) {
            return [];
        }
        let data = [...metadata];
        console.log("...", data)
        data.pop();
        return data;
    }
}
