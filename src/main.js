const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1020,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: false, // frameless window
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    transparent: true, // nice rounded/transparent border blending on Win 11
    backgroundColor: '#00000000', // allows glass backdrop effect
    show: false, // show only when ready to avoid flicker
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Open external links in user's default browser instead of this window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Gracefully show window when contents are loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Notify renderer on maximize/unmaximize changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized-status', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized-status', false);
  });
};

app.on('ready', () => {
  createWindow();

  // Check if a file was passed via command line arguments (double-clicking md files)
  const fileArg = process.argv.find(arg => arg.endsWith('.md') || arg.endsWith('.markdown'));
  if (fileArg && fs.existsSync(fileArg)) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        try {
          const content = fs.readFileSync(fileArg, 'utf8');
          mainWindow.webContents.send('open-file-from-arg', {
            path: fileArg,
            name: path.basename(fileArg),
            content: content
          });
        } catch (err) {
          console.error('Error loading startup file argument:', err);
        }
      }, 500);
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Window controls IPC
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  }
  return false;
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// File Dialog IPC
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      path: filePath,
      name: path.basename(filePath),
      content: content
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

// File Path Reader IPC (used for drag & drop file path reading)
ipcMain.handle('read-file-content', async (event, filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error('File does not exist');
    }
    const content = fs.readFileSync(resolvedPath, 'utf8');
    return {
      path: resolvedPath,
      name: path.basename(resolvedPath),
      content: content
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});
