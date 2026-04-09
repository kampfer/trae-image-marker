import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CanvasState {
  zoomByImage: Record<string, number>;
  rotationByImage: Record<string, number>;
  showAuxiliaryLinesByImage: Record<string, boolean>;
}

const initialState: CanvasState = {
  zoomByImage: {},
  rotationByImage: {},
  showAuxiliaryLinesByImage: {},
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    zoomIn: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      const currentZoom = state.zoomByImage[imageId] || 100;
      if (currentZoom < 800) {
        state.zoomByImage[imageId] = currentZoom + 10;
      }
    },
    zoomOut: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      const currentZoom = state.zoomByImage[imageId] || 100;
      if (currentZoom > 10) {
        state.zoomByImage[imageId] = currentZoom - 10;
      }
    },
    fitWindow: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.zoomByImage[imageId] = 100; // 实际实现中需要根据窗口大小计算
    },
    actualSize: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.zoomByImage[imageId] = 100;
    },
    setRotation: (state, action: PayloadAction<{ imageId: string; angle: number }>) => {
      const { imageId, angle } = action.payload;
      state.rotationByImage[imageId] = angle;
    },
    toggleAuxiliaryLines: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.showAuxiliaryLinesByImage[imageId] = !state.showAuxiliaryLinesByImage[imageId];
    },
  },
});

export const { zoomIn, zoomOut, fitWindow, actualSize, setRotation, toggleAuxiliaryLines } = canvasSlice.actions;
export default canvasSlice.reducer;