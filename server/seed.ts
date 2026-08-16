import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db';
import { hashPassword } from './auth';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'contato@lailavitoria.com';
const SEED_IMG_SRC = path.resolve(process.cwd(), 'src/assets/img');
const SEED_IMG_DEST = path.resolve(process.cwd(), 'uploads/seed');
const ALBUM_IMG_SRC = path.resolve(process.cwd(), 'src/assets/img/album');

function generatePassword(): string {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12) + '!A1';
}

function copySeedImage(filename: string): string {
  fs.mkdirSync(SEED_IMG_DEST, { recursive: true });
  const src = path.join(SEED_IMG_SRC, filename);
  const destName = filename.replace(/\s+/g, '-').toLowerCase();
  const dest = path.join(SEED_IMG_DEST, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
  return `/uploads/seed/${destName}`;
}

function seedAdmin() {
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(ADMIN_EMAIL);
  if (existing) {
    console.log(`Admin já existe (${ADMIN_EMAIL}), pulando criação.`);
    return null;
  }

  const password = generatePassword();
  const avatarUrl = copySeedImage('Laila 2026-08-02 at 09.37.53.jpeg');

  db.prepare(
    `INSERT INTO admins (name, email, password_hash, whatsapp, studio_address, role, avatar_url, instagram_handle)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'Laila Vitória',
    ADMIN_EMAIL,
    hashPassword(password),
    '+55 92 8160-4462',
    'Rua Francisco Nobre Pontes, 04, Quadra 26 - Planalto, Manaus - AM',
    'FOTÓGRAFA PRINCIPAL',
    avatarUrl,
    '@laylaavit'
  );

  return { email: ADMIN_EMAIL, password };
}

function seedPackages() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM packages').get() as { c: number }).c;
  if (count > 0) {
    console.log('Pacotes já existem, pulando seed.');
    return;
  }

  const packages = [
    {
      name: 'Coleção Essencial',
      description: 'Ideal para mini weddings e celebrações íntimas: cobertura da cerimônia e recepção, ensaio de retratos dos noivos no local, galeria online privada em alta resolução.',
      price_cents: 250000,
      category: 'casamentos',
    },
    {
      name: 'Coleção Clássica',
      description: 'Cobertura completa do Making Of, Cerimônia e Festa, ensaio Pré-Wedding com consultoria de estilo, galeria online privada protegida por senha.',
      price_cents: 450000,
      category: 'casamentos',
    },
    {
      name: 'Coleção Fine Art Editorial',
      description: 'Cobertura ilimitada do Making Of, Cerimônia e Recepção, ensaio Pré-Wedding completo, álbum de luxo Fine Art encadernado à mão, consultoria completa de estética visual.',
      price_cents: 850000,
      category: 'casamentos',
    },
    {
      name: 'Retrato Fine Art / Executivo',
      description: 'Sessão individual em estúdio ou externa, tratamento de cor refinado, galeria online privada com fotos em alta resolução.',
      price_cents: 90000,
      category: 'retratos',
    },
  ];

  const insert = db.prepare(
    'INSERT INTO packages (name, description, price_cents, category, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  packages.forEach((p, i) => insert.run(p.name, p.description, p.price_cents, p.category, i));
}

function seedGalleries() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM client_galleries').get() as { c: number }).c;
  if (count > 0) {
    console.log('Galerias já existem, pulando seed.');
    return;
  }

  const weddingCover = copySeedImage('reiane 2026-08-02 at 09.37.52.jpeg');
  const portraitCover = copySeedImage('Laila 2026-08-02 at 09.37.53.jpeg');
  const fashionCover = copySeedImage('laila2 2026-08-02 at 09.37.53.jpeg');
  const culturaCover = copySeedImage('WhatsApp Image 2026-08-02 at 09.37.51.jpeg');
  const heroImg = copySeedImage('WhatsApp Image 2026-08-02 at 09.37.52.jpeg');

  const galleries = [
    {
      code: 'CASAMENTO-2024',
      clientName: 'Sofia & Gabriel',
      eventType: 'Casamento Fine Art',
      eventDate: '18 de Maio, 2024',
      coverImage: weddingCover,
      maxSelections: 15,
      driveLink: 'https://drive.google.com/drive/folders/sample-gallery-drive',
      photos: [
        { url: weddingCover, title: 'Entrada da Noiva - Detalhe', selected: 1, note: 'Amamos essa iluminação do vestido!' },
        { url: heroImg, title: 'Troca de Alianças', selected: 1, note: null },
        { url: portraitCover, title: 'Retrato Sofia Fine Art', selected: 1, note: 'Favorita para o álbum principal' },
        { url: fashionCover, title: 'Sessão dos Noivos no Jardim', selected: 0, note: null },
        { url: culturaCover, title: 'Celebração & Emoção', selected: 0, note: null },
      ],
    },
    {
      code: 'CULTURA-2024',
      clientName: 'Comissão de Cultura & Festival',
      eventType: 'Cobertura de Espetáculo Cultural',
      eventDate: '24 de Junho, 2024',
      coverImage: culturaCover,
      maxSelections: 30,
      driveLink: 'https://drive.google.com/drive/folders/sample-cultura-drive',
      photos: [
        { url: culturaCover, title: 'Abertura do Espetáculo', selected: 1, note: null },
        { url: weddingCover, title: 'Apresentação São João da Gente', selected: 1, note: null },
        { url: heroImg, title: 'Dança Ritual e Figurinos', selected: 1, note: null },
      ],
    },
    {
      code: 'RETRATO-LV',
      clientName: 'Dra. Beatriz Mendes',
      eventType: 'Retrato de Posicionamento de Imagem',
      eventDate: '02 de Junho, 2024',
      coverImage: portraitCover,
      maxSelections: 8,
      driveLink: 'https://drive.google.com/drive/folders/sample-beatriz-drive',
      photos: [
        { url: portraitCover, title: 'Retrato Principal com Câmera', selected: 1, note: null },
        { url: fashionCover, title: 'Expressão Confiante & Estúdio', selected: 1, note: null },
        { url: heroImg, title: 'Foto de Perfil para Mídias', selected: 0, note: null },
      ],
    },
    {
      code: 'MODA-2024',
      clientName: 'Coleção Primavera Artistry',
      eventType: 'Editorial de Moda',
      eventDate: '10 de Julho, 2024',
      coverImage: fashionCover,
      maxSelections: 20,
      driveLink: 'https://drive.google.com/drive/folders/sample-moda-drive',
      photos: [
        { url: fashionCover, title: 'Looks de Passarela I', selected: 1, note: null },
        { url: heroImg, title: 'Sombra e Geometria', selected: 1, note: null },
      ],
    },
  ];

  const insertGallery = db.prepare(
    `INSERT INTO client_galleries (code, client_name, event_type, event_date, cover_image, max_selections, drive_link)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertPhoto = db.prepare(
    'INSERT INTO gallery_photos (id, gallery_id, url, title, selected, note, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const g of galleries) {
    const info = insertGallery.run(g.code, g.clientName, g.eventType, g.eventDate, g.coverImage, g.maxSelections, g.driveLink);
    g.photos.forEach((p, i) => {
      insertPhoto.run(crypto.randomUUID(), info.lastInsertRowid, p.url, p.title, p.selected, p.note, i);
    });
  }
}

function copyAlbumSeedImage(filename: string): string {
  fs.mkdirSync(SEED_IMG_DEST, { recursive: true });
  const src = path.join(ALBUM_IMG_SRC, filename);
  const dest = path.join(SEED_IMG_DEST, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
  return `/uploads/seed/${filename}`;
}

function seedAlbum() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM album_images').get() as { c: number }).c;
  if (count > 0) {
    console.log('Álbum já existe, pulando seed.');
    return;
  }

  const images = [
    { file: 'danca-contorcao-pb.jpeg', title: 'Expressão Cênica em Movimento', description: 'Registro dramático em preto e branco capturando a flexibilidade e a intensidade de uma bailarina em pleno palco.' },
    { file: 'danca-saia-vermelha.jpeg', title: 'Solo em Vermelho e Azul', description: 'Bailarina em movimento sob luzes coloridas de palco, unindo drama e delicadeza em cada passo.' },
    { file: 'danca-extensao-pb.jpeg', title: 'Precisão e Força', description: 'Extensão impecável capturada em preto e branco, evidenciando técnica e disciplina da dança.' },
    { file: 'debutante-neon-15-pb.jpeg', title: 'Debutante sob Luz Neon', description: 'Retrato clássico em preto e branco da aniversariante iluminada pelo letreiro neon do grande dia.' },
    { file: 'yasmin-sopra-vela-bolo.jpeg', title: 'Sopro dos 15 Anos', description: 'Yasmin sopra as velas em meio a borboletas e flores, selando o início de uma nova fase.' },
    { file: 'yasmin-buque-baloes.jpeg', title: 'Sorriso entre Balões e Flores', description: 'Retrato espontâneo cercado por buquê e balões que marcam a data especial.' },
    { file: 'festa-happy-birthday-cenario.jpeg', title: 'Cenário de Festa ao Ar Livre', description: 'Decoração autoral em tons de verde, a moldura perfeita para celebrações inesquecíveis.' },
    { file: 'mesa-doces-pb.jpeg', title: 'Mesa de Doces em Preto e Branco', description: 'Still life elegante dos detalhes doces que compõem a celebração.' },
    { file: 'abraco-avo-neta-igreja.jpeg', title: 'Abraço de Gerações', description: 'Momento emotivo entre avó e neta diante do altar, celebrando fé e família.' },
    { file: 'discurso-agradecimento-igreja.jpeg', title: 'Discurso de Agradecimento', description: 'A aniversariante compartilha palavras de gratidão diante da comunidade, unindo espiritualidade e celebração.' },
    { file: 'andor-cirio-procissao.jpeg', title: 'Andor Iluminado — Procissão Noturna', description: 'A imagem sacra emoldurada por flores brancas e amarelas segue em procissão, cercada pela multidão de fiéis.' },
    { file: 'andor-cirio-flores.jpeg', title: 'Detalhe Floral do Andor', description: 'Close-up do andor ricamente decorado, capturando o brilho dourado e a devoção do Círio.' },
  ];

  const insert = db.prepare(
    'INSERT INTO album_images (id, title, description, url, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  images.forEach((img, i) => {
    const url = copyAlbumSeedImage(img.file);
    insert.run(crypto.randomUUID(), img.title, img.description, url, i);
  });
}

function seedPortfolio() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM portfolio_photos').get() as { c: number }).c;
  if (count > 0) {
    console.log('Portfólio já existe, pulando seed.');
    return;
  }

  const culturaCover = copySeedImage('WhatsApp Image 2026-08-02 at 09.37.51.jpeg');
  const boyMaracas = copySeedImage('WhatsApp Image 2026-08-02 at 09.37.52.jpeg');
  const raianeEditorial = copySeedImage('reiane 2026-08-02 at 09.37.52.jpeg');
  const lailaReal = copySeedImage('Laila 2026-08-02 at 09.37.53.jpeg');
  const lailaAction = copySeedImage('laila2 2026-08-02 at 09.37.53.jpeg');

  const photos = [
    { id: 'cult-1', title: 'Obra Editorial Destaque — Raiane em São João da Gente', category: 'cultura', url: raianeEditorial, description: 'Registro autoral e vibrante de Raiane na apresentação junina São João da Gente.', location: 'Palco Principal, Manaus - AM', date: 'Julho 2024' },
    { id: 'cult-2', title: 'Festival Folclórico — Dança com Penas de Pavão', category: 'cultura', url: culturaCover, description: 'Espetáculo de dança ritualística celebrando o folclore e riqueza da Amazônia.', location: 'Bumbódromo / Arena Cultural Manaus', date: 'Junho 2024' },
    { id: 'cult-3', title: 'Tradição & Ritmo do Mirim Amazônico', category: 'cultura', url: boyMaracas, description: 'Performance festiva do dançarino mirim com maracás.', location: 'Festival Cultural de Manaus', date: 'Junho 2024' },
    { id: 'port-1', title: 'Layla Vitória — Fotógrafa por trás da Lente', category: 'retratos', url: lailaReal, description: 'Retrato autoral de Layla Vitória.', location: 'Estúdio Layla Vitória, Manaus', date: 'Julho 2024' },
    { id: 'port-2', title: 'Layla Vitória em Ação Editorial (P&B)', category: 'retratos', url: lailaAction, description: 'Fotografia em preto e branco documentando a concentração de Layla Vitória.', location: 'Manaus, AM', date: 'Junho 2024' },
    { id: 'wed-1', title: 'Raiane — Movimento & Paixão Cultural', category: 'casamentos', url: raianeEditorial, description: 'Ensaio fotográfico autoral destacando drama cênico.', location: 'Manaus, AM', date: 'Julho 2024' },
    { id: 'fash-1', title: 'Essência Folclórica Amazônica', category: 'moda', url: culturaCover, description: 'Ensaio editorial com foco no design de indumentárias nativas.', location: 'Teatro Amazonas, Manaus', date: 'Maio 2024' },
  ];

  const insert = db.prepare(
    `INSERT INTO portfolio_photos (id, title, category, url, description, location, date, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  photos.forEach((p, i) => insert.run(p.id, p.title, p.category, p.url, p.description, p.location, p.date, i));
}

function main() {
  const credentials = seedAdmin();
  seedPackages();
  seedGalleries();
  seedPortfolio();
  seedAlbum();

  console.log('\n✅ Seed concluído.');
  if (credentials) {
    console.log('\n=== CREDENCIAIS DO ADMIN (guarde e troque a senha depois) ===');
    console.log(`Email: ${credentials.email}`);
    console.log(`Senha: ${credentials.password}`);
    console.log('===============================================================\n');
  }
}

main();
