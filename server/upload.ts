import multer, { StorageEngine } from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

const extForMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
};

// Photos coming straight off a phone/camera routinely land at 4000px+ and several
// MB each; nothing in this app displays them anywhere near that size, so every
// JPEG/PNG upload is downscaled and recompressed on the way to disk. GIF/WebP/video
// pass through untouched (GIF may be animated; WebP/video re-encoding needs a
// different pipeline than sharp's still-image one).
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 82;

function createOptimizedDiskStorage(dest: string): StorageEngine {
  return {
    _handleFile(_req, file, cb) {
      const ext = extForMimeType[file.mimetype] || '';
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      const finalPath = path.join(dest, filename);
      const outStream = fs.createWriteStream(finalPath);
      outStream.on('error', cb);
      outStream.on('finish', () =>
        cb(null, { destination: dest, filename, path: finalPath, size: outStream.bytesWritten }),
      );

      const isResizableImage = file.mimetype === 'image/jpeg' || file.mimetype === 'image/png';
      const source: NodeJS.ReadableStream = isResizableImage
        ? file.stream.pipe(
            sharp()
              .rotate()
              .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
              .toFormat(file.mimetype === 'image/png' ? 'png' : 'jpeg', { quality: JPEG_QUALITY }),
          )
        : file.stream;

      source.on('error', cb);
      source.pipe(outStream);
    },
    _removeFile(_req, file, cb) {
      fs.unlink((file as Express.Multer.File).path, cb);
    },
  };
}

export function makeUploader(subdir: string, opts?: { allowVideo?: boolean; maxFileSizeMb?: number }) {
  const dest = path.join(UPLOADS_ROOT, subdir);
  fs.mkdirSync(dest, { recursive: true });

  const storage = createOptimizedDiskStorage(dest);

  const allowVideo = !!opts?.allowVideo;
  const maxFileSizeMb = opts?.maxFileSizeMb ?? (allowVideo ? 40 : 15);

  return multer({
    storage,
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
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
