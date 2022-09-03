declare global {  //设置全局属性
    interface Window {  //window对象属性
        rpc: any;   //加入对象
    }
}

export interface Method {
    id: string,
    name: string,
    requestBody: any,
    requestMetadata?: any,
    responseBody?: any,
    responseMetadata?: any
}

export interface FullMethod extends Method{
    host: string,
    path: string,
    namespace: string,
    service: string,
}

export interface Service {
    id: string,
    name: string,
    namespace: string,
    methods: Method[]
}

export interface Proto {
    id: string,
    name: string,
    path: string,
    host: string,
    services: Service[]
}

export interface Tab {
    key: string,
    title: string,
    type: string
}


export interface Response {
    id: string,
    responseBody: any,
    responseMetadata: any
}