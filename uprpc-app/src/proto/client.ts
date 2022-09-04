import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition } from "@grpc/grpc-js";
import { BrowserWindow } from "electron";

let aliveClient = {};
let aliveSessions = {};
export async function send(window: BrowserWindow, params: string) {
  let req = JSON.parse(params);
  let packageDefinition = loadSync([req.path], {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: ["../uprpc-mock/proto"],
  });

  let grpcObject = loadPackageDefinition(packageDefinition);

  let service;
  if (req.namespace == "") {
    service = grpcObject[req.service];
  } else {
    service = grpcObject[req.namespace][req.service];
  }

  let client = null;
  if (!aliveClient[service.serviceName]) {
    client = new service(req.host, credentials.createInsecure());
    aliveClient[service.serviceName] = client;
  } else {
    client = aliveClient[service.serviceName];
  }

  sendStream(window, client, req);
}

function sendReq(window: BrowserWindow, client: any, req: any) {
  client[req.name](req.requestBody, (err: any, response: any) => {
    if (err != null) {
      console.log(err);
    }
    refreshResponse(window, req, response);
  });
}

function sendStream(window: BrowserWindow, client: any, req: any) {
  let call = null;
  if (!aliveSessions[req.name]) {
    call = client[req.name]();
    call.on("data", function (response: any) {
      console.log("客户端receive:", response);
      refreshResponse(window, req, response);
    });
    call.on("end", function () {
      console.log("服务器发送end,客户端关闭");
      delete aliveSessions[req.name];
    });
    aliveSessions[req.name] = call;
  } else {
    call = aliveSessions[req.name];
  }
  call.write(req.requestBody);
}

function refreshResponse(window: BrowserWindow, req: any, response: any): void {
  console.log(response);
  window.webContents.send("updateResponse", {
    id: req.id,
    responseBody: response,
  });
}
