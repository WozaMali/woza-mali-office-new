function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

async function compressWithMax(file: File, maxW: number, maxH: number, quality: number): Promise<File> {
  if (typeof document === 'undefined') return file
  const img = await loadImageFromFile(file)
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1)
  const w = Math.round(img.width * ratio)
  const h = Math.round(img.height * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file
  const out = new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: 'image/jpeg' })
  return out
}

export async function compressImageForCard(file: File): Promise<File> {
  return compressWithMax(file, 1280, 1280, 0.8)
}

export async function compressImageForSlide(file: File): Promise<File> {
  return compressWithMax(file, 1920, 1080, 0.85)
}

export async function recompressImageFromUrl(url: string): Promise<File> {
  const res = await fetch(url)
  const blob = await res.blob()
  const name = url.split('/').pop() || 'image.jpg'
  const file = new File([blob], name, { type: blob.type || 'image/jpeg' })
  return compressWithMax(file, 1280, 1280, 0.8)
}

