const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readFileContent: (filePath) => ipcRenderer.invoke('read-file-content', filePath),
  
  // Listeners
  onMaximizedStatus: (callback) => {
    const subscription = (event, status) => callback(status);
    ipcRenderer.on('window-maximized-status', subscription);
    return () => ipcRenderer.removeListener('window-maximized-status', subscription);
  },
  onOpenFileFromArg: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('open-file-from-arg', subscription);
    return () => ipcRenderer.removeListener('open-file-from-arg', subscription);
  }
});
