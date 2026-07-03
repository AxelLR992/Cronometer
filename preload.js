const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onSettingsUpdated: (callback) => {
    ipcRenderer.on('settings-updated', (_event, settings) => callback(settings));
  },
  showAppContextMenu: () => ipcRenderer.send('show-app-context-menu'),
  openSettingsWindow: () => ipcRenderer.send('open-settings-window'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  requestCurrentSettings: () => ipcRenderer.send('request-current-settings'),
  onCurrentSettings: (callback) => {
    ipcRenderer.on('current-settings', (_event, settings) => callback(settings));
  },
  onSettingsSaved: (callback) => {
    ipcRenderer.on('settings-saved', () => callback());
  },
  beginWindowDrag: (position) => ipcRenderer.send('begin-window-drag', position),
  updateWindowDrag: (position) => ipcRenderer.send('update-window-drag', position),
  endWindowDrag: () => ipcRenderer.send('end-window-drag'),
});
