"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const proto_loader_1 = require("@grpc/proto-loader");
const grpc_js_1 = require("@grpc/grpc-js");
const protoDir = __dirname + "/../proto/helloworld.proto";
function loadProto(protoPath) {
    var packageDefinition = (0, proto_loader_1.loadSync)(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });
    return (0, grpc_js_1.loadPackageDefinition)(packageDefinition).helloworld;
}
function registerService(server, grpcDefinition) {
    server.addService(grpcDefinition.Greeter.service, {
        sayHelloSimple: sayHelloSimple,
    });
}
// 简单gRPC调用
function sayHelloSimple(call, callback) {
    callback(null, { message: "Hello " + call.request.name });
}
async function start() {
    var server = new grpc_js_1.Server();
    // load proto and register
    let grpcDefinition = loadProto(protoDir);
    registerService(server, grpcDefinition);
    await new Promise((resolve, reject) => {
        server.bindAsync(`0.0.0.0:9005`, grpc_js_1.ServerCredentials.createInsecure(), (err, result) => (err ? reject(err) : resolve(result)));
    });
    server.start();
}
exports.start = start;
//# sourceMappingURL=server.js.map