import { configureStore } from '@reduxjs/toolkit';

import reduxLoggerMiddleware from './middleware/reduxLoggerMiddleware';
import annotationReducer from './slices/annotationSlice';
import canvasReducer from './slices/canvasSlice';
import commandReducer from './slices/commandSlice';
import fileReducer from './slices/fileSlice';
import historyReducer from './slices/historySlice';
import imageReducer from './slices/imageSlice';

const store = configureStore({
  reducer: {
    annotation: annotationReducer,
    canvas: canvasReducer,
    command: commandReducer,
    file: fileReducer,
    history: historyReducer,
    image: imageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(reduxLoggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
