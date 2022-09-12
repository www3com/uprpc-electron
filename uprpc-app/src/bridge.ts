const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rpc", {
    send: (params: any) => ipcRenderer.invoke("send", params),
    stopStream: (id: string) => ipcRenderer.invoke("stopStream", id),
    handleResponse: (callback: any) => ipcRenderer.on("updateResponse", callback),
    handleEndStream: (callback: any) => ipcRenderer.on("endStream", callback),

    // Import File
    getProtos: () => ipcRenderer.invoke("getProtos"),
    importProto: () => ipcRenderer.invoke("importProto"),
    reloadProto: () => ipcRenderer.invoke("reloadProto"),
    deleteProto: (id: string) => ipcRenderer.invoke("deleteProto", id),

    // Paths
    addPath: () => ipcRenderer.invoke("addPath"),
    removePath: (path: string) => ipcRenderer.invoke("removePath", path),
    getPaths: () => ipcRenderer.invoke("getPaths"),
});
