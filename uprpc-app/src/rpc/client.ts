import { loadSync } from "@grpc/proto-loader";
import {
  credentials,
  GrpcObject,
  loadPackageDefinition,
  Metadata,
  ServiceError,
} from "@grpc/grpc-js";
import { FullMethod } from "@/types";

let aliveClient = {};
let aliveSessions = {};

export async function send(
  params: string,
  callback: (request: any, response: any, err?: Error) => void
) {
  let method: FullMethod = JSON.parse(params);
  let client = getClient(method);

  invokeUnary(client, method, callback);
  // invokeBidirectionalStream(client, method, callback);
}

function getClient(method: FullMethod) {
  let packageDefinition = loadSync([method.path], {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: ["../uprpc-mock/proto"],
  });

  let grpcObject: GrpcObject = loadPackageDefinition(packageDefinition);

  let service = null;
  if (method.namespace == "") {
    service = grpcObject[method.service];
  } else {
    service = grpcObject[method.namespace][method.service];
  }

  let client = null;
  if (!aliveClient[service.serviceName]) {
    client = new service(method.host, credentials.createInsecure());
    aliveClient[service.serviceName] = client;
  } else {
    client = aliveClient[service.serviceName];
  }
  return client;
}

function invokeUnary(
  client: any,
  method: FullMethod,
  callback: (request: any, response: any, err?: Error) => void
) {
  let metadata = new Metadata();
  metadata.add("callId", "123");
  let call = client[method.name](
    method.requestBody,
    metadata,
    (err: ServiceError, response: any) => {
      if (err != null) {
        let codeBin = err.metadata.get("code-bin");
        console.log(
          "received error:",
          err.code,
          err.message,
          codeBin.toString()
        );
      }
      callback(method, response, err);
    }
  );
}

function invokeServerStream(
  client: any,
  req: any,
  callback: (request: any, response: any, err?: Error) => void
) {
  client[req.name](req.requestBody, (err: any, response: any) => {
    if (err != null) {
      console.log(err);
    }
    callback(req, response, err);
  });
}

function invokeClientStream(
  client: any,
  req: any,
  callback: (request: any, response: any, err?: Error) => void
) {
  client[req.name](req.requestBody, (err: any, response: any) => {
    if (err != null) {
      console.log(err);
    }
    callback(req, response, err);
  });
}

function invokeBidirectionalStream(
  client: any,
  req: any,
  callback: (request: any, response: any, err?: Error) => void
) {
  let call = null;
  if (!aliveSessions[req.name]) {
    call = client[req.name]();
    call.on("data", (response: any) => {
      console.log("客户端receive:", response);
      callback(req, response);
    });
    call.on("end", () => {
      console.log("服务器发送end,客户端关闭");
      delete aliveSessions[req.name];
    });
    call.on("error", (e: Error) => {
      console.log("服务器发送end,客户端关闭");
      callback(req, null, e);
    });
    call.on("metadata", (metadata: any) => {
      console.log("客户端 metadata:", metadata);
    });
    call.on("status", (status: any) => {
      console.log("客户端 status:", status);
    });
    aliveSessions[req.name] = call;
  } else {
    call = aliveSessions[req.name];
  }
  call.write(req.requestBody);
}
