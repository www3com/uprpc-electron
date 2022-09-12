import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition, Metadata, ServiceError } from "@grpc/grpc-js";
import { RequestData, ResponseData, Mode } from "../types";
import { parseMetadata } from "./metadata";

import * as store from "../storage/store";

let aliveClient = {};
let aliveSessions = {};

export async function send(request: RequestData, callback: (response: ResponseData | null, err?: Error) => void) {
    let reqId: string = request.id;

    let client = getClient(request);
    switch (request.methodMode) {
        case Mode.Unary: {
            invokeUnary(client, request, callback);
            break;
        }
        case Mode.ClientStream: {
            invokeClientStream(client, request, callback);
            break;
        }
        case Mode.ServerStream: {
            invokeServerStream(client, request, callback);
            break;
        }
        case Mode.BidirectionalStream: {
            invokeBidirectionalStream(client, request, callback);
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

function getClient(request: RequestData) {
    let packageDefinition = loadSync([request.protoPath], {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: store.getPaths(),
    });

    let grpcObject: GrpcObject = loadPackageDefinition(packageDefinition);

    let service = null;
    if (request.namespace == "") {
        service = grpcObject[request.namespace];
    } else {
        service = grpcObject[request.namespace][request.serviceName];
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

function invokeUnary(
    client: any,
    request: RequestData,
    callback: (response: any | null, err?: Error, closeStream?: boolean) => void
) {
    let metadata = new Metadata();
    metadata.add("code-bin", Buffer.from("sa"));
    let code1: Buffer = Buffer.alloc(64);
    code1.writeBigInt64LE(BigInt(100));
    code1.writeBigInt64LE(BigInt(200002002));
    metadata.add("code-bin", code1);

    client[request.methodName](JSON.parse(request.body), metadata, (err: ServiceError, response: any) => {
        if (err != null) {
            let code;

            let t = err.metadata.get("code-bin")[0];
            if (t instanceof Uint8Array && t.length == 4) {
                code = t.readIntBE(0, t.length);
            }
            if (t instanceof Uint8Array && t.length == 8) {
                code = t.readIntBE(0, t.length);
            }
            console.log("received error:", err.code, err.message, code);
            let md = parseMetadata(err.metadata);
            console.log("received md:", md);
        }
        callback(response, err);
    });
}

function invokeServerStream(
    client: any,
    request: RequestData,
    callback: (response: any | null, err?: Error, closeStream?: boolean) => void
) {
    let call = getOrCreateSession(client, request, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onEnd: () => {},
        onError: (e: Error, response: any) => callback(response, undefined, true),
        onMetadata: (metadata: any) => callback(null),
        // onStatus: (status: any) => callback(null),
    });
}

function invokeClientStream(
    client: any,
    request: RequestData,
    callback: (response: any | null, err?: Error, closeStream?: boolean) => void
) {
    let call = getOrCreateSession(client, request, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onError: (e: Error, response: any) => callback(response, e, true),
    });
    call.write(JSON.parse(request.body));
}

function invokeBidirectionalStream(
    client: any,
    request: RequestData,
    callback: (response: any | null, err?: Error, closeStream?: boolean) => void
) {
    let call = getOrCreateSession(client, request, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onEnd: () => callback(null, undefined, true),
        onError: (e: Error, response: any) => callback(response, e, true),
        onMetadata: (metadata: any) => callback(null),
        onStatus: (status: any) => callback(null),
    });
    call.write(JSON.parse(request.body));
}

function getOrCreateSession(client: any, request: RequestData, callOptions: CallOptions) {
    let call = null;
    if (!aliveSessions[request.id]) {
        call =
            request.methodMode === Mode.BidirectionalStream
                ? client[request.methodName]()
                : client[request.methodName](request.body, (err: ServiceError, response: any) => {
                      console.log("收到服务端返回数据：", err, response);
                      if (err != null) {
                          callOptions.onError ? callOptions.onError(err, response) : void 0;
                      } else {
                          callOptions.onData ? callOptions.onData(response) : void 0;
                      }
                  });
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
    } else {
        call = aliveSessions[request.id].call;
    }
    return call;
}

function isWriteable(mode: Mode): boolean {
    return mode === Mode.BidirectionalStream || mode === Mode.ClientStream;
}

interface CallOptions {
    onData?: Function;
    onEnd?: Function;
    onError?: Function;
    onMetadata?: Function;
    onStatus?: Function;
}
