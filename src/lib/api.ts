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

export async function apiUpload<T = any>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError(body?.error || `Erro ${res.status}`, res.status);
  }
  return body as T;
}
