// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron"),
  path = require("path"),
  http = require("http"),
  os = require("os"),
  QRCode = require("qrcode"),
  port = 3000;

const { staticServe } = require("./modules/server");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.minimize();
}
app.whenReady().then(() => {
  createWindow();
  setupWebServer();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

const setupWebServer = () => http.createServer(staticServe).listen(port);

function createQrCode() {
  return new Promise((res, rej) => {
    QRCode.toDataURL(
      `http://${os.hostname()}.local:${port}`,
      function (err, code) {
        if (err) rej(err);

        res(code);
      }
    );
  });
}

ipcMain.handle("qr-code", async (event, someArgument) => {
  return await createQrCode();
});
