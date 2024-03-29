import {
    Root,
    ReflectionObject,
    Namespace,
    Method,
    Type,
    Enum,
    Field,
    MapField,
    OneOf,
    Service,
} from "protobufjs";
import {v4} from "uuid";
import * as path from "path";
import * as fs from "fs";

const EMPTY = "";

export async function loadProto(file: string, includeDirs: string[]) {
    let root = new Root();
    const originalResolvePath = root.resolvePath;
    root.resolvePath = (origin, target) => {
        if (path.isAbsolute(target)) {
            return target;
        }
        for (const directory of includeDirs) {
            const fullPath = path.join(directory, target);
            try {
                fs.accessSync(fullPath, fs.constants.R_OK);
                return fullPath;
            } catch (err) {
                continue;
            }
        }
        return originalResolvePath(origin, target);
    };

    try {
        await root.load([file]);
    } catch (e) {
        throw  e;
    }
    let methods = parse(root, EMPTY, root.nested);
    return {
        name: path.basename(file),
        path: file,
        host: "127.0.0.1:9000",
        methods: methods,
    };
}

function parse(root: Root, namespaceName: string, children: any): any {
    let methods = [];
    for (let key in children) {
        let node = children[key];
        if (isNamespace(node)) {
            methods.push(...parse(root, namespaceName == EMPTY ? key : namespaceName.concat(".", key), node.nested));
        } else if (node instanceof Service) {
            methods.push(...parseMethod(root, namespaceName, node));
        }
    }
    return methods;
}

function parseMethod(root: Root, namespaceName: string, service: Service) {
    let methods = [];
    for (let methodName in service.methods) {
        let method = service.methods[methodName];
        let reqType = root.lookupType(method.requestType);

        methods.push({
            id: v4(),
            name: methodName,
            namespace: namespaceName,
            serviceName: service.name,
            // @ts-ignore
            mode: (method.responseStream << 1) | method.requestStream,
            requestBody: JSON.stringify(parseTypeFields(reqType), null, "\t"),
        });
    }

    return methods;
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
            v = parseScalar(field.type);
        }
        return {[parseScalar(field.keyType)]: v};
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
        string: "",
        number: 1,
        bool: true,
        int32: 3200,
        int64: 6400,
        uint32: 32000,
        uint64: 64000,
        sint32: 320,
        sint64: 640,
        fixed32: 3200,
        fixed64: 64000,
        sfixed32: 320,
        sfixed64: 640,
        double: 3.141592,
        float: 5.512322,
        bytes: Buffer.from([]),
    };
    return map[type];
}

function isNamespace(lookupType: ReflectionObject) {
    return (
        lookupType instanceof Namespace &&
        !(lookupType instanceof Method) &&
        !(lookupType instanceof Service) &&
        !(lookupType instanceof Type) &&
        !(lookupType instanceof Enum) &&
        !(lookupType instanceof Field) &&
        !(lookupType instanceof MapField) &&
        !(lookupType instanceof OneOf)
    );
}
