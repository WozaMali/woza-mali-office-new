export async function compressImageForCard(file: File): Promise<File> {
  console.warn('compressImageForCard is a stub.');
  return file;
}

export async function compressImageForSlide(file: File): Promise<File> {
  console.warn('compressImageForSlide is a stub.');
  return file;
}

export async function recompressImageFromUrl(url: string): Promise<Blob | null> {
  console.warn('recompressImageFromUrl is a stub.');
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch (error) {
    return null;
  }
}
