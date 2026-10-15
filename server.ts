import './server/env.js';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app.js';
import { initDb } from './server/db.js';

// Servidor local (dev e `npm start`). Em produção na Vercel quem atende é api/index.ts
// e o frontend é servido como estático a partir de dist/.
const PORT = Number(process.env.PORT) || 3000;

// Setup Vite or Static serving
async function setupServer() {
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Vite fingerprints filenames in /assets with a content hash, so those are
    // safe to cache forever; everything else (frames, favicons, index.html)
    // can change without a filename change, so it gets a short cache instead.
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true }),
    );
    // index: false so index.html is never served with the long default cache below —
    // the catch-all route serves it explicitly with no-cache instead.
    app.use(express.static(distPath, { maxAge: '1d', index: false }));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), {
        headers: { 'Cache-Control': 'no-cache' },
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
