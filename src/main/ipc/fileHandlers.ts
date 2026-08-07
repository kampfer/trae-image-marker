/**
 * 文件相关 IPC 处理器
 * 处理所有文件操作的 IPC 请求
 */

import { ipcMain, BrowserWindow } from 'electron';

import type { ShowSaveDialogOptions, ShowOpenDialogOptions } from '../../types/fileTypes';
import {
  pickImage,
  readFile,
  readImageDataUrl,
  showOpenDialog,
  showSaveDialog,
  writeFile,
} from '../services/fileService';

import { IpcChannels } from './channels';

/**
 * 注册文件相关的 IPC 处理器
 */
export const registerFileHandlers = (): void => {
  ipcMain.handle(IpcChannels.FILE_SHOW_SAVE_DIALOG, async (_, options: ShowSaveDialogOptions) => {
    return showSaveDialog(options);
  });

  ipcMain.handle(IpcChannels.FILE_SHOW_OPEN_DIALOG, async (_, options: ShowOpenDialogOptions) => {
    return showOpenDialog(options);
  });

  ipcMain.handle(IpcChannels.IMAGE_PICK, () => {
    return pickImage();
  });

  ipcMain.handle(IpcChannels.IMAGE_READ_DATA_URL, async (_, filePath: string) => {
    return readImageDataUrl(filePath);
  });

  ipcMain.handle(IpcChannels.FILE_READ, async (_, filePath: string) => {
    return readFile(filePath);
  });

  ipcMain.handle(IpcChannels.FILE_WRITE, async (_, filePath: string, content: string) => {
    return writeFile(filePath, content);
  });

  // 更新窗口标题
  ipcMain.handle(IpcChannels.WINDOW_UPDATE_TITLE, (_, title: string) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      mainWindow.setTitle(title);
    }
  });
};
