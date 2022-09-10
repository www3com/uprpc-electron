import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, GrpcObject, Server, ServerCredentials, Metadata, MetadataValue } from "@grpc/grpc-js";
import { clearLine } from "readline";

const protoDir = __dirname + "/../proto/helloworld.proto";

export class HelloWorldService {
    grpcDefinition: any;
    constructor() {
        var packageDefinition = loadSync(protoDir, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.grpcDefinition = loadPackageDefinition(packageDefinition);
    }

    registerService(server: Server) {
        server.addService(this.grpcDefinition.helloworld.Greeter.service, {
            sayHelloSimple: this.sayHelloSimple,
            sayHelloServer: this.sayHelloServer,
            sayHelloClient: this.sayHelloClient,
            sayHelloDouble: this.sayHelloDouble,
        });
    }
    // 简单gRPC调用
    sayHelloSimple(call: any, callback: any) {
        // parse request metadata
        let callId = call.metadata.get("callId");
        console.log("callId=", callId);

        let metadata = new Metadata();
        // keys that end with '-bin' must have Buffer values
        metadata.add("code-bin", Buffer.from("9500"));
        metadata.add("data", "sss");
        callback(null, { message: "Hello " + call.request.name }, metadata);
    }
    // 简单gRPC调用
    sayHelloServer(call: any, callback: any) {
        callback(null, { message: "Hello " + call.request.name });
    }
    // 简单gRPC调用
    sayHelloClient(call: any, callback: any) {
        callback(null, { message: "Hello " + call.request.name });
    }
    // 简单gRPC调用
    sayHelloDouble(call: any, callback: any) {
        call.on("data", function (data: any) {
            console.log("客户端receive:", data);
            call.write({ message: "start send to client:" + data.name });
            let metadata = new Metadata();
            for (var i = 0; i < 100; i++) {
                call.write({ message: "send to client data:" + i });
            }

            // keys that end with '-bin' must have Buffer values
            metadata.add("code-bin", Buffer.from("9500"));
            metadata.add("data", "sss");
            call.sendMetadata(metadata);
            call.end(metadata);
        });
        call.on("end", function () {
            console.log("服务器发送end,客户端关闭");
        });
    }
}
