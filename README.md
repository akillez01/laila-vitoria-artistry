# Laila Vitória Artistry

Sistema completo (site + painel administrativo) para fotógrafos profissionais: vitrine de portfólio, catálogo de pacotes com preços, entrega de galerias para clientes, pagamentos via Pix/Mercado Pago e um assistente virtual com IA para responder visitantes.

Desenvolvido sob medida para a fotógrafa Laila Vitória ([laylavitoria.com.br](https://laylavitoria.com.br)) e disponibilizado aqui como peça de portfólio.

## Funcionalidades

- **Portfólio público** — vitrine de fotos e vídeos organizados por categoria (casamentos, retratos, moda, eventos etc.), com créditos de autoria.
- **Pacotes & preços** — catálogo de serviços com ativar/desativar, edição e exclusão protegida contra pacotes já vendidos.
- **Galerias de clientes** — dois modos de entrega:
  - **Código de acesso (paga)**, vinculada a um pacote e a um pagamento;
  - **E-mail (gratuita)**, para cortesias e parcerias, sem plataforma terceira.
- **Pedidos & pagamentos** — checkout com Mercado Pago e Pix (QR Code "copia e cola" gerado localmente), painel de pedidos pendentes/pagos com aprovação manual de fallback.
- **Perfil & Instagram** — dados do estúdio editáveis pelo próprio painel, feed do Instagram via widget ou curadoria manual de posts.
- **Assistente virtual com IA** (Google Gemini) — chat que responde dúvidas de visitantes sobre pacotes, ensaios e acesso a galerias.
- **Autenticação de admin** — login com sessão em cookie assinado (JWT) e múltiplos usuários administradores.

Guia de uso completo (não-técnico) em [`GUIA-DE-USO.md`](GUIA-DE-USO.md).

## Stack técnica

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, Motion (animações)
- **Backend:** Node.js + Express, TypeScript executado com `tsx`
- **Banco de dados:** SQLite (`better-sqlite3`)
- **Autenticação:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Pagamentos:** SDK oficial do Mercado Pago + geração de QR Code Pix
- **IA:** `@google/genai` (Gemini)
- **Build:** Vite (client) + esbuild (bundle do servidor para produção)

## Rodando localmente

**Pré-requisitos:** Node.js 18+

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# preencha GEMINI_API_KEY, JWT_SECRET, credenciais do Mercado Pago e chave Pix

# 3. Popular o banco com dados iniciais (opcional)
npm run seed
npm run create-admin

# 4. Rodar em desenvolvimento
npm run dev
```

Outros scripts:

```bash
npm run build   # build de produção (client + server)
npm run start   # roda o build de produção
npm run lint    # checagem de tipos (tsc --noEmit)
```

## Estrutura do projeto

```
src/            # frontend React (componentes, dados, tipos)
server/         # backend Express (rotas, auth, db, upload, pix)
public/         # assets estáticos
server.ts       # entrypoint do servidor
```

---

Projeto privado desenvolvido por [Achilles](https://github.com/akillez01) — disponibilizado como amostra de portfólio.
