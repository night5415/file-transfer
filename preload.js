const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getQrCode: () => ipcRenderer.invoke("qr-code"),
  sendColor: (color) => ipcRenderer.invoke("send-color", color),
});
