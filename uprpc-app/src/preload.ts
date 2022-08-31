const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('rpc', {
    getFiles: () => ipcRenderer.invoke('getFiles'),
    importFile: () => ipcRenderer.invoke("importFile"),
    send: (params: any) => ipcRenderer.invoke('send', params),
})