/**
 * 文件服务模块
 * 负责封装所有文件相关的操作系统交互
 */

import { dialog, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import type {
  ShowSaveDialogOptions,
  ShowSaveDialogResult,
  ShowOpenDialogOptions,
  ShowOpenDialogResult,
} from '../types/fileTypes';

/**
 * 获取当前活动窗口
 */
const getActiveWindow = (): BrowserWindow | null => {
  const windows = BrowserWindow.getAllWindows();
  return windows.length > 0 ? windows[0] : null;
};

/**
 * 显示保存对话框
 */
export const showSaveDialog = async (
  options: ShowSaveDialogOptions
): Promise<ShowSaveDialogResult> => {
  const mainWindow = getActiveWindow();

  if (!mainWindow) {
    return { filePath: null, fileName: null };
  }

  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title,
    defaultPath: options.defaultPath,
    filters: options.filters,
  });

  if (result.canceled || !result.filePath) {
    return { filePath: null, fileName: null };
  }

  const fileName = path.basename(result.filePath);
  return { filePath: result.filePath, fileName };
};

/**
 * 显示打开对话框
 */
export const showOpenDialog = async (
  options: ShowOpenDialogOptions
): Promise<ShowOpenDialogResult> => {
  const mainWindow = getActiveWindow();

  if (!mainWindow) {
    return { filePaths: [] };
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title,
    filters: options.filters,
    properties: options.properties,
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { filePaths: [] };
  }

  return { filePaths: result.filePaths };
};

/**
 * 读取文件内容
 */
export const readFile = async (filePath: string): Promise<string> => {
  if (!filePath) {
    throw new Error('文件路径不能为空');
  }

  const exists = fs.existsSync(filePath);
  if (!exists) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  const content = await fs.promises.readFile(filePath, 'utf-8');
  return content;
};

/**
 * 写入文件内容
 */
export const writeFile = async (
  filePath: string,
  content: string
): Promise<void> => {
  if (!filePath) {
    throw new Error('文件路径不能为空');
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  await fs.promises.writeFile(filePath, content, 'utf-8');
};
