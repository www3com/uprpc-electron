import {makeAutoObservable} from "mobx";
import {Method, Mode, Proto, RequestCache, RequestData, ResponseCache, ResponseData} from "@/types/types";
import * as storage from './localStorage';

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

    init(): void {
        this.initProto();
        this.onEndStream();
        this.onResponse();
    }

    initProto(): void {
        this.protos = storage.listProto();
    }

    onEndStream() {
        window.rpc.handleEndStream((event: any, methodId: string) => {
            this.runningCaches.set(methodId, false);
        });
    }

    onResponse() {
        window.rpc.handleResponse((event: any, value: ResponseData) => {
            console.log('Response data: ', value);
            let responseCache = this.responseCaches.get(value.id);
            if (responseCache == null) {
                this.responseCaches.set(value.id, {
                    body: value.body,
                    mds: value.mds,
                    streams: [value.body],
                });
                return;
            }
            // 对响应流处理
            let streams = responseCache.streams;
            if (streams == null) return;
            streams.unshift(value.body);
            this.responseCaches.set(value.id, {...responseCache, streams: streams, mds: value.mds});
        });
    }

    * importProto(): any {
        let res = yield window.rpc.openProto();
        if (!res.success) return res;

        res = yield window.rpc.parseProto(res.data, storage.listIncludeDir());
        storage.addProtos(res.data);
        this.initProto();
        return {success: true}
    }

    * reloadProto(): any {
        let paths: string[] = [];
        storage.listProto().forEach(value => paths.push(value.path))
        let res = yield window.rpc.parseProto(paths, storage.listIncludeDir());
        if (!res.success) {
            console.log('reload proto error')
            return
        }
        storage.reloadProtos(res.data);
        this.initProto();
    }

    * deleteProto(id: string): any {
        storage.removeProto(id);
        this.initProto();
    }

    * saveProto(proto: Proto, host: string, method: Method) {
        console.log("save proto method", method);
        proto.host = host;
        for (let i = 0; i < proto.methods.length; i++) {
            let origMethod = proto.methods[i];
            if (origMethod.id == method.id) {
                proto.methods[i] = method;
            }
        }
        storage.addProto(proto);
        this.initProto();
    }

    * send(requestData: RequestData): any {
        this.removeCache(requestData.id);
        yield this.push(requestData);
        if (requestData.methodMode != Mode.Unary) {
            this.runningCaches.set(requestData.id, true);
        }
    }

    * push(requestData: RequestData): any {
        console.log("send request data", requestData);
        let requestCache = this.requestCaches.get(requestData.id);
        if (requestCache == null) {
            this.requestCaches.set(requestData.id, {streams: [requestData.body]});
        } else {
            let streams = requestCache.streams;
            streams?.unshift(requestData.body);
            this.requestCaches.set(requestData.id, {streams: streams});
        }
        requestData.includeDirs = storage.listIncludeDir();
        yield window.rpc.send(requestData);
    }

    * removeCache(methodId: string): any {
        // 清空缓存
        this.requestCaches.delete(methodId);
        this.responseCaches.delete(methodId);
        this.runningCaches.delete(methodId);
    }

    * stopStream(methodId: string) {
        console.log("request stop stream");
        yield window.rpc.stopStream(methodId);
        this.runningCaches.set(methodId, false);
    }
}
