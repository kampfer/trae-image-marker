import { createAction, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState, AppDispatch } from '../index';
import { deserializeMarkerFile, serializeMarkerFile } from '../serializers/markerFileSerializer';
import { setAnnotations, type AnnotationType } from './annotationSlice';
import { resetCanvas } from './canvasSlice';
import { clearAllHistory } from './historySlice';
import { addImage, setImages, type ImageInfo } from './imageSlice';

const updateWindowTitle = (
  filePath: string | null,
  fileName: string,
  hasUnsavedChanges: boolean
) => {
  let title = 'trae-image-marker';

  if (filePath || fileName) {
    const displayName = fileName || filePath.split(/[\\/]/).pop() || 'Untitled';
    title = `${displayName}${hasUnsavedChanges ? ' *' : ''} - trae-image-marker`;
  }

  if (window.electronAPI && window.electronAPI.updateWindowTitle) {
    window.electronAPI.updateWindowTitle(title);
  }
};

interface FileState {
  filePath: string | null;
  fileName: string;
  isUntitled: boolean;
  hasUnsavedChanges: boolean;
}

const initialState: FileState = {
  filePath: null,
  fileName: '',
  isUntitled: false,
  hasUnsavedChanges: false,
};

let untitledFileCounter = 0;

const getNextUntitledFileName = (): string => {
  untitledFileCounter += 1;
  return `Untitled-${untitledFileCounter}`;
};

export const createNewFile = createAction('file/createNewFile', () => ({
  payload: {
    filePath: null,
    fileName: getNextUntitledFileName(),
    isUntitled: true,
  },
}));

export const openFile = createAsyncThunk<
  { filePath: string; fileName: string; content: string },
  void,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('file/openFile', async (_, { dispatch, rejectWithValue }) => {
  try {
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
    const { images, annotationsByImage } = deserializeMarkerFile(content, filePath);

    dispatch(setImages(images));
    dispatch(setAnnotations(annotationsByImage));
    dispatch(clearAllHistory());
    dispatch(resetCanvas());

    return { filePath, fileName, content };
  } catch (error) {
    const message = error instanceof Error ? error.message : '打开标记文件失败';
    return rejectWithValue(message);
  }
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
  const currentFileName = state.file.fileName || 'Untitled';

  const result = await window.electronAPI.showSaveDialog({
    title: '另存为',
    defaultPath: currentFileName,
    filters: [{ name: '标记文件', extensions: ['json'] }],
  });

  if (!result || !result.filePath) {
    return rejectWithValue('另存为已取消');
  }

  const { filePath } = result;
  const fileName = filePath.split(/[\\/]/).pop() || 'Untitled';

  const images: ImageInfo[] = Object.values(state.image.images);
  const annotationsByImage = state.annotation.annotationsByImage as Record<
    string,
    AnnotationType[]
  >;
  const content = serializeMarkerFile(images, annotationsByImage);

  await window.electronAPI.writeFile(filePath, content);

  return { filePath, fileName };
});

const markDocumentUnsaved = (state: FileState) => {
  state.hasUnsavedChanges = true;
  updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
};

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFileOpened: (state, action: PayloadAction<{ filePath: string; fileName: string }>) => {
      state.filePath = action.payload.filePath;
      state.fileName = action.payload.fileName;
      state.isUntitled = false;
      state.hasUnsavedChanges = false;
    },
    setFileClosed: (state) => {
      state.filePath = null;
      state.fileName = '';
      state.isUntitled = false;
      state.hasUnsavedChanges = false;
    },
    markFileSaved: (state) => {
      state.hasUnsavedChanges = false;
      updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
    },
    markFileUnsaved: markDocumentUnsaved,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewFile, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.isUntitled = action.payload.isUntitled;
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(openFile.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.isUntitled = false;
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(saveFile.fulfilled, (state, action) => {
        if (action.payload) {
          state.filePath = action.payload.filePath;
          state.fileName = action.payload.fileName;
          state.isUntitled = false;
        }
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(saveFileAs.fulfilled, (state, action) => {
        state.filePath = action.payload.filePath;
        state.fileName = action.payload.fileName;
        state.isUntitled = false;
        state.hasUnsavedChanges = false;
        updateWindowTitle(state.filePath, state.fileName, state.hasUnsavedChanges);
      })
      .addCase(addImage.fulfilled, markDocumentUnsaved)
      .addCase('image/removeImage', markDocumentUnsaved)
      .addCase('image/updateImage', markDocumentUnsaved)
      .addCase('annotation/addAnnotation', markDocumentUnsaved)
      .addCase('annotation/updateAnnotation', markDocumentUnsaved)
      .addCase('annotation/deleteSelectedAnnotations', markDocumentUnsaved)
      .addCase('annotation/clearAllAnnotations', markDocumentUnsaved);
  },
});

export const { setFileOpened, setFileClosed, markFileSaved, markFileUnsaved } = fileSlice.actions;

export default fileSlice.reducer;

export const selectFilePath = (state: RootState) => state.file.filePath;
export const selectFileName = (state: RootState) => state.file.fileName;
export const selectIsUntitled = (state: RootState) => state.file.isUntitled;
export const selectIsFileOpened = (state: RootState) =>
  selectFileName(state) !== '' || selectFilePath(state) !== null;
export const selectHasUnsavedChanges = (state: RootState) => state.file.hasUnsavedChanges;
export const selectCanSave = (state: RootState) =>
  selectIsFileOpened(state) && (state.file.hasUnsavedChanges || state.file.isUntitled);
export const selectCanPerformFileOperation = (state: RootState) => selectIsFileOpened(state);
