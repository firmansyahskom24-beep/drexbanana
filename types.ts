export type Theme = 'light' | 'dark';
export type AppMode = 'vector' | 'matrix';
export type GenerationStatus = 'pending' | 'generating' | 'complete' | 'error';

export interface UploadedImage {
  id: number;
  file: File;
  base64Data: string;
}

export interface Prompt {
  id: number;
  title: string;
  text: string;
}

export interface OutputItem {
  id: number;
  sourceImageId: number;
  promptId: number;
  imageUrl: string | null;
  status: GenerationStatus;
  error: string | null;
}
