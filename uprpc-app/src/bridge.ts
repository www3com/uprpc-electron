const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rpc", {
    send: (params: any) => ipcRenderer.invoke("send", params),
    stopStream: (id: string) => ipcRenderer.invoke("stopStream", id),
    handleResponse: (callback: any) => ipcRenderer.on("updateResponse", callback),
    handleEndStream: (callback: any) => ipcRenderer.on("endStream", callback),

    // Import File
    getFiles: () => ipcRenderer.invoke("getFiles"),
    importFile: () => ipcRenderer.invoke("importFile"),

    // Paths
    addPath: () => ipcRenderer.invoke("addPath"),
    removePath: (path: string) => ipcRenderer.invoke("removePath", path),
    getPaths: () => ipcRenderer.invoke("getPaths"),
});
