import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { ImageInfo } from '../../types/fileTypes';

export type { ImageInfo } from '../../types/fileTypes';

interface ImageState {
  images: ImageInfo[];
  activeImageId: string | null;
}

const initialState: ImageState = {
  images: [],
  activeImageId: null,
};

export const addImage = createAsyncThunk<ImageInfo, void, { rejectValue: string }>(
  'image/addImage',
  async (_, { rejectWithValue }) => {
    try {
      const image = await window.electronAPI.pickImage();

      if (!image) {
        return rejectWithValue('添加图片已取消');
      }

      return image;
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加图片失败';
      return rejectWithValue(message);
    }
  }
);

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    removeImage: (state, action: PayloadAction<string>) => {
      const index = state.images.findIndex((image) => image.id === action.payload);
      if (index !== -1) {
        state.images.splice(index, 1);
        if (state.activeImageId === action.payload) {
          state.activeImageId = state.images.length > 0 ? state.images[0].id : null;
        }
      }
    },
    setActiveImage: (state, action: PayloadAction<string>) => {
      state.activeImageId = action.payload;
    },
    updateImage: (state, action: PayloadAction<{ id: string; updates: Partial<ImageInfo> }>) => {
      const { id, updates } = action.payload;
      const image = state.images.find((image) => image.id === id);
      if (image) {
        Object.assign(image, updates);
      }
    },
    setImages: (state, action: PayloadAction<ImageInfo[]>) => {
      state.images = action.payload;
      state.activeImageId = action.payload[0]?.id ?? null;
    },
    clearImages: (state) => {
      state.images = [];
      state.activeImageId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addImage.fulfilled, (state, action) => {
        state.images.push(action.payload);
        state.activeImageId = action.payload.id;
      })
      .addCase('file/createNewFile', (state) => {
        state.images = [];
        state.activeImageId = null;
      });
  },
});

export const { removeImage, setActiveImage, updateImage, setImages, clearImages } =
  imageSlice.actions;
export default imageSlice.reducer;
