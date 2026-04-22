import { RootState } from '../index';
import {
  selectFilePath,
  selectFileName,
  selectIsFileOpened,
  selectHasUnsavedChanges,
  selectCanSave,
  selectCanPerformFileOperation,
} from '../slices/fileSlice';

export {
  selectFilePath,
  selectFileName,
  selectIsFileOpened,
  selectHasUnsavedChanges,
  selectCanSave,
  selectCanPerformFileOperation,
};

export const selectActiveTool = (state: RootState) => state.command.activeTool;
export const selectImages = (state: RootState) => state.image.images;
export const selectActiveImageId = (state: RootState) => state.image.activeImageId;
export const selectAnnotationsByImage = (state: RootState) => state.annotation.annotationsByImage;
export const selectSelectedAnnotationsByImage = (state: RootState) =>
  state.annotation.selectedAnnotationsByImage;
export const selectPastByImage = (state: RootState) => state.history.pastByImage;
export const selectFutureByImage = (state: RootState) => state.history.futureByImage;
export const selectZoomByImage = (state: RootState) => state.canvas.zoomByImage;
export const selectRotationByImage = (state: RootState) => state.canvas.rotationByImage;
export const selectShowAuxiliaryLinesByImage = (state: RootState) =>
  state.canvas.showAuxiliaryLinesByImage;

export const selectImageById = (state: RootState, imageId: string) => {
  return state.image.images.find((image) => image.id === imageId);
};

export const selectAnnotationsByImageId = (state: RootState, imageId: string) => {
  return state.annotation.annotationsByImage[imageId] || [];
};

export const selectSelectedAnnotationsByImageId = (state: RootState, imageId: string) => {
  return state.annotation.selectedAnnotationsByImage[imageId] || [];
};

export const selectActiveImageZoom = (state: RootState) => {
  const imageId = state.image.activeImageId;
  if (!imageId) return null;
  return state.canvas.zoomByImage[imageId] || 100;
};

export const selectActiveImageRotation = (state: RootState) => {
  const imageId = state.image.activeImageId;
  if (!imageId) return null;
  return state.canvas.rotationByImage[imageId] || 0;
};

export const selectShowAuxiliaryLinesByImageId = (state: RootState, imageId: string) => {
  return state.canvas.showAuxiliaryLinesByImage[imageId] || false;
};

export const selectCanUndo = (state: RootState, imageId: string) => {
  return state.history.pastByImage[imageId]?.length > 0;
};

export const selectCanRedo = (state: RootState, imageId: string) => {
  return state.history.futureByImage[imageId]?.length > 0;
};

export const selectHasAnnotations = (state: RootState, imageId: string) => {
  return (state.annotation.annotationsByImage[imageId]?.length || 0) > 0;
};

export const selectHasSelectedAnnotations = (state: RootState, imageId: string) => {
  return (state.annotation.selectedAnnotationsByImage[imageId]?.length || 0) > 0;
};
