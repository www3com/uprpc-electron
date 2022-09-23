import { RequestData, ResponseData, Mode } from "../types";
import { Callback, ClientStub, getCallStub, closeCall } from "./calls";

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
    closeCall(id, callback);
}

function invokeUnary(request: RequestData, callback: typeof Callback) {
    let client: ClientStub = getCallStub(request);
    client.call(request, callback);
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
