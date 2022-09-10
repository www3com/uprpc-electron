declare global {
    //设置全局属性
    interface Window {
        //window对象属性
        rpc: any; //加入对象
    }
}

// 请求信息
export interface RequestData {
    id: string;
    protoPath: string;
    namespace: string;
    serviceName: string;
    methodName: string;
    methodMode: Mode;
    host: string;
    body: any;
    metadata?: any;
}

// 响应信息
export interface ResponseData {
    id: string,
    body: string,
    metadata?: any
}

export enum Mode {
    Unary = 0,
    ClientStream = 1,
    ServerStream = 2,
    BidirectionalStream = 3
}

export interface Method {
    id: string,
    name: string,
    mode: Mode,
    requestBody: string,
    requestMetadata?: any,
    responseMetadata?: any
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
    metadata?: any,
    body: string,
    streams: string[]
}

export enum TabType {
    Welcome,
    Proto,
    Env
}

export interface Tab {
    key: string,
    title: string,
    type?: TabType,
    params?: any,
    dot?: boolean,
    closable?: boolean
}

export const modeMap = {
    [Mode.Unary]: "Unary",
    [Mode.ClientStream]: "Client Stream",
    [Mode.ServerStream]: "Server Stream",
    [Mode.BidirectionalStream]: "Bidirectional Stream",
};
