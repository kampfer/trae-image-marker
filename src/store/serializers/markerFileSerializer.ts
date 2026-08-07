import type { ImageInfo } from '../../types/fileTypes';
import type { AnnotationType } from '../slices/annotationSlice';

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

export const serializeMarkerFile = (
  images: ImageInfo[],
  annotationsByImage: Record<string, AnnotationType[]>
): string => {
  const markerFile: MarkerFile = {
    version: '1.0',
    images: images.map((image) => ({
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

export const deserializeMarkerFile = (
  json: string,
  markerFilePath?: string
): {
  images: ImageInfo[];
  annotationsByImage: Record<string, AnnotationType[]>;
} => {
  const markerFile = parseMarkerFile(json);
  const imageIds = new Set<string>();
  const images: ImageInfo[] = markerFile.images.map((image) => {
    validateImageRecord(image, imageIds);

    return {
      id: image.id,
      name: image.name,
      path: resolveImagePath(image.path.trim(), markerFilePath),
      width: image.width,
      height: image.height,
      createdAt: image.createdAt || new Date().toISOString(),
    };
  });
  const annotationsByImage: Record<string, AnnotationType[]> = {};
  markerFile.images.forEach((image) => {
    annotationsByImage[image.id] = image.annotations || [];
  });
  return { images, annotationsByImage };
};

const parseMarkerFile = (json: string): MarkerFile => {
  let value: unknown;

  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('标记文件不是有效的 JSON');
  }

  if (!isRecord(value) || !Array.isArray(value.images)) {
    throw new Error('标记文件缺少有效的图片列表');
  }

  return value as MarkerFile;
};

const validateImageRecord = (image: unknown, imageIds: Set<string>): void => {
  if (!isRecord(image)) {
    throw new Error('标记文件包含无效的图片信息');
  }

  const { id, path, width, height } = image;
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('图片缺少有效的 id');
  }
  if (imageIds.has(id)) {
    throw new Error(`图片 id 重复: ${id}`);
  }
  if (typeof path !== 'string' || path.trim() === '') {
    throw new Error(`图片「${id}」缺少有效的路径`);
  }
  if (
    typeof width !== 'number' ||
    !Number.isFinite(width) ||
    width <= 0 ||
    typeof height !== 'number' ||
    !Number.isFinite(height) ||
    height <= 0
  ) {
    throw new Error(`图片「${id}」的尺寸无效`);
  }

  imageIds.add(id);
};

const resolveImagePath = (imagePath: string, markerFilePath?: string): string => {
  if (!markerFilePath || isAbsolutePath(imagePath)) {
    return imagePath;
  }

  const separatorIndex = Math.max(
    markerFilePath.lastIndexOf('/'),
    markerFilePath.lastIndexOf('\\')
  );
  if (separatorIndex < 0) {
    return imagePath;
  }

  const directory = markerFilePath.slice(0, separatorIndex + 1);
  return `${directory}${imagePath.replace(/^[/\\]+/, '')}`;
};

const isAbsolutePath = (value: string): boolean =>
  value.startsWith('/') || value.startsWith('\\') || /^[a-zA-Z]:[\\/]/.test(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
