// Entry point padrão esperado pela Node.js Toolkit do Plesk (Phusion Passenger).
// O build real (vite build + esbuild) gera dist/server.cjs; este arquivo só delega para ele.
// package.json tem "type": "module" (exigido pelo tooling do Vite), então este arquivo é
// carregado como ESM pelo Node — usar require() aqui quebra com "ReferenceError: require is
// not defined in ES module scope". dist/server.cjs mantém a extensão .cjs, então o loader ESM
// do Node sabe tratá-lo como CommonJS mesmo assim; import estático funciona para isso.
//
// Fix 2026-08-02: 'dotenv/config' precisa ser importado ANTES do bundle. server.ts chama
// dotenv.config() na linha 17, mas os imports ES são hoisted — o grafo inteiro (authRouter ->
// server/db.ts) é avaliado antes do corpo de server.ts rodar, e server/db.ts lê
// process.env.DATABASE_PATH como constante de topo de módulo. Resultado: em produção
// (cwd=httpdocs), DATABASE_PATH nunca era lido do .env a tempo e caía no fallback relativo
// './data/app.db', resolvendo para httpdocs/data/app.db (um banco vazio) em vez do banco real
// em /var/www/vhosts/.../data/app.db. Em dev isso é invisível porque o fallback relativo
// coincide, por acaso, com o local real do banco de dev. Import aqui, antes do bundle, garante
// que process.env já está populado quando o bundle roda — sem tocar em server.ts/db.ts.
import 'dotenv/config';
import './dist/server.cjs';
