import {loadSync} from "@grpc/proto-loader";
import {loadPackageDefinition, Server, ServerCredentials} from "@grpc/grpc-js";

const protoDir = __dirname + "/../proto/helloworld.proto";


function loadProto(protoPath: string) {
    var packageDefinition = loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });
    return loadPackageDefinition(packageDefinition).helloworld;
}

function registerService(server: Server, grpcDefinition: any) {
    server.addService(grpcDefinition.Greeter.service, {
        sayHelloSimple: sayHelloSimple,
    });
}

// 简单gRPC调用
function sayHelloSimple(call: any, callback: any) {
    callback(null, {message: "Hello " + call.request.name});
}

export async function start() {
    var server = new Server();

    // load proto and register
    let grpcDefinition = loadProto(protoDir);
    registerService(server, grpcDefinition);

    await new Promise((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:9005`,
            ServerCredentials.createInsecure(),
            (err, result) => (err ? reject(err) : resolve(result))
        );
    });
    server.start();
}

