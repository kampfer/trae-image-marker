import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileState {
  currentFile: string | null;
  isFileOpened: boolean;
  isModified: boolean;
}

const initialState: FileState = {
  currentFile: null,
  isFileOpened: false,
  isModified: false,
};

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setCurrentFile: (state, action: PayloadAction<string | null>) => {
      state.currentFile = action.payload;
      state.isFileOpened = action.payload !== null;
      state.isModified = false;
    },
    setModified: (state, action: PayloadAction<boolean>) => {
      state.isModified = action.payload;
    },
    newMarkerFile: (state) => {
      state.currentFile = null;
      state.isFileOpened = false;
      state.isModified = false;
    },
  },
});

export const { setCurrentFile, setModified, newMarkerFile } = fileSlice.actions;
export default fileSlice.reducer;