/**
 * 文件操作对话框选项
 */
export interface ShowSaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

/**
 * 文件操作对话框返回结果
 */
export interface ShowSaveDialogResult {
  filePath: string | null;
  fileName: string | null;
}

/**
 * 打开文件对话框选项
 */
export interface ShowOpenDialogOptions {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<'openFile' | 'multiSelections'>;
}

/**
 * 打开文件对话框返回结果
 */
export interface ShowOpenDialogResult {
  filePaths: string[];
}

/**
 * 图片元数据
 */
export interface ImageInfo {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  createdAt: string;
}
