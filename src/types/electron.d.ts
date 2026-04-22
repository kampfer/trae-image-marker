/**
 * Electron API 类型定义
 * 定义与 Electron 主进程通信的接口
 */
declare global {
  interface Window {
    electronAPI: {
      showSaveDialog: (options: {
        title?: string;
        defaultPath?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ filePath: string | null; fileName: string | null } | null>;
      showOpenDialog: (options: {
        title?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
        properties?: Array<'openFile' | 'multiSelections'>;
      }) => Promise<{ filePaths: string[] } | null>;
      readFile: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<void>;
      updateWindowTitle: (title: string) => Promise<void>;
    };
  }
}

export {};
