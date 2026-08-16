import dotenv from 'dotenv';

// Precisa ser o primeiro import em server.ts: módulos ESM são avaliados
// antes do corpo do arquivo que os importa, então um `dotenv.config()`
// chamado depois de `import { authRouter } from './server/routes/auth'`
// (ou qualquer outro import que leia process.env no topo do módulo)
// roda tarde demais — as variáveis já teriam sido lidas como undefined.
dotenv.config();
