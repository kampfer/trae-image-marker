import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Annotation {
  id: string;
  type: 'horizontal-line' | 'vertical-line' | 'normal-protractor' | 'horizontal-protractor' | 'vertical-protractor';
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface HorizontalLine extends Annotation {
  type: 'horizontal-line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface VerticalLine extends Annotation {
  type: 'vertical-line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface Protractor extends Annotation {
  type: 'normal-protractor' | 'horizontal-protractor' | 'vertical-protractor';
  vertexX: number;
  vertexY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
}

export type AnnotationType = HorizontalLine | VerticalLine | Protractor;

interface AnnotationState {
  annotationsByImage: Record<string, AnnotationType[]>;
  selectedAnnotationsByImage: Record<string, string[]>;
}

const initialState: AnnotationState = {
  annotationsByImage: {},
  selectedAnnotationsByImage: {},
};

const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {
    addAnnotation: (state, action: PayloadAction<{ imageId: string; annotation: AnnotationType }>) => {
      const { imageId, annotation } = action.payload;
      if (!state.annotationsByImage[imageId]) {
        state.annotationsByImage[imageId] = [];
      }
      state.annotationsByImage[imageId].push(annotation);
    },
    selectAnnotation: (state, action: PayloadAction<{ imageId: string; id: string }>) => {
      const { imageId, id } = action.payload;
      if (!state.selectedAnnotationsByImage[imageId]) {
        state.selectedAnnotationsByImage[imageId] = [];
      }
      if (!state.selectedAnnotationsByImage[imageId].includes(id)) {
        state.selectedAnnotationsByImage[imageId].push(id);
      }
    },
    deselectAnnotation: (state, action: PayloadAction<{ imageId: string; id: string }>) => {
      const { imageId, id } = action.payload;
      if (state.selectedAnnotationsByImage[imageId]) {
        const index = state.selectedAnnotationsByImage[imageId].indexOf(id);
        if (index !== -1) {
          state.selectedAnnotationsByImage[imageId].splice(index, 1);
        }
      }
    },
    deleteSelectedAnnotations: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      if (state.selectedAnnotationsByImage[imageId]) {
        const selectedIds = state.selectedAnnotationsByImage[imageId];
        state.annotationsByImage[imageId] = state.annotationsByImage[imageId].filter(
          annotation => !selectedIds.includes(annotation.id)
        );
        state.selectedAnnotationsByImage[imageId] = [];
      }
    },
    updateAnnotation: (state, action: PayloadAction<{ imageId: string; id: string; updates: Partial<AnnotationType> }>) => {
      const { imageId, id, updates } = action.payload;
      if (state.annotationsByImage[imageId]) {
        const annotation = state.annotationsByImage[imageId].find(anno => anno.id === id);
        if (annotation) {
          Object.assign(annotation, updates);
          annotation.updatedAt = new Date().toISOString();
        }
      }
    },
    clearAllAnnotations: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.annotationsByImage[imageId] = [];
      state.selectedAnnotationsByImage[imageId] = [];
    },
  },
});

export const { addAnnotation, selectAnnotation, deselectAnnotation, deleteSelectedAnnotations, updateAnnotation, clearAllAnnotations } = annotationSlice.actions;
export default annotationSlice.reducer;