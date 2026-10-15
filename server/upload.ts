import fs from 'fs';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Arquivos ficam no Cloudflare R2 (API compatível com S3). O navegador envia o arquivo
// direto para o R2 usando uma URL pré-assinada — o arquivo nunca passa pela função da
// Vercel (que tem limite de 4,5MB por requisição). Fotos JPEG/PNG são redimensionadas
// no navegador antes do envio (ver src/lib/api.ts).

let s3: S3Client | null = null;
export function getS3(): S3Client {
  if (!s3) {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('Credenciais do R2 não configuradas (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).');
    }
    s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3;
}

export function bucket(): string {
  const name = process.env.R2_BUCKET;
  if (!name) throw new Error('R2_BUCKET não configurado.');
  return name;
}

export function publicBaseUrl(): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error('R2_PUBLIC_URL não configurado.');
  return base.replace(/\/$/, '');
}

export function publicUrlFor(key: string): string {
  return `${publicBaseUrl()}/${key}`;
}

const extForMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
};

// Handler que substitui o antigo upload via multer: recebe { contentType, size } e devolve
// { uploadUrl, url, mediaType }. O cliente faz PUT do arquivo em uploadUrl.
export function makeUploader(subdir: string, opts?: { allowVideo?: boolean; maxFileSizeMb?: number }) {
  const allowVideo = !!opts?.allowVideo;
  const maxFileSizeMb = opts?.maxFileSizeMb ?? (allowVideo ? 40 : 15);

  return async (req: Request, res: Response) => {
    const { contentType, size } = req.body || {};
    const mime = String(contentType || '');
    const isImage = /^image\/(jpeg|png|webp|gif)$/.test(mime);
    const isVideo = allowVideo && /^video\/(mp4|quicktime|webm)$/.test(mime);
    if (!isImage && !isVideo) {
      return res.status(400).json({ error: 'Formato de arquivo não suportado.' });
    }
    if (!Number.isFinite(size) || size <= 0) {
      return res.status(400).json({ error: 'Tamanho do arquivo inválido.' });
    }
    if (size > maxFileSizeMb * 1024 * 1024) {
      return res.status(413).json({ error: 'Arquivo excede o tamanho máximo permitido.' });
    }

    const key = `${subdir}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extForMimeType[mime]}`;
    // Esses cabeçalhos entram na assinatura, então o cliente precisa enviá-los idênticos no PUT.
    // Nomes são únicos e nunca sobrescritos — seguro cachear para sempre.
    const headers = { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' };
    const uploadUrl = await getSignedUrl(
      getS3(),
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        ContentType: headers['Content-Type'],
        ContentLength: size,
        CacheControl: headers['Cache-Control'],
      }),
      { expiresIn: 15 * 60 },
    );

    res.json({ uploadUrl, headers, url: publicUrlFor(key), mediaType: isVideo ? 'video' : 'image' });
  };
}

// Envia um arquivo local para o bucket (usado pelo seed e pela migração de dados).
export async function putLocalFile(key: string, filePath: string, contentType: string) {
  await getS3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: fs.readFileSync(filePath),
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return publicUrlFor(key);
}
