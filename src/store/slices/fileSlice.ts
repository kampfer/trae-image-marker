import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState, AppDispatch } from '../index';
import { serializeMarkerFile } from '../serializers/markerFileSerializer';

import type { AnnotationType } from './annotationSlice';
import type { ImageInfo } from './imageSlice';

const updateWindowTitle = (
  filePath: string | null,
  fileName: string,
  hasUnsavedChanges: boolean
) => {
  let title = 'trae-image-marker';

  if (filePath || fileName) {
    const displayName = fileName || filePath.split(/[/]/).pop() || 'Untitled';
    title = `${displayName}${hasUnsavedChanges ? ' *' : ''} - trae-image-marker`;
  }

  if (window.electronAPI && window.electronAPI.updateWindowTitle) {
    window.electronAPI.updateWindowTitle(title);
  }
};

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

export const createNewFile = () => ({
  type: 'file/createNewFile' as const,
  payload: {
    filePath: null as null,
    fileName: 'untitled.json',
  },
});

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

export const saveFile = createAsyncThunk<
  { filePath: string; fileName: string } | null,
  void,
  { state: RootState; dispatch: AppDispatch }
>('file/saveFile', async (_, { getState, rejectWithValue, dispatch }) => {
  const state = getState();
  const { filePath, fileName } = state.file;

  if (!filePath) {
    // 没有保存路径时，调用 saveFileAs
    try {
      const result = await dispatch(saveFileAs()).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue('保存文件已取消');
    }
  }

  // 有保存路径时，直接保存
  const images: ImageInfo[] = Object.values(state.image.images);
  const annotationsByImage = state.annotation.annotationsByImage as Record<
    string,
    AnnotationType[]
  >;
  const content = serializeMarkerFile(images, annotationsByImage);

  await window.electronAPI.writeFile(filePath, content);

  return { filePath, fileName };
});

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
      .addCase('file/createNewFile', (state, action: any) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(openFile.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(saveFile.fulfilled, (state, action) => {
        if (action.payload) {
          state.filePath = action.payload.filePath;
          state.fileName = action.payload.fileName;
        }
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(saveFileAs.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      });
  },
});

export const { setFileOpened, setFileClosed, markFileSaved, markFileUnsaved } = fileSlice.actions;

export default fileSlice.reducer;

export const selectFilePath = (state: RootState) => state.file.filePath;
export const selectFileName = (state: RootState) => state.file.fileName;
export const selectIsFileOpened = (state: RootState) =>
  selectFileName(state) !== '' || selectFilePath(state) !== null;
export const selectHasUnsavedChanges = (state: RootState) => state.file.hasUnsavedChanges;
export const selectCanSave = (state: RootState) =>
  selectIsFileOpened(state) && state.file.hasUnsavedChanges;
export const selectCanPerformFileOperation = (state: RootState) => selectIsFileOpened(state);
