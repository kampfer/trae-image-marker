/**
 * IPC 通道名称定义
 * 定义所有 Electron 进程间通信的通道名称
 */

export const IpcChannels = {
  FILE_SHOW_SAVE_DIALOG: 'file:show-save-dialog',
  FILE_SHOW_OPEN_DIALOG: 'file:show-open-dialog',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  IMAGE_PICK: 'image:pick',
  WINDOW_UPDATE_TITLE: 'window:update-title',
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
