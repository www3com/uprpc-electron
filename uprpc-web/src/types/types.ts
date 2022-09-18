declare global {
    interface Window {
        rpc: any
    }
}

enum ParseType {
    Empty,
    IntLE,
    IntBE,
    Int8,
    Int16LE,
    Int16BE,
    Int32LE,
    Int32BE,

    FloatLE,
    FloatBE,

    DoubleLE,
    DoubleBE,

    UintLE,
    UintBE,
    UInt8,
    Uint16LE,
    Uint16BE,
    Uint32LE,
    Uint32BE,

    BigInt64BE,
    BigInt64LE,
    BigUint64BE,
    BigUint64LE,
}

export const parseTypeMap: Map<number, string> = new Map([
    [ParseType.IntLE, "IntLE"],
    [ParseType.IntBE, "IntBE"],
    [ParseType.Int8, "Int8"],
    [ParseType.Int16LE, "Int16LE"],
    [ParseType.Int16BE, "Int16BE"],
    [ParseType.Int32LE, "Int32LE"],
    [ParseType.Int32BE, "Int32BE"],

    [ParseType.FloatLE, "FloatLE"],
    [ParseType.FloatBE, "FloatBE"],

    [ParseType.DoubleLE, "DoubleLE"],
    [ParseType.DoubleBE, "DoubleBE"],

    [ParseType.UintLE, "UintLE"],
    [ParseType.UintBE, "UintBE"],
    [ParseType.UInt8, "UInt8"],
    [ParseType.Uint16LE, "Uint16LE"],
    [ParseType.Uint16BE, "Uint16BE"],
    [ParseType.Uint32LE, "Uint32LE"],
    [ParseType.Uint32BE, "Uint32BE"],
    [ParseType.BigInt64BE, "BigInt64BE"],
    [ParseType.BigInt64LE, "BigInt64LE"],
    [ParseType.BigUint64BE, "BigUint64BE"],
    [ParseType.BigUint64LE, "BigUint64LE"]
]);

export interface Metadata {
    id: number,
    key: string,
    value: any,
    parseType: ParseType
}

// 请求信息
export interface RequestData {
    id: string,
    protoPath: string,
    namespace: string,
    serviceName: string,
    methodName: string,
    methodMode: Mode,
    host: string,
    body: any,
    metadata?: any,
    includeDirs?: string[],
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

export const modeMap = {
    [Mode.Unary]: "Unary",
    [Mode.ClientStream]: "Client Stream",
    [Mode.ServerStream]: "Server Stream",
    [Mode.BidirectionalStream]: "Bidirectional Stream",
};

export interface Method {
    id: string,
    name: string,
    mode: Mode,
    requestBody: string,
    requestMetadata?: Metadata[],
    responseMetadata?: Map<string, Map<number, number>>
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
    metadata?: Metadata[],
    body: string,
    streams: string[]
}

export enum TabType {
    Proto,
    Env
}

export interface Tab {
    key: string,
    title?: string,
    type?: TabType,
    params?: any,
    dot?: boolean,
    closable?: boolean
}


