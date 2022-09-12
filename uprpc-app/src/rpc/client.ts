import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition, Metadata, ServiceError } from "@grpc/grpc-js";
import { RequestData, ResponseData, Mode } from "../types";
import { parseMetadata, fromObj } from "./metadata";

let aliveClient = {};
let aliveSessions = {};

export declare function Callback(
    response: ResponseData | null,
    metadata?: any,
    err?: Error,
    closeStream?: boolean
): void;
interface CallOptions {
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
    let { call, methodMode } = aliveSessions[id];
    if (!!call) {
        isWriteable(methodMode) ? call.end() : call.cancel();
        delete aliveSessions[id];
    } else {
        callback(null, new Error("This request not exist: " + id));
    }
}

function invokeUnary(request: RequestData, callback: typeof Callback) {
    let metadata = fromObj(request.metadata);
    let call = getCallStub(request, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onError: (err: any) => {
            console.log("客户端receive:", err);
            callback(null, err.metadata.toJSON(), err);
        },
    });

    return;
}

function invokeServerStream(request: RequestData, callback: typeof Callback) {
    let call = getCallStub(request, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onEnd: (s: any) => callback(null, null, undefined, true),
        onError: (err: any, response: any) => callback(response, err.metadata.getMap(), err, true),
        onMetadata: (metadata: any) => callback(null),
        // onStatus: (status: any) => callback(null),
    });
}

function invokeClientStream(request: RequestData, callback: typeof Callback) {
    let call = getCallStub(request, {
        onEnd: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onError: (err: any, response: any) => callback(response, err.metadata.getMap(), err, true),
    });
    call.write(JSON.parse(request.body));
}

function invokeBidirectionalStream(request: RequestData, callback: typeof Callback) {
    let call = getCallStub(request, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onEnd: () => callback(null, null, undefined, true),
        onError: (err: any, response: any) => callback(response, err.metadata.getMap(), err, true),
        onMetadata: (metadata: any) => callback(null),
        onStatus: (status: any) => callback(null),
    });
    call.write(JSON.parse(request.body));
}

function getCallStub(request: RequestData, callOptions: CallOptions) {
    let client = getClient(request);
    return getOrCreateSession(client, request, callOptions);
}

function getOrCreateSession(client: any, request: RequestData, callOptions: CallOptions) {
    if (request.methodMode === Mode.Unary) {
        try {
            client[request.methodName](JSON.parse(request.body), (err: ServiceError, response: any) => {
                console.log("收到服务端返回数据：", err, response);
                if (err != null) {
                    callOptions.onError ? callOptions.onError(err, response) : void 0;
                } else {
                    callOptions.onData ? callOptions.onData(response) : void 0;
                }
            });
        } catch (err) {
            callOptions.onError ? callOptions.onError(err, null) : void 0;
        }
        return;
    }

    let call = null;
    if (!!aliveSessions[request.id]) {
        call = aliveSessions[request.id].call;
    }

    call =
        request.methodMode === Mode.BidirectionalStream
            ? client[request.methodName]()
            : client[request.methodName](JSON.parse(request.body));

    if (callOptions?.onData) {
        call.on("data", callOptions.onData);
    }
    if (callOptions?.onEnd) {
        call.on("end", (data: any) => {
            console.log("服务器发送end,客户端关闭", data);
            delete aliveSessions[request.id];
            callOptions.onEnd ? callOptions.onEnd() : void 0;
        });
    }
    if (callOptions?.onError) {
        call.on("error", (e: Error) => {
            console.log("发生异常,客户端关闭");
            delete aliveSessions[request.id];
            callOptions.onError ? callOptions.onError(e) : void 0;
        });
    }
    if (callOptions?.onMetadata) {
        call.on("metadata", callOptions.onMetadata);
    }
    if (callOptions?.onStatus) {
        call.on("status", (s: any) => {
            console.log("连接状态发生变化：", s);
            callOptions.onStatus ? callOptions.onStatus(s) : void 0;
        });
    }
    aliveSessions[request.id] = {
        call: call,
        methodMode: request.methodMode,
    };
    return call;
}

function getClient(request: RequestData) {
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

    if (request.methodMode === Mode.Unary) {
        return new service(request.host, credentials.createInsecure());
    }

    let client = null;
    if (!aliveClient[request.serviceName]) {
        client = new service(request.host, credentials.createInsecure());
        aliveClient[request.serviceName] = client;
    } else {
        client = aliveClient[request.serviceName];
    }
    return client;
}

function isWriteable(mode: Mode): boolean {
    return mode === Mode.BidirectionalStream || mode === Mode.ClientStream;
}
