import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnnotationType } from './annotationSlice';

interface HistoryState {
  pastByImage: Record<string, AnnotationType[][]>;
  futureByImage: Record<string, AnnotationType[][]>;
}

const initialState: HistoryState = {
  pastByImage: {},
  futureByImage: {},
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistory: (state, action: PayloadAction<{ imageId: string; annotations: AnnotationType[] }>) => {
      const { imageId, annotations } = action.payload;
      if (!state.pastByImage[imageId]) {
        state.pastByImage[imageId] = [];
      }
      if (!state.futureByImage[imageId]) {
        state.futureByImage[imageId] = [];
      }
      // 最多保存20次操作
      if (state.pastByImage[imageId].length >= 20) {
        state.pastByImage[imageId].shift();
      }
      state.pastByImage[imageId].push([...annotations]);
      state.futureByImage[imageId] = [];
    },
    undo: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      if (state.pastByImage[imageId] && state.pastByImage[imageId].length > 0) {
        const lastState = state.pastByImage[imageId].pop();
        if (lastState) {
          if (!state.futureByImage[imageId]) {
            state.futureByImage[imageId] = [];
          }
          state.futureByImage[imageId].push(lastState);
        }
      }
    },
    redo: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      if (state.futureByImage[imageId] && state.futureByImage[imageId].length > 0) {
        const nextState = state.futureByImage[imageId].pop();
        if (nextState) {
          if (!state.pastByImage[imageId]) {
            state.pastByImage[imageId] = [];
          }
          state.pastByImage[imageId].push(nextState);
        }
      }
    },
    clearHistory: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.pastByImage[imageId] = [];
      state.futureByImage[imageId] = [];
    },
  },
});

export const { addHistory, undo, redo, clearHistory } = historySlice.actions;
export default historySlice.reducer;