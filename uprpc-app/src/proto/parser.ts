import {
    Root,
    load,
    ReflectionObject,
    Namespace,
    Method,
    Type,
    Enum,
    Field,
    MapField,
    OneOf,
    Service
} from 'protobufjs'
import {v4} from 'uuid';
import {basename} from "path";

export async function loadProto(path: string) {
    let root = await load(path, new Root());
    let services = parse(root, "", root.nested);
    return {
        id: v4(),
        name: basename(path),
        path: path,
        host: '127.0.0.1:9005',
        services: services
    };
}

function parse(root: Root, namespaceName: string, children: any): any {
    let services = [];
    for (let key in children) {
        let node = children[key]
        if (isNamespace(node)) {
            services.push(...parse(root, namespaceName == "" ? key : namespaceName + '.' + key, node.nested))
        } else if (node instanceof Service) {
            services.push(parseService(root, namespaceName, node))
        }
    }
    return services;
}


function parseService(root: Root, namespaceName: string, service: Service) {
    let parsedMethods = [];
    for (let methodName in service.methods) {
        let method = service.methods[methodName];
        let reqType = root.lookupType(method.requestType);
        parsedMethods.push({
            id: v4(),
            name: methodName,
            requestStream: !!method.requestStream,
            requestBody: parseTypeFields(reqType),
            responseStream: !!method.responseStream,
        });
    }

    return {
        id: v4(),
        name: service.name,
        namespace: namespaceName,
        methods: parsedMethods
    };
}

function parseTypeFields(type: Type): any {
    const fieldsData = {};
    for (let field of type.fieldsArray) {
        fieldsData[field.name] = field.repeated ? [parseField(field)] : parseField(field);
    }

    return fieldsData;
}

function parseField(field: Field): any {
    if (field instanceof MapField) {
        let v;
        if (field.resolvedType instanceof Type) {
            v = parseTypeFields(field.resolvedType);
        } else if (field.resolvedType instanceof Enum) {
            v = parseEnum(field.resolvedType);
        } else {
            v = parseScalar(field.type)
        }
        return {[parseScalar(field.keyType)]: v}
    }

    if (field.resolvedType instanceof Type) {
        if (field.resolvedType.oneofs) {
            return pickOneOf(field.resolvedType.oneofsArray);
        }
        return parseTypeFields(field.resolvedType);
    } else if (field.resolvedType instanceof Enum) {
        return parseEnum(field.resolvedType);
    }

    const propertyValue = parseScalar(field.type);
    if (propertyValue == null) {
        const resolvedField = field.resolve();
        return parseField(resolvedField);
    } else {
        return propertyValue;
    }
}

function parseEnum(enumType: Enum): number {
    const enumKey = Object.keys(enumType.values)[0];
    return enumType.values[enumKey];
}


function pickOneOf(oneofs: OneOf[]) {
    return oneofs.reduce((fields: { [key: string]: any }, oneOf) => {
        fields[oneOf.name] = parseField(oneOf.fieldsArray[0]);
        return fields;
    }, {});
}


function parseScalar(type: string) {
    let map = {
        'string': '',
        'number': 1,
        'bool': true,
        'int32': 3200,
        'int64': 6400,
        'uint32': 32000,
        'uint64': 64000,
        'sint32': 320,
        'sint64': 640,
        'fixed32': 3200,
        'fixed64': 64000,
        'sfixed32': 320,
        'sfixed64': 640,
        'double': 3.141592,
        'float': 5.512322,
        'bytes': Buffer.from([])
    }
    return map[type]
}

function isNamespace(lookupType: ReflectionObject) {
    return (lookupType instanceof Namespace) &&
        !(lookupType instanceof Method) &&
        !(lookupType instanceof Service) &&
        !(lookupType instanceof Type) &&
        !(lookupType instanceof Enum) &&
        !(lookupType instanceof Field) &&
        !(lookupType instanceof MapField) &&
        !(lookupType instanceof OneOf)
}