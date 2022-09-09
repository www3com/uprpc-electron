import * as store from "./storage/store";
import { BrowserWindow, ipcMain } from "electron";
import * as electron from "electron";
import * as rpc from "./rpc/client";

const { loadProto } = require("./proto/parser");

export async function importFile() {
  const result = await electron.dialog.showOpenDialog({
    title: "Import File",
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "proto", extensions: ["proto"] }],
  });

  if (result.canceled) {
    return { success: true };
  }

  for (let path of result.filePaths) {
    try {
      let proto = await loadProto(path);
      store.addFile(proto);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
  return { success: true };
}

export function listFiles() {
  return JSON.stringify(store.getFiles());
}

export function getPaths(): string[] {
  return store.getPaths();
}

export async function addPath() {
  const result = await electron.dialog.showOpenDialog({
    title: "Import Paths",
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    return { success: false };
  }

  let paths = store.getPaths();
  let path = result.filePaths[0];
  if (paths.indexOf(path) == -1) {
    paths.push(path);
    store.savePaths(paths);
  }

  return { success: true, paths: paths };
}

export function removePath(path: string) {
  console.log("remove ", path);
  let paths = store.getPaths();
  paths.forEach((value, index) => {
    if (value == path) {
      paths.splice(index, 1);
    }
  });
  store.savePaths(paths);
}

export async function send(window: BrowserWindow, params: string) {
  await rpc.send(params, (req, res) => {
    refreshResponse(window, req, res);
  });
}

function refreshResponse(window: BrowserWindow, req: any, response: any): void {
  window.webContents.send("updateResponse", {
    id: req.id,
    responseBody: response,
  });
}
