/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  globalShortcut,
  Tray,
  Menu,
} from 'electron';
import ddcci from '@hensm/ddcci';
import fs from 'fs';
import logger from 'electron-log';
import voicemeeter from 'voicemeeter-remote';
import MenuBuilder from './menu';
import { getAssetPath, resolveHtmlPath } from './util';
import { Config } from '../types';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

ipcMain.on('ipc-get-displays', async (event) => {
  event.reply('ipc-get-displays', ddcci.getMonitorList());
});

let configPromise = fs.promises
  .readFile(path.join(app.getPath('userData'), 'config.json'), 'utf8')
  .catch(() => {
    logger.warn('Config file not found, using defaults.');
    return '{}';
  })
  .then((content) => JSON.parse(content || '{}') as Partial<Config>);

const CHANGE_INPUT = 0x60;

let cleanDdc = () => {};
function applyConfig(config: Partial<Config>) {
  cleanDdc();

  let currentInput: number | null = null;
  const {
    display: displayId,
    mainInput,
    secondInput,
    keybind,
    runOnStart,
    useVoicemeeter,
    voicemeeterInputIndex,
  } = config;

  const inter = setInterval(async () => {
    try {
      const readValue = ddcci.getVCP(displayId || '', CHANGE_INPUT) as unknown;
      if (typeof readValue === 'number') {
        currentInput = readValue;
      } else if (Array.isArray(readValue) && readValue.length > 0) {
        const firstValue = readValue[0];
        currentInput = typeof firstValue === 'number' ? firstValue : null;
      }
    } catch {
      // ignore error, most likely the display is not connected or changing input
    }

    if (
      process.platform === 'win32' &&
      useVoicemeeter &&
      voicemeeterInputIndex
    ) {
      try {
        voicemeeter.setStripMute(
          voicemeeterInputIndex,
          currentInput === mainInput,
        );
      } catch (err) {
        logger.error('Failed to mute or unmute Voicemeeter strip:', err);
      }
    }
  }, 1000);

  if (keybind && displayId && mainInput && secondInput) {
    const result = globalShortcut.register(keybind, async () => {
      const target = currentInput !== secondInput ? secondInput : mainInput;

      logger.info(
        `Switching display ${displayId} input from ${currentInput} to ${target}`,
      );
      ddcci.setVCP(displayId, CHANGE_INPUT, target);
    });

    if (!result) {
      logger.error(`Failed to register keybind: ${keybind}`);
    }
  }

  app.setLoginItemSettings({
    openAtLogin: !!runOnStart,
  });

  cleanDdc = () => {
    clearInterval(inter);
    if (keybind) {
      globalShortcut.unregister(keybind);
    }
  };
}

ipcMain.on('ipc-get-config', async (event) => {
  event.reply('ipc-get-config', await configPromise);
});

ipcMain.on('ipc-update-config', async (event, arg) => {
  const config = {
    ...(await configPromise),
    ...arg,
  };

  configPromise = Promise.resolve(config);
  applyConfig(config);

  await fs.promises.writeFile(
    path.join(app.getPath('userData'), 'config.json'),
    JSON.stringify(config),
  );
});

async function initVoicemeeter() {
  if (process.platform !== 'win32') {
    logger.warn('Voicemeeter is only supported on Windows, skipping...');
    return;
  }

  try {
    await voicemeeter.init();
    voicemeeter.login();
  } catch (err) {
    logger.error('Voicemeeter initialization failed:', err);
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(logger.error);
};

const initDdc = () => {
  configPromise.then(applyConfig).catch(logger.error);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: isDebug ? 340 + 580 : 340,
    height: 400,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

const createTray = () => {
  tray = new Tray(getAssetPath('icon.ico'));
  const openConfiguration = () => {
    if (mainWindow === null) {
      createWindow();
    }
    mainWindow?.show();
  };

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open configuration',
      type: 'normal',
      click: openConfiguration,
    },
    {
      label: 'Open logs',
      type: 'normal',
      click: () => {
        shell.openPath(`${app.getPath('userData')}/logs/`);
      },
    },
    { type: 'separator' },
    {
      label: 'Restart',
      type: 'normal',
      click: () => {
        app.relaunch();
        app.quit();
      },
    },
    { label: 'Exit', type: 'normal', click: () => app.quit() },
  ]);

  tray.on('click', openConfiguration);
  tray.setToolTip('Switcheroo');
  tray.setContextMenu(contextMenu);
};

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (process.platform === 'win32') {
    voicemeeter.logout();
  }
});

app.on('window-all-closed', () => {});

app
  .whenReady()
  .then(async () => {
    logger.info('App is starting...');
    initDdc();
    await initVoicemeeter();

    const config = await configPromise;
    if (
      !config.display ||
      !config.display.length ||
      !config.secondInput ||
      !config.keybind
    ) {
      createWindow();
    }

    createTray();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(logger.error);
