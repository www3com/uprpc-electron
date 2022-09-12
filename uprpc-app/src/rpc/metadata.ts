import { Metadata, MetadataValue } from "@grpc/grpc-js";

export function parseMetadata(metadata: Metadata): Map<string, any> {
    let result: Map<string, any> = new Map<string, any>();
    Object.keys(metadata.getMap()).forEach((key: string) => {
        let values = metadata.get(key);
        if (key.endsWith("-bin")) {
            result.set(key, parseValue(values, false));
        } else {
            result.set(key, values.toString());
        }
    });
    return result;
}

function parseValue(values: MetadataValue[], byBe: boolean): Array<any> {
    let mdValues: Array<any> = [];
    values.forEach((value: MetadataValue) => {
        if (value instanceof Uint8Array) {
            switch (value.length) {
                case 8:
                    mdValues.push(byBe ? value.readUInt8() : value.readUInt8());
                    break;
                case 16:
                    mdValues.push(byBe ? value.readInt16BE() : value.readInt16LE());
                    break;
                case 32:
                    mdValues.push(byBe ? value.readInt32BE() : value.readInt32LE());
                    break;
                case 64:
                    mdValues.push(byBe ? value.readBigInt64BE() : value.readBigInt64LE());
                    break;
                default:
                    mdValues.push(value.toString());
                    break;
            }
        }
    });

    return mdValues;
}
