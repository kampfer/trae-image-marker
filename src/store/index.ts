import { configureStore } from '@reduxjs/toolkit';
import toolReducer from './slices/toolSlice';
import imageReducer from './slices/imageSlice';
import annotationReducer from './slices/annotationSlice';
import historyReducer from './slices/historySlice';
import canvasReducer from './slices/canvasSlice';
import fileReducer from './slices/fileSlice';

const store = configureStore({
  reducer: {
    tool: toolReducer,
    image: imageReducer,
    annotation: annotationReducer,
    history: historyReducer,
    canvas: canvasReducer,
    file: fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;