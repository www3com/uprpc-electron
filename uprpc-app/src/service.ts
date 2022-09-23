import { BrowserWindow, ipcMain } from "electron";
import * as electron from "electron";
import * as client from "./rpc/client";
import { RequestData, ResponseData } from "./types";

const { loadProto } = require("./proto/parser");

export async function openProto() {
    const result = await electron.dialog.showOpenDialog({
        title: "Import File",
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "proto", extensions: ["proto"] }],
    });

    if (result.canceled) {
        return { success: true, data: [] };
    }

    return { success: true, data: result.filePaths };
}

export async function parseProto(paths: string[], includeDirs: string[]) {
    let protos = [];
    for (let path of paths) {
        let proto = await loadProto(path, includeDirs);
        protos.push(proto);
    }
    return { success: true, data: protos };
}

export async function openIncludeDir() {
    const result = await electron.dialog.showOpenDialog({
        title: "Import Paths",
        properties: ["openDirectory"],
    });

    if (result.canceled) {
        return { success: true };
    }

    return { success: true, data: result.filePaths[0] };
}

export async function sendRequest(window: BrowserWindow, req: RequestData) {
    // let req: RequestData = JSON.parse(reqData);
    await client.send(req, (res: ResponseData | null, md: any, err: Error | undefined, closeStream?: boolean) => {
        returnResponse(window, req, res, md, err, closeStream);
    });
}

export async function stopStream(window: BrowserWindow, id: string) {
    await client.stop(id, (res: ResponseData | null, err: Error | undefined) => {
        console.log("stop {} {},err:{} ", id, !!err, err?.message);
    });
}

function returnResponse(
    window: BrowserWindow,
    req: RequestData,
    res: any,
    md: any,
    e?: Error,
    closeStream?: boolean
): void {
    if (res || md) {
        let resData: ResponseData = {
            id: req.id,
            body: JSON.stringify(res ? res : e?.message, null, "\t"),
            mds: md,
        };
        console.log("return response data: ", resData);
        window.webContents.send("updateResponse", resData);
    }

    if (closeStream) {
        console.log("endStream ", req.id);
        window.webContents.send("endStream", req.id);
    }
}
