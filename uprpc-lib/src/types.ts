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
  host: string;
  body: string;
  metadata?: any;
}

// 响应信息
export interface ResponseData {
  id: string;
  body?: string;
  metadata?: any;
}

export enum Mode {
  Unary,
  ClientStream,
  ServerStream,
  BidirectionalStream,
}

export interface Method {
  id: string;
  name: string;
  mode: Mode;
  requestBody: string;
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

export interface ResponseCache {
  metadata?: any;
  body: string;
  streams: string[];
}

export interface Tab {
  key: string;
  title: string;
  type: string;
}
