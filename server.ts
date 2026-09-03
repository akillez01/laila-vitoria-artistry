import './server/env';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import multer from 'multer';
import { UPLOADS_ROOT } from './server/upload';
import { authRouter } from './server/routes/auth';
import { adminProfileRouter } from './server/routes/adminProfile';
import { portfolioRouter } from './server/routes/portfolio';
import { albumsRouter } from './server/routes/albums';
import { galleriesRouter } from './server/routes/galleries';
import { packagesRouter } from './server/routes/packages';
import { ordersRouter } from './server/routes/orders';
import { paymentsRouter } from './server/routes/payments';
import { instagramRouter } from './server/routes/instagram';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
// Filenames are unique per upload (timestamp + random hex) and never overwritten,
// so a given URL's content never changes — safe to cache aggressively.
app.use('/uploads', express.static(UPLOADS_ROOT, { maxAge: '30d', immutable: true }));

app.use('/api/auth', authRouter);
app.use('/api', adminProfileRouter);
app.use('/api', portfolioRouter);
app.use('/api', albumsRouter);
app.use('/api', galleriesRouter);
app.use('/api', packagesRouter);
app.use('/api', ordersRouter);
app.use('/api', paymentsRouter);
app.use('/api', instagramRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Arquivo excede o tamanho máximo permitido.' });
    }
    return res.status(400).json({ error: `Falha no upload (${err.code}).` });
  }

  if (err instanceof Error && err.message === 'Formato de arquivo não suportado.') {
    return res.status(400).json({ error: err.message });
  }

  return next(err);
});

// Lazy Gemini client getter
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, categoryHint } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é a Assistente Virtual Inteligente do estúdio "Laila Vitória Artistry" (Laila Vitória Fotografia), sediada em Manaus/Planalto - AM.
Sua missão é atender clientes e visitantes com extrema elegância, cordialidade, tom refinado e profissionalismo.
Detalhes do Estúdio:
- Fotógrafa principal: Laila Vitória (mais de 10 anos de experiência em fotografia editorial, casamentos de luxo e retratos).
- Endereço: Rua Francisco Nobre Pontes, 04, Quadra 26 - Planalto, CEP: 69044-110, Manaus - AM.
- Email: laaylalopezz@gmail.com | contato@lailavitoria.com
- WhatsApp: +55 92 8160-4462
- Especialidades: Casamentos, Retratos Finos (Fine Art / Executivos), Moda Editorial, Ensaio de Casal.
- Códigos de Acesso de Exemplo a Galerias: "CASAMENTO-2024", "RETRATO-LV", "MODA-2024".

Responda em Português do Brasil com linguagem clara, sofisticada e acolhedora. Ofereça sugestões de paleta de cores para ensaios, dicas de preparação, informações sobre pacotes e auxílio sobre como acessar as galerias privadas.`;

    // Convert chat history format if needed
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Desculpe, não consegui processar a resposta no momento. Como posso ajudar você a agendar seu ensaio?';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Erro ao processar sua mensagem. Tente novamente em instantes.',
      details: error.message || 'Chave API não configurada ou erro no servidor.',
    });
  }
});

// Setup Vite or Static serving
async function setupServer() {
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
    app.get('*', (req, res) => {
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
