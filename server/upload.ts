import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

export function makeUploader(subdir: string, opts?: { allowVideo?: boolean }) {
  const dest = path.join(UPLOADS_ROOT, subdir);
  fs.mkdirSync(dest, { recursive: true });

  const extForMimeType: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm',
  };

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      // Extensão derivada do mimetype validado (nunca do originalname, que é
      // controlado pelo cliente e poderia forjar .html/.svg para XSS armazenado).
      const ext = extForMimeType[file.mimetype] || '';
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, name);
    },
  });

  const allowVideo = !!opts?.allowVideo;

  return multer({
    storage,
    limits: { fileSize: allowVideo ? 40 * 1024 * 1024 : 15 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const isImage = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
      const isVideo = allowVideo && /^video\/(mp4|quicktime|webm)$/.test(file.mimetype);
      if (!isImage && !isVideo) {
        return cb(new Error('Formato de arquivo não suportado.'));
      }
      cb(null, true);
    },
  });
}

export function publicUrlFor(subdir: string, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}
