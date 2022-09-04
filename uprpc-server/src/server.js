const protoDir = __dirname + "/../proto/helloworld.proto";

var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

function loadProto(protoPath) {
  var packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition).helloworld;
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
  var server = new grpc.Server();

  // load proto and register
  let grpcDefinition = loadProto(protoDir);
  registerService(server, grpcDefinition);

  await new Promise((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:9000`,
      grpc.ServerCredentials.createInsecure(),
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
  server.start();
  // 显示是否启动成功
  console.log(server.started);
}

const server = {
  start: async () => await start(),
};

module.exports = server;
