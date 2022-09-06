export type StackDepth = {
  [type: string]: number;
};

export interface Method {
  id: string;
  name: string;
  requestBody: any;
  requestMetadata?: any;
  responseBody?: any;
  responseMetadata?: any;
}

export interface FullMethod extends Method {
  host: string;
  path: string;
  namespace: string;
  service: string;
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
  services?: Service[];
}

///////////////////////////////////////////
// method call request & reponse
export interface CallRequest {
  id: string;
  tabId: string;
  methodId: string;
  host: string;
  requestBody: any;
  requestMetadata?: any;
}

export interface CallResponse {
  id: string;
  tabId: string;
  methodId: string;
  responseBody?: any;
  responseMetadata?: any;
}
