import { ImageInfo } from '../slices/imageSlice';
import { AnnotationType } from '../slices/annotationSlice';

export interface MarkerFile {
  version: string;
  images: Array<{
    id: string;
    name: string;
    path: string;
    width: number;
    height: number;
    createdAt: string;
    annotations: AnnotationType[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export const serializeMarkerFile = (images: ImageInfo[], annotationsByImage: Record<string, AnnotationType[]>): string => {
  const markerFile: MarkerFile = {
    version: '1.0',
    images: images.map(image => ({
      id: image.id,
      name: image.name,
      path: image.path,
      width: image.width,
      height: image.height,
      createdAt: image.createdAt,
      annotations: annotationsByImage[image.id] || [],
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(markerFile, null, 2);
};

export const deserializeMarkerFile = (json: string): {
  images: ImageInfo[];
  annotationsByImage: Record<string, AnnotationType[]>;
} => {
  const markerFile = JSON.parse(json) as MarkerFile;
  const images: ImageInfo[] = markerFile.images.map(image => ({
    id: image.id,
    name: image.name,
    path: image.path,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt || new Date().toISOString(),
  }));
  const annotationsByImage: Record<string, AnnotationType[]> = {};
  markerFile.images.forEach(image => {
    annotationsByImage[image.id] = image.annotations;
  });
  return { images, annotationsByImage };
};
