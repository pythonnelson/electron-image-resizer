const path = require("path");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const resizeImg = require("resize-img");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;

// Creates the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Electron Image Resizer",
    width: isDev ? 1000 : 500,
    height: 650,

    //pass the preload.js file in the main file
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //Open devtools if in development environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// Open new window (About window)
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Electron Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// When app is ready
app.whenReady().then(() => {
  createWindow();

  // Implements menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //Remove mainWindow from memnor on close to prevent memory leaks
  mainWindow.on("close", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About", // For windows and linux machine
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// respond to ipcRenderer resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "electronResizer");
  resizeImage(options);
});

// Resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // create filename
    const filename = path.basename(imgPath);

    // create destination if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //write file to destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    // send success message to render
    mainWindow.webContents.send("img:done");

    // open the destination folder
    shell.openPath(dest);

    // If there errors log them
  } catch (error) {
    console.log(error);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
