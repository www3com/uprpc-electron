import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition, Metadata, ServiceError } from "@grpc/grpc-js";
import { RequestData, ResponseData, MethodInfo, Mode } from "../types";
import * as store from "../storage/store";

let aliveClient = {};
let aliveSessions = {};

export async function send(request: RequestData, callback: (response: ResponseData | null, err?: Error) => void) {
    let reqId: string = request.id;

    let methodInfo = store.getMethodInfo(reqId, request.pos);
    if (methodInfo == null) {
        callback(null, new Error("the method is not exist"));
        return;
    }

    let client = getClient(methodInfo, request.host);
    switch (methodInfo.mode) {
        case Mode.Unary: {
            invokeUnary(client, methodInfo, request, callback);
            break;
        }
        case Mode.ClientStream: {
            invokeClientStream(client, methodInfo, request, callback);
            break;
        }
        case Mode.ServerStream: {
            invokeServerStream(client, methodInfo, request, callback);
            break;
        }
        case Mode.BidirectionalStream: {
            invokeBidirectionalStream(client, methodInfo, request, callback);
            break;
        }
        default: {
            callback(null, new Error("Unsupported method mode:" + methodInfo.mode));
            return;
        }
    }
}

function getClient(methodInfo: MethodInfo, server: string) {
    let packageDefinition = loadSync([methodInfo.protoPath], {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: ["../uprpc-mock/proto"],
    });

    let grpcObject: GrpcObject = loadPackageDefinition(packageDefinition);

    let service = null;
    if (methodInfo.namespace == "") {
        service = grpcObject[methodInfo.namespace];
    } else {
        service = grpcObject[methodInfo.namespace][methodInfo.serviceName];
    }

    let client = null;
    if (!aliveClient[service.serviceName]) {
        client = new service(server, credentials.createInsecure());
        aliveClient[service.serviceName] = client;
    } else {
        client = aliveClient[service.serviceName];
    }
    return client;
}

function invokeUnary(
    client: any,
    methodInfo: MethodInfo,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    let metadata = new Metadata();
    metadata.add("callId", "123");
    client[methodInfo.name](request.body, metadata, (err: ServiceError, response: any) => {
        if (err != null) {
            let codeBin = err.metadata.get("code-bin");
            console.log("received error:", err.code, err.message, codeBin.toString());
        }
        callback(response, err);
    });
}

function invokeServerStream(
    client: any,
    methodInfo: MethodInfo,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    client[methodInfo.name](request.body, (err: any, response: any) => {
        if (err != null) {
            console.log(err);
        }
        callback(response, err);
    });
}

function invokeClientStream(
    client: any,
    methodInfo: MethodInfo,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    client[methodInfo.name](request.body, (err: any, response: any) => {
        if (err != null) {
            console.log(err);
        }
        callback(response, err);
    });
}

function invokeBidirectionalStream(
    client: any,
    methodInfo: MethodInfo,
    request: RequestData,
    callback: (response: ResponseData | null, err?: Error) => void
) {
    let call = null;
    if (!aliveSessions[methodInfo.name]) {
        call = client[methodInfo.name]();
        call.on("data", (response: any) => {
            console.log("客户端receive:", response);
            callback(request, response);
        });
        call.on("end", () => {
            console.log("服务器发送end,客户端关闭");
            delete aliveSessions[methodInfo.name];
        });
        call.on("error", (e: Error) => {
            console.log("服务器发送end,客户端关闭");
            callback(null, e);
        });
        call.on("metadata", (metadata: any) => {
            console.log("客户端 metadata:", metadata);
        });
        call.on("status", (status: any) => {
            console.log("客户端 status:", status);
        });
        aliveSessions[methodInfo.name] = call;
    } else {
        call = aliveSessions[methodInfo.name];
    }
    call.write(request.body);
}
