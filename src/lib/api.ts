export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError(body?.error || `Erro ${res.status}`, res.status);
  }
  return body as T;
}

// Fotos de câmera/celular chegam com 4000px+ e vários MB; nada no site exibe nada perto
// disso, então JPEG/PNG são reduzidos no navegador antes do envio. GIF/WebP/vídeo seguem
// intactos (GIF pode ser animado).
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.82;

async function optimizeImage(file: File): Promise<Blob> {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, JPEG_QUALITY));
    // Se a "otimização" não ajudou (imagem já pequena), manda o original.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

// Upload em duas etapas: o servidor devolve uma URL pré-assinada do R2 e o arquivo vai
// direto do navegador para o bucket, sem passar pela função da Vercel (limite de 4,5MB).
export async function apiUpload<T = any>(path: string, file: File): Promise<T> {
  const blob = await optimizeImage(file);
  const { uploadUrl, headers, ...result } = await api<{ uploadUrl: string; headers: Record<string, string> }>(path, {
    method: 'POST',
    body: JSON.stringify({ contentType: file.type, size: blob.size }),
  });

  const res = await fetch(uploadUrl, { method: 'PUT', headers, body: blob });
  if (!res.ok) {
    throw new ApiError(`Falha ao enviar o arquivo (${res.status}).`, res.status);
  }
  return result as T;
}
