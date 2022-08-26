const PROTO_PATH = __dirname + '/./proto/fee_service.proto';
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const {ipcMain} = require('electron')

function send(params) {
    console.log("receive params: ", params)
    const packageDefinition = protoLoader.loadSync(
        ['/Users/jason/dev/grpc/proto/base.proto', PROTO_PATH],
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
    const fee_proto = grpc.loadPackageDefinition(packageDefinition)['fee'];
    // 创建端口号 和 credentials
    const client = new fee_proto['FeeService']('172.31.53.138:9004',
        grpc.credentials.createInsecure());

    // client.sayHello(call,callback)
    client['getFeeRate']({ownerId: 1}, function (err, response) {
        // callback的 err 是server 来返回的 如果无 null 说明无错误
        if (err != null) {
            let t = err.metadata.get("code-bin")[0];

            if (t instanceof Uint8Array && t.length == 4) {
                let result = t.readIntBE(0, t.length)
                console.log(result)
            }


            if (t instanceof Uint8Array && t.length == 8) {
                console.log(t)
                let result = t.readDoubleBE(0)
                console.log(result)
            }

            console.log(err.metadata.getMap())
            // console.log(err.metadata['_internal_repr']['code-bin'][0])
            console.log(JSON.stringify(err.metadata.getMap()))

            return;
            // 说明server端没有出现错误 (两段式请求,只能通过 err 来判断)
        }
        // server端给返回的数据 response
        console.log(response)
    });
}


function init() {
    ipcMain.handle('send', (event, params) => send(JSON.parse(params)))
}

module.exports = {init: init}