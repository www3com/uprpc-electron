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
        let count = 0;
        let s = setInterval(() => {
            call.write({ message: "sayHelloServer: now time is:" + new Date() });
            count++;
            if (count > 10) {
                call.end();
                clearInterval(s);
            }
        }, 1000);
    }
    // 简单gRPC调用
    sayHelloClient(call: any, callback: any) {
        call.on("data", (data: any) => {
            console.log("sayHelloClient: receive客户端: ", data);
            call.write({ message: "you send to me:" + data.name });
        });
        call.on("end", function () {
            console.log("sayHelloClient:服务器发送end,客户端关闭");
        });
    }
    // 简单gRPC调用
    sayHelloDouble(call: any, callback: any) {
        call.on("data", (data: any) => {
            console.log("sayHelloDouble: 客户端receive:", data);
            call.write({ message: "sayHelloDouble: you send to me:" + data.name });
        });
        call.on("end", function () {
            console.log("sayHelloDouble: 服务器发送end,客户端关闭");
        });
    }
}
