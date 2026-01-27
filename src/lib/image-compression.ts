
// Stub for image compression
export async function compressImageForCard(file: File): Promise<File> {
  console.log('Image compression disabled (stub)');
  return file;
}

export async function compressImageForSlide(file: File): Promise<File> {
  console.log('Image compression disabled (stub)');
  return file;
}

export async function recompressImageFromUrl(url: string, isCard?: boolean): Promise<File> {
  console.log('Image recompression disabled (stub)');
  return new File([""], "stub.jpg", { type: "image/jpeg" });
}
