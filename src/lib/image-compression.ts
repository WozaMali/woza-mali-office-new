
import { toast } from 'sonner';

interface ImageCompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export const compressImageForCard = async (file: File): Promise<File> => {
  return compressImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.8 });
};

export const compressImageForSlide = async (file: File): Promise<File> => {
  return compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.8 });
};

export const recompressImageFromUrl = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    const compressedFile = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
    return compressedFile;
  } catch (error) {
    console.error('Error recompressing image:', error);
    throw error;
  }
};

const compressImage = (file: File, options: ImageCompressionOptions): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }

        if (height > options.maxHeight) {
          width = Math.round((width * options.maxHeight) / height);
          height = options.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          options.quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
