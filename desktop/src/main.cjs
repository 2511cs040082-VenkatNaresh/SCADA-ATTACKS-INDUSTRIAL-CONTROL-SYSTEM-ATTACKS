/**
 * ICS-SHIELD Desktop Application — Main Process
 * Official SCADA Attacks & Industrial Control System Attacks Platform
 * 
 * Architect & Developer: Venkat Naresh
 * App ID: com.icsshield.soc
 */

const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');
const { spawn, exec } = require('child_process');

let mainWindow = null;
let backendProcess = null;
let backendStatus = {
  running: false,
  healthy: false,
  port: 5050,
  pid: null,
  startedAt: null,
  error: null,
  logs: []
};

const PORT = 5050;
const HEALTH_ENDPOINT = `http://127.0.0.1:${PORT}/api/system/health`;

function appendLog(level, msg) {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}`;
  backendStatus.logs.push(line);
  if (backendStatus.logs.length > 300) backendStatus.logs.shift();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('log:message', line);
  }
  console.log(line);
}

/**
 * Resolve repository and resource paths dynamically
 */
function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', 'src', 'server.js');
  }
  return path.resolve(__dirname, '..', '..', 'backend', 'src', 'server.js');
}

function getBackendCwd() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.resolve(__dirname, '..', '..', 'backend');
}

/**
 * Check if the backend port is responsive
 */
function checkBackendHealth(retries = 30, interval = 500) {
  return new Promise((resolve) => {
    let attempts = 0;

    const poll = () => {
      attempts++;
      const req = http.get(HEALTH_ENDPOINT, { timeout: 1000 }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          backendStatus.healthy = true;
          appendLog('info', `Backend health check passed on attempt ${attempts} (HTTP ${res.statusCode})`);
          return resolve(true);
        }
        if (attempts >= retries) {
          backendStatus.healthy = false;
          return resolve(false);
        }
        setTimeout(poll, interval);
      });

      req.on('error', (err) => {
        if (attempts >= retries) {
          backendStatus.healthy = false;
          backendStatus.error = err.message;
          return resolve(false);
        }
        setTimeout(poll, interval);
      });
    };

    poll();
  });
}

/**
 * Launch the embedded Node.js backend engine
 */
function startBackendService() {
  return new Promise(async (resolve, reject) => {
    const serverScript = getBackendPath();
    const cwd = getBackendCwd();

    appendLog('info', `Starting ICS-SHIELD backend service: ${serverScript}`);

    if (!fs.existsSync(serverScript)) {
      const err = `Backend server script not found at ${serverScript}`;
      appendLog('error', err);
      backendStatus.error = err;
      return reject(new Error(err));
    }

    const env = {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      HOST: '127.0.0.1'
    };

    try {
      backendProcess = spawn(process.execPath, [serverScript], {
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      backendStatus.running = true;
      backendStatus.pid = backendProcess.pid;
      backendStatus.startedAt = new Date().toISOString();
      appendLog('info', `Backend process spawned with PID ${backendProcess.pid}`);

      backendProcess.stdout.on('data', (data) => {
        const text = data.toString().trim();
        if (text) appendLog('info', text);
      });

      backendProcess.stderr.on('data', (data) => {
        const text = data.toString().trim();
        if (text) appendLog('warn', text);
      });

      backendProcess.on('error', (err) => {
        appendLog('error', `Backend spawn error: ${err.message}`);
        backendStatus.running = false;
        backendStatus.error = err.message;
      });

      backendProcess.on('exit', (code, signal) => {
        appendLog('warn', `Backend process exited (code=${code}, signal=${signal})`);
        backendStatus.running = false;
        backendStatus.healthy = false;
      });

      // Poll until backend is responding
      const isHealthy = await checkBackendHealth(40, 500);
      if (isHealthy) {
        resolve();
      } else {
        reject(new Error(`Backend failed to respond at ${HEALTH_ENDPOINT} within timeout`));
      }
    } catch (err) {
      appendLog('error', `Failed to start backend: ${err.message}`);
      reject(err);
    }
  });
}

/**
 * Safely kill the child backend process
 */
function stopBackendService() {
  if (backendProcess && !backendProcess.killed) {
    appendLog('info', `Terminating backend process PID ${backendProcess.pid}...`);
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${backendProcess.pid} /T /F`);
      } else {
        backendProcess.kill('SIGTERM');
        setTimeout(() => {
          if (backendProcess && !backendProcess.killed) {
            backendProcess.kill('SIGKILL');
          }
        }, 2000);
      }
    } catch (e) {
      console.error('Error stopping backend:', e);
    }
  }
}

/**
 * Create the main SOC browser window
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'ICS-SHIELD — SCADA Attacks & Industrial Control System Attacks',
    backgroundColor: '#0A0E1A',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  const appMenu = Menu.buildFromTemplate([
    {
      label: 'ICS-SHIELD',
      submenu: [
        {
          label: 'About ICS-SHIELD Platform',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ICS-SHIELD',
              message: 'ICS-SHIELD — SCADA Attacks & Industrial Control System Attacks',
              detail: 'Architect & Developer: Venkat Naresh\nVersion: 1.0.0 (Production)\n\nDefensive OT/ICS Cybersecurity Monitoring & Threat Detection Platform.'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Restart Backend Engine',
          click: async () => {
            stopBackendService();
            try {
              await startBackendService();
              mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
            } catch (err) {
              dialog.showErrorBox('Restart Failed', err.message);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'SOC Navigation',
      submenu: [
        { label: 'Live Telemetry', click: () => mainWindow.loadURL(`http://127.0.0.1:${PORT}/telemetry`) },
        { label: 'Protocols (Modbus / DNP3 / S7comm)', click: () => mainWindow.loadURL(`http://127.0.0.1:${PORT}/protocols`) },
        { label: 'Incident Investigation', click: () => mainWindow.loadURL(`http://127.0.0.1:${PORT}/incidents`) },
        { label: 'Attack Simulator', click: () => mainWindow.loadURL(`http://127.0.0.1:${PORT}/simulation`) },
        { label: 'MITRE ATT&CK for ICS', click: () => mainWindow.loadURL(`http://127.0.0.1:${PORT}/mitre`) },
        { type: 'separator' },
        { label: 'Reload Dashboard', role: 'reload' },
        { label: 'Force Reload', role: 'forceReload' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS')
        },
        {
          label: 'Documentation & Architecture',
          click: () => shell.openExternal('https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS#readme')
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(appMenu);

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * IPC Handlers
 */
ipcMain.handle('system:getMetrics', async () => {
  return {
    cpus: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'Generic CPU',
    totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
    freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.round(os.uptime())
  };
});

ipcMain.handle('backend:getStatus', async () => {
  return { ...backendStatus };
});

ipcMain.handle('backend:restart', async () => {
  stopBackendService();
  try {
    await startBackendService();
    if (mainWindow) mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('shell:openExternal', async (_event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

/**
 * Application Lifecycle
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    appendLog('info', 'ICS-SHIELD Desktop initializing...');
    
    try {
      // First check if an existing instance is already running on port 5050
      const alreadyRunning = await checkBackendHealth(2, 200);
      if (!alreadyRunning) {
        appendLog('info', `Port ${PORT} is open. Starting embedded backend...`);
        await startBackendService();
      } else {
        appendLog('info', `ICS-SHIELD backend already active on port ${PORT}. Connecting...`);
      }
      createMainWindow();
    } catch (err) {
      appendLog('error', `Failed to initialize application: ${err.message}`);
      dialog.showErrorBox(
        'Startup Initialization Error',
        `Unable to initialize ICS-SHIELD backend service.\n\n${err.message}\n\nPlease verify that port 5050 is not in use by another application.`
      );
      app.quit();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('before-quit', () => {
    appendLog('info', 'Application shutting down. Cleaning child processes...');
    stopBackendService();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  process.on('SIGINT', () => {
    stopBackendService();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    stopBackendService();
    process.exit(0);
  });
}
