const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('rpc', {
    send: (params) => ipcRenderer.invoke('send', params)
})

