// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron"),
  path = require("path"),
  http = require("http"),
  os = require("os"),
  fs = require("fs"),
  QRCode = require("qrcode"),
  port = 3000,
  staticBasePath = "./public";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
}
app.whenReady().then(() => {
  createWindow();
  setupWebServer();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

function setupWebServer(params) {
  const staticServe = function (req, res) {
    let { url } = req,
      fixed;

    switch (url) {
      case "/":
        fixed = "/index.html";
        break;
      case "data":
        break;
      default:
        fixed = url;
        break;
    }

    const resolvedBase = path.resolve(staticBasePath),
      safeSuffix = path.normalize(fixed).replace(/^(\.\.[\/\\])+/, ""),
      fileLoc = path.join(resolvedBase, safeSuffix),
      stream = fs.createReadStream(fileLoc);

    stream.on("error", function (error) {
      res.writeHead(404, "Not Found");
      res.write("404: File Not Found!");
      res.end();
    });

    res.statusCode = 200;
    stream.pipe(res);
  };

  const httpServer = http.createServer(staticServe);

  httpServer.listen(port);
}

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
