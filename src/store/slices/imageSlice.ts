import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ImageInfo {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  createdAt: string;
}

interface ImageState {
  images: ImageInfo[];
  activeImageId: string | null;
}

const initialState: ImageState = {
  images: [],
  activeImageId: null,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    addImage: (state, action: PayloadAction<ImageInfo>) => {
      state.images.push(action.payload);
      state.activeImageId = action.payload.id;
    },
    removeImage: (state, action: PayloadAction<string>) => {
      const index = state.images.findIndex(image => image.id === action.payload);
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
      const image = state.images.find(image => image.id === id);
      if (image) {
        Object.assign(image, updates);
      }
    },
    clearImages: (state) => {
      state.images = [];
      state.activeImageId = null;
    },
  },
});

export const { addImage, removeImage, setActiveImage, updateImage, clearImages } = imageSlice.actions;
export default imageSlice.reducer;