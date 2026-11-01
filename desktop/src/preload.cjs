/**
 * ICS-SHIELD Desktop Preload Bridge
 * Developed by Venkat Naresh
 * 
 * Provides secure, restricted IPC bridge between the Electron main process
 * and the sandboxed renderer window.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('icsshieldDesktop', {
  isDesktop: true,
  platform: process.platform,
  arch: process.arch,
  version: '1.0.0',
  getSystemMetrics: () => ipcRenderer.invoke('system:getMetrics'),
  getBackendStatus: () => ipcRenderer.invoke('backend:getStatus'),
  restartBackend: () => ipcRenderer.invoke('backend:restart'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  onLogMessage: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('log:message', handler);
    return () => ipcRenderer.removeListener('log:message', handler);
  }
});
