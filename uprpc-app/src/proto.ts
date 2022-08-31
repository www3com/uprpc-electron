import {Root, OneOf, Type, Enum, Field, MapField, Method, Service, Namespace, load} from 'protobufjs'
import {v4} from 'uuid';
import {basename} from 'path';

const MAX_STACK_SIZE = 3;

type StackDepth = {
    [type: string]: number;
};


export async function parser(path: string) {
    let root = new Root();
    await load(path, root)
    let parsedServices = [];
    for (let key in root.nested) {
        let node = root.nested[key]
        if (node.constructor.name === 'Namespace') {
            if (key === 'google') {
                continue
            }
            // @ts-ignore
            parsedServices.push(...parseService(root, key, node.nested))
        } else if (node.constructor.name === 'Service') {
            parsedServices.push(...parseService(root, key, {key: node}))
        }
    }

    return parsedServices;
}


function parseService(root: Root, namespace: string, services: any) {
    let parsedServices = []
    for (let key in services) {
        let service = services[key];
        if (service instanceof Service) {
            parsedServices.push({
                id: v4(),
                name: namespace + '.' + key,
                methods: parseMethod(root, services[key].methods)
            })
        }
    }

    return parsedServices;
}


function parseMethod(root: Root, methods: any) {
    let parsedMethods = [];
    for (let key in methods) {
        let method = methods[key];
        let reqType = root.lookupType(method.requestType);
        parsedMethods.push({
            id: v4(),
            name: key,
            request: parseTypeFields(reqType)
        });
    }
    return parsedMethods;
}

function parseTypeFields(type: Type, stackDepth: StackDepth = {}): object {
    if (stackDepth[type.name] > MAX_STACK_SIZE) {
        return {};
    }
    if (!stackDepth[type.name]) {
        stackDepth[type.name] = 0;
    }
    stackDepth[type.name]++;

    const fieldsData: { [key: string]: any } = {};

    return type.fieldsArray.reduce((data, field) => {
        field.resolve();

        if (field.parent !== field.resolvedType) {
            if (field.repeated) {
                data[field.name] = [parseField(field)];
            } else {
                data[field.name] = parseField(field);
            }
        }

        return data;
    }, fieldsData);
}

/**
 * Mock enum
 */
function parseEnum(enumType: Enum): number {
    const enumKey = Object.keys(enumType.values)[0];

    return enumType.values[enumKey];
}


function parseField(field: Field, stackDepth?: StackDepth): any {
    if (field instanceof MapField) {
        let mockPropertyValue = null;
        if (field.resolvedType === null) {
            mockPropertyValue = parseScalar(field.type, field.name);
        }

        if (mockPropertyValue === null) {
            const resolvedType = field.resolvedType;

            if (resolvedType instanceof Type) {
                if (resolvedType.oneofs) {
                    mockPropertyValue = pickOneOf(resolvedType.oneofsArray);
                } else {
                    mockPropertyValue = parseTypeFields(resolvedType, stackDepth);
                }
            } else if (resolvedType instanceof Enum) {
                mockPropertyValue = parseEnum(resolvedType);
            } else if (resolvedType === null) {
                mockPropertyValue = {};
            }
        }

        return {
            [parseScalar(field.keyType, field.name)]: mockPropertyValue,
        };
    }

    if (field.resolvedType instanceof Type) {
        return parseTypeFields(field.resolvedType, stackDepth);
    }

    if (field.resolvedType instanceof Enum) {
        return parseEnum(field.resolvedType);
    }

    const mockPropertyValue = parseScalar(field.type, field.name);

    if (mockPropertyValue === null) {
        const resolvedField = field.resolve();

        return parseField(resolvedField, stackDepth);
    } else {
        return mockPropertyValue;
    }
}

function pickOneOf(oneofs: OneOf[]) {
    return oneofs.reduce((fields: { [key: string]: any }, oneOf) => {
        fields[oneOf.name] = parseField(oneOf.fieldsArray[0]);
        return fields;
    }, {});
}


function parseScalar(type: string, fieldName: string): any {
    switch (type) {
        case 'string':
            return interpretMockViaFieldName(fieldName);
        case 'number':
            return 1;
        case 'bool':
            return true;
        case 'int32':
            return 2;
        case 'int64':
            return 3;
        case 'uint32':
            return 4;
        case 'uint64':
            return 5;
        case 'sint32':
            return 100;
        case 'sint64':
            return 1200;
        case 'fixed32':
            return 1400;
        case 'fixed64':
            return 1500;
        case 'sfixed32':
            return 1600;
        case 'sfixed64':
            return 1700;
        case 'double':
            return 1.2;
        case 'float':
            return 1.1;
        case 'bytes':
            return new Buffer("");
        default:
            return null;
    }
}

function interpretMockViaFieldName(fieldName: string): string {
    const fieldNameLower = fieldName.toLowerCase();

    if (fieldNameLower.startsWith('id') || fieldNameLower.endsWith('id')) {
        return v4();
    }

    return '';
}