import { Metadata, MetadataValue } from "@grpc/grpc-js";
import { Metadata as MD } from "../types";

export function parseMds(mds: MD[]): Metadata {
    let metadata = new Metadata();
    if (mds) {
        mds.forEach((item: MD) => {
            if (item.key.endsWith("-bin")) {
                metadata.add(item.key, Buffer.from(item.value));
            } else {
                metadata.add(item.key, item.value);
            }
        });
    }
    return metadata;
}

export function parseMetadata(metadata: Metadata): MD[] | null {
    if (!!!metadata) {
        return null;
    }
    let mds: MD[] = [];
    Object.keys(metadata.getMap()).forEach((key: string, index: number) => {
        let values = metadata.get(key);
        if (values instanceof Array) {
            values.forEach((v, i) => mds.push({ id: mds.length + 1, key: key, value: v }));
        } else {
            mds.push({ id: mds.length + 1, key: key, value: values });
        }
    });
    return mds;
}
