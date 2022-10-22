// Modules to control application life and create native browser window
const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    Menu,
    nativeImage,
  } = require("electron"),
  path = require("path"),
  http = require("http"),
  os = require("os"),
  QRCode = require("qrcode"),
  port = 3000,
  logo =
    "data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iYm94X19pY29uIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3NSIgaGVpZ2h0PSI3NSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDAwMDAwIj4KCQkJCTxnPgoJCQkJCTxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPgoJCQkJPC9nPgoJCQkJPGc+CgkJCQkJPHBhdGggZD0iTTE4LDE1djNINnYtM0g0djNjMCwxLjEsMC45LDIsMiwyaDEyYzEuMSwwLDItMC45LDItMnYtM0gxOHogTTE3LDExbC0xLjQxLTEuNDFMMTMsMTIuMTdWNGgtMnY4LjE3TDguNDEsOS41OUw3LDExbDUsNSBMMTcsMTF6Ii8+CgkJCQk8L2c+CgkJCTwvc3ZnPg==";

const { staticServe } = require("./modules/server");

function createWindow() {
  const mainWindow = new BrowserWindow({
    show: true,
    icon: nativeImage.createFromPath("./asset/icon.png"),
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
  //progressBar(mainWindow);
}
app.whenReady().then(() => {
  createWindow();
  setupWebServer();
  systemTray();
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

// const progressBar = (win) => {
//   const INCREMENT = 0.03;
//   const INTERVAL_DELAY = 100; // ms

//   let c = 0;
//   progressInterval = setInterval(() => {
//     // update progress bar to next value
//     // values between 0 and 1 will show progress, >1 will show indeterminate or stick at 100%
//     win?.setProgressBar(c);

//     // increment or reset progress bar
//     if (c < 2) {
//       c += INCREMENT;
//     } else {
//       c = -INCREMENT * 5; // reset to a bit less than 0 to show reset state
//     }
//   }, INTERVAL_DELAY);
// };

const systemTray = () => {
  const icon = nativeImage.createFromDataURL(logo),
    tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Item1", type: "radio" },
    { label: "Item2", type: "radio" },
    { label: "Item3", type: "radio", checked: true },
    { label: "Item4", type: "radio" },
  ]);

  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);
};

function createQrCode() {
  return new Promise((res, rej) => {
    QRCode.toDataURL(
      `http://${os.hostname()}.local:${port}`,
      {
        scale: 10,
      },
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

//./node_modules/.bin/electron-icon-builder --input=./icons/test.png --output=./icons
