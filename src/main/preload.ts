/**
 * Preload 脚本入口
 * 在浏览器窗口中加载 DOM 后执行
 * 用于安全地暴露 IPC 通信接口给渲染进程
 */

import { contextBridge, ipcRenderer } from 'electron';

import type { ImageInfo } from '../types/fileTypes';

/**
 * IPC 通道名称
 */
const IpcChannels = {
  FILE_SHOW_SAVE_DIALOG: 'file:show-save-dialog',
  FILE_SHOW_OPEN_DIALOG: 'file:show-open-dialog',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  IMAGE_PICK: 'image:pick',
  WINDOW_UPDATE_TITLE: 'window:update-title',
} as const;

/**
 * 文件对话框选项类型
 */
interface ShowSaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

interface ShowOpenDialogOptions {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<'openFile' | 'multiSelections'>;
}

/**
 * Electron API 接口
 * 暴露给渲染进程的 API
 */
interface ElectronAPI {
  showSaveDialog: (
    options: ShowSaveDialogOptions
  ) => Promise<{ filePath: string | null; fileName: string | null }>;
  showOpenDialog: (options: ShowOpenDialogOptions) => Promise<{ filePaths: string[] }>;
  pickImage: () => Promise<ImageInfo | null>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  updateWindowTitle: (title: string) => Promise<void>;
}

/**
 * 创建 Electron API 实例
 */
const createElectronAPI = (): ElectronAPI => {
  return {
    showSaveDialog: (options: ShowSaveDialogOptions) =>
      ipcRenderer.invoke(IpcChannels.FILE_SHOW_SAVE_DIALOG, options),
    showOpenDialog: (options: ShowOpenDialogOptions) =>
      ipcRenderer.invoke(IpcChannels.FILE_SHOW_OPEN_DIALOG, options),
    pickImage: () => ipcRenderer.invoke(IpcChannels.IMAGE_PICK),
    readFile: (filePath: string) => ipcRenderer.invoke(IpcChannels.FILE_READ, filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke(IpcChannels.FILE_WRITE, filePath, content),
    updateWindowTitle: (title: string) =>
      ipcRenderer.invoke(IpcChannels.WINDOW_UPDATE_TITLE, title),
  };
};

const electronAPI = createElectronAPI();

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
