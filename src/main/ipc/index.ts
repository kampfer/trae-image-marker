/**
 * IPC 入口模块
 * 统一注册所有 IPC 处理器
 */

import { registerFileHandlers } from './fileHandlers';

/**
 * 注册所有 IPC 处理器
 */
export const registerIpcHandlers = (): void => {
  registerFileHandlers();
};
