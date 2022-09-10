import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition, Metadata, ServiceError } from "@grpc/grpc-js";
import { RequestData, ResponseData, Mode } from "../types";

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
    let call = aliveSessions[id];
    if (!!call) {
        callback(null, new Error("This request not exist: " + id));
    }
    call.end();
}

function getClient(request: RequestData) {
    let packageDefinition = loadSync([request.protoPath], {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
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
    callback: (response: ResponseData | null, err?: Error) => void
) {
    let metadata = new Metadata();
    client[request.methodName](request.body, metadata, (err: ServiceError, response: any) => {
        if (err != null) {
            let codeBin = err.metadata.get("code-bin");
            console.log("received error:", err.code, err.message, codeBin.toString());
        }
        callback(response, err);
    });
}

function invokeServerStream(
    client: any,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    client[request.methodName](request.body, (err: any, response: any) => {
        if (err != null) {
            console.log(err);
        }
        callback(response, err);
    });
}

function invokeClientStream(
    client: any,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    client[request.methodName](request.body, (err: any, response: any) => {
        if (err != null) {
            console.log(err);
        }
        callback(response, err);
    });
}

function invokeBidirectionalStream(
    client: any,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    let call = getOrCreateSession(client, request.id, {
        onData: (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        },
        onEnd: () => callback(null),
        onError: (e: Error) => callback(null),
        onMetadata: (metadata: any) => callback(null),
        onStatus: (status: any) => callback(null),
    });
    call.write(JSON.parse(request.body));
}

function getOrCreateSession(client: any, id: string, callOptions: CallOptions) {
    let call = null;
    if (!aliveSessions[id]) {
        call = client[id]();
        if (callOptions?.onData) {
            call.on("data", callOptions.onData);
        }
        if (callOptions?.onEnd) {
            call.on("end", () => {
                console.log("服务器发送end,客户端关闭");
                delete aliveSessions[id];
                callOptions.onEnd ? callOptions.onEnd() : void 0;
            });
        }
        if (callOptions?.onError) {
            call.on("error", (e: Error) => {
                console.log("发生异常,客户端关闭");
                delete aliveSessions[id];
                callOptions.onError ? callOptions.onError(e) : void 0;
            });
        }
        if (callOptions?.onMetadata) {
            call.on("metadata", callOptions.onMetadata);
        }
        if (callOptions?.onStatus) {
            call.on("status", callOptions.onStatus);
        }
        aliveSessions[id] = call;
    } else {
        call = aliveSessions[id];
    }
    return call;
}

interface CallOptions {
    onData?: Function;
    onEnd?: Function;
    onError?: Function;
    onMetadata?: Function;
    onStatus?: Function;
}
