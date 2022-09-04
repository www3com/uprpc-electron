import {loadSync} from '@grpc/proto-loader';
import {credentials, GrpcObject, loadPackageDefinition} from '@grpc/grpc-js';
import {BrowserWindow} from "electron";


export async function send(window: BrowserWindow, params: string) {
    let req = JSON.parse(params);
    debugger
    let packageDefinition = loadSync(
        [req.path],
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: ['/Users/jason/dev/grpc/proto']
        });


    let grpcObject = loadPackageDefinition(packageDefinition);

    let service;
    if (req.namespace == '') {
        service = grpcObject[req.service];
    } else {
        service = grpcObject[req.namespace][req.service]
    }

    let client = new service(req.host, credentials.createInsecure());
    client[req.method](req.requestBody, (err: any, response: any) => {
            if (err != null) {
                console.log(err)
            }
            window.webContents.send('updateResponse', {id: req.id, responseBody: response})
            console.log(response)
        }
    );
}
