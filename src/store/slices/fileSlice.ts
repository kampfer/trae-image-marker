import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '../index';
import { serializeMarkerFile } from '../serializers/markerFileSerializer';

import type { AnnotationType } from './annotationSlice';
import type { ImageInfo } from './imageSlice';

interface FileState {
  filePath: string | null;
  fileName: string;
  hasUnsavedChanges: boolean;
}

const initialState: FileState = {
  filePath: null,
  fileName: '',
  hasUnsavedChanges: false,
};

/**
 * 文件操作相关 API 接口
 * 定义与 Electron 主进程通信的文件操作方法
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
    };
  }
}

/**
 * 新建标记文件
 * 弹出保存对话框，让用户选择新文件的位置和名称
 */
export const createNewFile = createAsyncThunk<
  { filePath: string; fileName: string },
  void,
  { state: RootState }
>('file/createNewFile', async (_, { rejectWithValue }) => {
  const result = await window.electronAPI.showSaveDialog({
    title: '新建标记文件',
    defaultPath: 'untitled.json',
    filters: [{ name: '标记文件', extensions: ['json'] }],
  });

  if (!result || !result.filePath) {
    return rejectWithValue('新建文件已取消');
  }

  const { filePath } = result;
  const fileName = filePath.split(/[\\/]/).pop() || 'untitled.json';

  const emptyContent = serializeMarkerFile([], {});
  await window.electronAPI.writeFile(filePath, emptyContent);

  return { filePath, fileName };
});

/**
 * 打开标记文件
 * 弹出打开对话框，让用户选择要打开的文件
 */
export const openFile = createAsyncThunk<
  { filePath: string; fileName: string; content: string },
  void,
  { state: RootState }
>('file/openFile', async (_, { rejectWithValue }) => {
  const result = await window.electronAPI.showOpenDialog({
    title: '打开标记文件',
    filters: [{ name: '标记文件', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (!result || result.filePaths.length === 0) {
    return rejectWithValue('打开文件已取消');
  }

  const filePath = result.filePaths[0];
  const fileName = filePath.split(/[\\/]/).pop() || 'unknown';
  const content = await window.electronAPI.readFile(filePath);

  return { filePath, fileName, content };
});

/**
 * 保存当前文件
 * 如果没有文件路径，则执行另存为操作
 */
export const saveFile = createAsyncThunk<
  { filePath: string; fileName: string } | null,
  void,
  { state: RootState }
>('file/saveFile', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { filePath, fileName } = state.file;

  if (!filePath) {
    return rejectWithValue('没有打开的文件');
  }

  const images: ImageInfo[] = Object.values(state.image.images);
  const annotationsByImage = state.annotation.annotationsByImage as Record<
    string,
    AnnotationType[]
  >;
  const content = serializeMarkerFile(images, annotationsByImage);

  await window.electronAPI.writeFile(filePath, content);

  return { filePath, fileName };
});

/**
 * 另存为新文件
 * 弹出保存对话框，让用户选择新的文件位置和名称
 */
export const saveFileAs = createAsyncThunk<
  { filePath: string; fileName: string },
  void,
  { state: RootState }
>('file/saveFileAs', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const currentFileName = state.file.fileName || 'untitled.json';

  const result = await window.electronAPI.showSaveDialog({
    title: '另存为',
    defaultPath: currentFileName,
    filters: [{ name: '标记文件', extensions: ['json'] }],
  });

  if (!result || !result.filePath) {
    return rejectWithValue('另存为已取消');
  }

  const { filePath } = result;
  const fileName = filePath.split(/[\\/]/).pop() || 'untitled.json';

  const images: ImageInfo[] = Object.values(state.image.images);
  const annotationsByImage = state.annotation.annotationsByImage as Record<
    string,
    AnnotationType[]
  >;
  const content = serializeMarkerFile(images, annotationsByImage);

  await window.electronAPI.writeFile(filePath, content);

  return { filePath, fileName };
});

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFileOpened: (state, action: PayloadAction<{ filePath: string; fileName: string }>) => {
      state.filePath = action.payload.filePath;
      state.fileName = action.payload.fileName;
      state.hasUnsavedChanges = false;
    },
    setFileClosed: (state) => {
      state.filePath = null;
      state.fileName = '';
      state.hasUnsavedChanges = false;
    },
    markFileSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
    markFileUnsaved: (state) => {
      state.hasUnsavedChanges = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewFile.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.hasUnsavedChanges = false;
      })
      .addCase(openFile.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.hasUnsavedChanges = false;
      })
      .addCase(saveFile.fulfilled, (state) => {
        state.hasUnsavedChanges = false;
      })
      .addCase(saveFileAs.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.hasUnsavedChanges = false;
      });
  },
});

export const { setFileOpened, setFileClosed, markFileSaved, markFileUnsaved } = fileSlice.actions;

export default fileSlice.reducer;

// Selectors
export const selectFilePath = (state: RootState) => state.file.filePath;
export const selectFileName = (state: RootState) => state.file.fileName;
export const selectIsFileOpened = (state: RootState) => state.file.filePath !== null;
export const selectHasUnsavedChanges = (state: RootState) => state.file.hasUnsavedChanges;
export const selectCanSave = (state: RootState) =>
  state.file.filePath !== null && state.file.hasUnsavedChanges;
export const selectCanPerformFileOperation = (state: RootState) => state.file.filePath !== null;
