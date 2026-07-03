try {
  require("electron-reloader")(module);
} catch (_) {}

const { app, BrowserWindow } = require("electron");
const { Menu, ipcMain } = require("electron");

let mainWindow = null;
let settingsWindow = null;
const dragStateByWebContentsId = new Map();
let currentSettings = {
  timeMs: 90000,
  question: "Add your question here.",
};

const showMainContextMenu = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Settings",
      click: () => {
        openSettingsWindow();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  contextMenu.popup({ window: mainWindow });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 450,
    transparent: true,
    frame: false,
    resizable: false,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.webContents.on("context-menu", () => {
    showMainContextMenu();
  });
};

const openSettingsWindow = () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 380,
    height: 320,
    resizable: false,
    title: "Settings",
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });

  settingsWindow.loadFile("settings.html");

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
};

ipcMain.on("open-settings-window", () => {
  openSettingsWindow();
});

ipcMain.on("show-app-context-menu", () => {
  showMainContextMenu();
});

ipcMain.on("request-current-settings", (event) => {
  event.sender.send("current-settings", currentSettings);
});

ipcMain.on("save-settings", (_event, settings) => {
  const nextTimeMs = Number(settings?.timeMs);
  const nextQuestion = String(settings?.question || "").trim();

  if (!Number.isFinite(nextTimeMs) || nextTimeMs < 1000 || !nextQuestion) {
    return;
  }

  currentSettings = {
    timeMs: Math.floor(nextTimeMs),
    question: nextQuestion,
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("settings-updated", currentSettings);
  }

  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send("settings-saved");
  }
});

ipcMain.on("begin-window-drag", (event, position) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const x = Number(position?.x);
  const y = Number(position?.y);

  if (!win || !Number.isFinite(x) || !Number.isFinite(y)) {
    return;
  }

  const [windowX, windowY] = win.getPosition();

  dragStateByWebContentsId.set(event.sender.id, {
    startMouseX: Math.round(x),
    startMouseY: Math.round(y),
    startWindowX: windowX,
    startWindowY: windowY,
  });
});

ipcMain.on("update-window-drag", (event, position) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const state = dragStateByWebContentsId.get(event.sender.id);
  const x = Number(position?.x);
  const y = Number(position?.y);

  if (!win || !state || !Number.isFinite(x) || !Number.isFinite(y)) {
    return;
  }

  const nextX = state.startWindowX + (Math.round(x) - state.startMouseX);
  const nextY = state.startWindowY + (Math.round(y) - state.startMouseY);

  win.setPosition(nextX, nextY);
});

ipcMain.on("end-window-drag", (event) => {
  dragStateByWebContentsId.delete(event.sender.id);
});

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
