"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldService = void 0;
const proto_loader_1 = require("@grpc/proto-loader");
const grpc_js_1 = require("@grpc/grpc-js");
const protoDir = __dirname + "/../proto/helloworld.proto";
class HelloWorldService {
    grpcDefinition;
    constructor() {
        var packageDefinition = (0, proto_loader_1.loadSync)(protoDir, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.grpcDefinition = (0, grpc_js_1.loadPackageDefinition)(packageDefinition);
    }
    registerService(server) {
        server.addService(this.grpcDefinition.helloworld.Greeter.service, {
            sayHelloSimple: this.sayHelloSimple,
            sayHelloServer: this.sayHelloServer,
            sayHelloClient: this.sayHelloClient,
            sayHelloDouble: this.sayHelloDouble,
        });
    }
    // 简单gRPC调用
    sayHelloSimple(call, callback) {
        callback(null, { message: "Hello " + call.request.name });
    }
    // 简单gRPC调用
    sayHelloServer(call, callback) {
        callback(null, { message: "Hello " + call.request.name });
    }
    // 简单gRPC调用
    sayHelloClient(call, callback) {
        callback(null, { message: "Hello " + call.request.name });
    }
    // 简单gRPC调用
    sayHelloDouble(call, callback) {
        call.on("data", function (data) {
            console.log("客户端receive:", data);
            call.write({ message: "start send to client:" + data.name });
            for (var i = 0; i < 100; i++) {
                call.write({ message: "send to client data:" + i });
            }
        });
        call.on("end", function () {
            console.log("服务器发送end,客户端关闭");
        });
    }
}
exports.HelloWorldService = HelloWorldService;
//# sourceMappingURL=helloService.js.map