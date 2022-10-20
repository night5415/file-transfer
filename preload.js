const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getQrCode: () => ipcRenderer.invoke("qr-code"),
});
