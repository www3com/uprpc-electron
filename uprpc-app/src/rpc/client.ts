import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition, StatusObject, ServiceError } from "@grpc/grpc-js";
import { RequestData, ResponseData, Mode } from "../types";
import { parseMetadata, parseMds } from "./metadata";

const clientCaches = {};
const callCache = {};
export declare function Callback(
    response: ResponseData | null,
    metadata?: any,
    err?: Error,
    closeStream?: boolean
): void;

interface ClientStub {
    service: any;
    call: Function;
    onData?: Function;
    onEnd?: Function;
    onError?: Function;
    onMetadata?: Function;
    onStatus?: Function;
}

export async function send(request: RequestData, callback: typeof Callback) {
    let reqId: string = request.id;
    switch (request.methodMode) {
        case Mode.Unary: {
            invokeUnary(request, callback);
            break;
        }
        case Mode.ClientStream: {
            invokeClientStream(request, callback);
            break;
        }
        case Mode.ServerStream: {
            invokeServerStream(request, callback);
            break;
        }
        case Mode.BidirectionalStream: {
            invokeBidirectionalStream(request, callback);
            break;
        }
        default: {
            callback(null, new Error("Unsupported method mode:" + request.methodMode));
            return;
        }
    }
}

export async function stop(id: string, callback: (response: ResponseData | null, err?: Error) => void) {
    let { call, methodMode } = callCache[id];
    if (!!call) {
        Mode.isWriteStream(methodMode) ? call.end() : call.cancel();
        delete callCache[id];
    } else {
        callback(null, new Error("This request not exist: " + id));
    }
}

function invokeUnary(request: RequestData, callback: typeof Callback) {
    let metadata = parseMds(request.mds || []);
    let client: ClientStub = getCallStub(request);
    client.call(request, callback);
    return;
}

function invokeServerStream(request: RequestData, callback: typeof Callback) {
    let client: ClientStub = getCallStub(request);
    let call = client.call(request, callback);
}

function invokeClientStream(request: RequestData, callback: typeof Callback) {
    let client: ClientStub = getCallStub(request);
    let call = client.call(request, callback);
    call.write(JSON.parse(request.body));
}

function invokeBidirectionalStream(request: RequestData, callback: typeof Callback) {
    let client: ClientStub = getCallStub(request);
    let call = client.call(request, callback);
    call.write(JSON.parse(request.body));
}

function getCallStub(request: RequestData): ClientStub {
    let clientKey = request.serviceName;
    if (clientCaches[clientKey] && request.host == clientCaches[clientKey].host) {
        return clientCaches[clientKey];
    }

    let packageDefinition = loadSync([request.protoPath], {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: request.includeDirs,
    });

    let grpcObject: GrpcObject = loadPackageDefinition(packageDefinition);
    let service = null;
    if (request.namespace == "") {
        service = grpcObject[request.namespace];
    } else {
        service = grpcObject[request.namespace][request.serviceName];
    }

    let serviceImpl = new service(request.host, credentials.createInsecure());
    let clientStub = {
        host: request.host,
        service: serviceImpl,
        call: (request: RequestData, callback?: Function) => createCall(serviceImpl)(request, callback),
    };
    clientCaches[clientKey] = clientStub;
    return clientStub;
}

function createCall(serviceImpl: any): Function {
    return (request: RequestData, callback: CallableFunction) => {
        let call: any = callCache[request.id];
        if (call) {
            return call.call;
        }
        let matadata = parseMds(request.mds || []);

        if (Mode.isGrpcCallback(request.methodMode)) {
            let grpcCallback = (err: ServiceError, response: any) => {
                console.log("收到服务端返回数据：", err, response);
                callback(response, parseMetadata(err?.metadata), err);
            };
            if (request.methodMode === Mode.Unary) {
                call = serviceImpl[request.methodName](JSON.parse(request.body), matadata, grpcCallback);
            } else {
                call = serviceImpl[request.methodName](matadata, grpcCallback);
            }
        } else {
            if (request.methodMode === Mode.BidirectionalStream) {
                call = serviceImpl[request.methodName]();
            } else {
                call = serviceImpl[request.methodName](matadata, JSON.parse(request.body));
            }
        }

        if (Mode.isStream(request.methodMode)) {
            listenStatusAndCallback(request.id, call, callback);
            if (Mode.isReadStream(request.methodMode)) {
                listenDataAndCallback(request.id, call, callback);
            }
            callCache[request.id] = { methodMode: request.methodMode, call: call };
        }
        return call;
    };
}

function listenDataAndCallback(reqId: any, call: any, callback?: CallableFunction) {
    call.on("data", (data: any) => {
        console.log("data收到数据：", data);
        if (callback) {
            callback(data);
        }
    });
}
function listenStatusAndCallback(reqId: any, call: any, callback?: CallableFunction) {
    call.on("error", (e: Error) => {
        console.log("发生异常,客户端关闭");
    });
    call.on("status", (status: StatusObject) => {
        console.log("status收到数据：", status);
        if (callback) {
            status.code === 0
                ? callback(null, parseMetadata(status.metadata), undefined, true)
                : callback(null, null, new Error(status.details), true);
        }
        delete callCache[reqId];
    });
}
