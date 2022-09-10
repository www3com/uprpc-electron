declare global {
    //设置全局属性
    interface Window {
        //window对象属性
        rpc: any; //加入对象
    }
}
export interface MethodInfo {
    id: string;
    protoPath: string;
    namespace: string;
    serviceName: string;
    name: string;
    mode: Mode;
}

// 请求信息
export interface RequestData {
    id: string;
    pos: string;
    host: string;
    body: any;
    metadata?: any;
}

// 响应信息
export interface ResponseData {
    id: string;
    body?: any;
    metadata?: any;
}

export enum Mode {
    Unary = 1,
    ClientStream = 2,
    ServerStream = 3,
    BidirectionalStream = 4,
}

export interface Method {
    id: string;
    name: string;
    mode: Mode;
    pos: string;
    requestBody: any;
    requestConf?: any;
    responseConf?: any;
}

export interface Service {
    id: string;
    name: string;
    namespace: string;
    methods: Method[];
}

export interface Proto {
    id: string;
    name: string;
    path: string;
    host: string;
    services: Service[];
}

export interface RequestCache {
    streams?: string[];
}

export interface ResponseCache {
    metadata?: any;
    body?: string;
    streams?: string[];
}

export interface Tab {
    key: string;
    title: string;
    type: string;
    pos: string;
}

export const modeMap = {
    [Mode.Unary]: "Unary",
    [Mode.ClientStream]: "Client Stream",
    [Mode.ServerStream]: "Server Stream",
    [Mode.BidirectionalStream]: "Bidirectional Stream",
};
