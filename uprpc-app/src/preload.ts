import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("rpc", {
    send: (params: any) => ipcRenderer.invoke("send", params),
    stopStream: (id: string) => ipcRenderer.invoke("stopStream", id),
    handleResponse: (callback: any) => ipcRenderer.on("updateResponse", callback),
    handleEndStream: (callback: any) => ipcRenderer.on("endStream", callback),

    // Import File
    parseProto: (paths: string[], includeDirs: string[]) => ipcRenderer.invoke("parseProto", paths, includeDirs),
    openProto: () => ipcRenderer.invoke("openProto"),

    // Paths
    openIncludeDir: () => ipcRenderer.invoke("openIncludeDir"),
});
