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
    let call = null;
    if (!aliveSessions[request.id]) {
        call = client[request.id]();
        call.on("data", (response: any) => {
            console.log("客户端receive:", response);
            callback(response);
        });
        call.on("end", () => {
            console.log("服务器发送end,客户端关闭");
            delete aliveSessions[request.id];
            callback(null);
        });
        call.on("error", (e: Error) => {
            console.log("服务器发送end,客户端关闭");
            callback(null, e);
        });
        call.on("metadata", (metadata: any) => {
            console.log("客户端 metadata:", metadata);
            callback(null);
        });
        call.on("status", (status: any) => {
            console.log("客户端 status:", status);
        });
        aliveSessions[request.id] = call;
    } else {
        call = aliveSessions[request.id];
    }
    call.write(JSON.parse(request.body));
}
