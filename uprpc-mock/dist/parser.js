"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs_1 = require("protobufjs");
var PROTO_PATH = '/Users/jason/WebstormProjects/grpc-new/protos/helloworld.proto';
main();
async function main() {
    let root = await (0, protobufjs_1.load)(PROTO_PATH, new protobufjs_1.Root());
    let services = parser(root, "", root.nested);
    console.log(JSON.stringify(services));
}
function parser(root, namespaceName, children) {
    let services = [];
    for (let key in children) {
        let node = children[key];
        if (isNamespace(node)) {
            services.push(...parser(root, namespaceName == "" ? key : namespaceName + '.' + key, node.nested));
        }
        else if (node instanceof protobufjs_1.Service) {
            services.push(parseService(root, namespaceName, node));
        }
    }
    return services;
}
function parseService(root, namespaceName, service) {
    let parsedMethods = [];
    for (let methodName in service.methods) {
        let method = service.methods[methodName];
        let reqType = root.lookupType(method.requestType);
        parsedMethods.push({
            // id: v4(),
            name: methodName,
            requestBody: parseTypeFields(reqType)
        });
    }
    return {
        // id: v4(),
        name: service.name,
        namespace: namespaceName,
        methods: parsedMethods
    };
}
function parseTypeFields(type) {
    const fieldsData = {};
    for (let field of type.fieldsArray) {
        fieldsData[field.name] = field.repeated ? [parseField(field)] : parseField(field);
    }
    return fieldsData;
}
function parseField(field) {
    if (field instanceof protobufjs_1.MapField) {
        let v;
        if (field.resolvedType instanceof protobufjs_1.Type) {
            v = parseTypeFields(field.resolvedType);
        }
        else if (field.resolvedType instanceof protobufjs_1.Enum) {
            v = parseEnum(field.resolvedType);
        }
        else {
            v = parseScalar(field.type);
        }
        return { [parseScalar(field.keyType)]: v };
    }
    if (field.resolvedType instanceof protobufjs_1.Type) {
        if (field.resolvedType.oneofs) {
            return pickOneOf(field.resolvedType.oneofsArray);
        }
        return parseTypeFields(field.resolvedType);
    }
    else if (field.resolvedType instanceof protobufjs_1.Enum) {
        return parseEnum(field.resolvedType);
    }
    const propertyValue = parseScalar(field.type);
    if (propertyValue == null) {
        const resolvedField = field.resolve();
        return parseField(resolvedField);
    }
    else {
        return propertyValue;
    }
}
function parseEnum(enumType) {
    const enumKey = Object.keys(enumType.values)[0];
    return enumType.values[enumKey];
}
function pickOneOf(oneofs) {
    return oneofs.reduce((fields, oneOf) => {
        fields[oneOf.name] = parseField(oneOf.fieldsArray[0]);
        return fields;
    }, {});
}
function parseScalar(type) {
    let map = {
        'string': 'str',
        'number': 1,
        'bool': true,
        'int32': 2,
        'int64': 5,
        'uint32': 4,
        'uint64': 5,
        'sint32': 100,
        'sint64': 1000,
        'fixed32': 2000,
        'fixed64': 3000,
        'sfixed32': 4000,
        'sfixed64': 5000,
        'double': 1.2,
        'float': 1.1,
        'bytes': new Buffer("")
    };
    return map[type];
}
function isNamespace(lookupType) {
    return (lookupType instanceof protobufjs_1.Namespace) &&
        !(lookupType instanceof protobufjs_1.Method) &&
        !(lookupType instanceof protobufjs_1.Service) &&
        !(lookupType instanceof protobufjs_1.Type) &&
        !(lookupType instanceof protobufjs_1.Enum) &&
        !(lookupType instanceof protobufjs_1.Field) &&
        !(lookupType instanceof protobufjs_1.MapField) &&
        !(lookupType instanceof protobufjs_1.OneOf);
}
//# sourceMappingURL=parser.js.map