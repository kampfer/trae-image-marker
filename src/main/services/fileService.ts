/**
 * 文件服务模块
 * 负责封装所有文件相关的操作系统交互
 */

import { BrowserWindow, dialog, nativeImage } from 'electron';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type {
  ImageInfo,
  ShowSaveDialogOptions,
  ShowSaveDialogResult,
  ShowOpenDialogOptions,
  ShowOpenDialogResult,
} from '../../types/fileTypes';

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
export const writeFile = async (filePath: string, content: string): Promise<void> => {
  if (!filePath) {
    throw new Error('文件路径不能为空');
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  await fs.promises.writeFile(filePath, content, 'utf-8');
};

/**
 * 选择图片并读取其基础元数据。
 */
export const pickImage = async (): Promise<ImageInfo | null> => {
  const result = await showOpenDialog({
    title: '添加图片',
    filters: [
      {
        name: '图片文件',
        extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp'],
      },
    ],
    properties: ['openFile'],
  });

  if (result.filePaths.length === 0) {
    return null;
  }

  const imagePath = result.filePaths[0];
  const image = nativeImage.createFromPath(imagePath);

  if (image.isEmpty()) {
    throw new Error('无法读取所选图片');
  }

  const { width, height } = image.getSize();
  if (width <= 0 || height <= 0) {
    throw new Error('所选图片尺寸无效');
  }

  return {
    id: randomUUID(),
    name: path.basename(imagePath),
    path: imagePath,
    width,
    height,
    createdAt: new Date().toISOString(),
  };
};
