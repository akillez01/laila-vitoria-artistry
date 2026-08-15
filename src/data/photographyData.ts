import { PhotoItem } from '../types';

export const INSTAGRAM_URL = 'https://www.instagram.com/laylaavit?igsh=MXNzOXRnMnZ1cjM0NQ%3D%3D&utm_source=qr';
export const INSTAGRAM_HANDLE = '@laylaavit';
export const WHATSAPP_PHONE = '+55 92 8160-4462';
export const WHATSAPP_LINK = 'https://wa.me/559281604462';

import LailaReal from '../assets/img/Laila 2026-08-02 at 09.37.53.jpeg';
import LailaAction from '../assets/img/laila2 2026-08-02 at 09.37.53.jpeg';
import IndigenousDancer from '../assets/img/reiane 2026-08-02 at 09.37.52.jpeg';
import Reiane from '../assets/img/WhatsApp Image 2026-08-02 at 09.37.51.jpeg';
import BoyMaracas from '../assets/img/WhatsApp Image 2026-08-02 at 09.37.52.jpeg';

export const INDIGENOUS_PEACOCK_DANCER = IndigenousDancer;
export const BOY_MARACAS_DANCER = BoyMaracas;
export const RAIANE_EDITORIAL_PHOTO = Reiane;
export const LAYLA_REAL_PHOTO = LailaReal;
export const LAYLA_ACTION_BW_PHOTO = LailaAction;

// Core aliases for site sections
export const LOGO_IMAGE_URL = INDIGENOUS_PEACOCK_DANCER;
export const HERO_IMAGE_URL = INDIGENOUS_PEACOCK_DANCER; // Festa bem colorida no Hero!
export const WEDDING_COVER_URL = RAIANE_EDITORIAL_PHOTO;
export const PORTRAIT_COVER_URL = LAYLA_REAL_PHOTO;
export const FASHION_COVER_URL = LAYLA_ACTION_BW_PHOTO;

export const LAILA_PHOTOGRAPHER_REAL = LAYLA_REAL_PHOTO;
export const LAILA_PHOTOGRAPHER_ACTION = LAYLA_ACTION_BW_PHOTO;
export const CULTURA_COVER_URL = INDIGENOUS_PEACOCK_DANCER;
export const SAO_JOAO_STAGE_URL = RAIANE_EDITORIAL_PHOTO;
export const INDIGENOUS_DANCE_URL = BOY_MARACAS_DANCER;

export const ABOUT_PORTRAIT_URL = LAYLA_REAL_PHOTO;
export const ADMIN_AVATAR_URL = LAYLA_REAL_PHOTO;

export const INITIAL_PORTFOLIO: PhotoItem[] = [
  {
    id: 'cult-1',
    title: 'Obra Editorial Destaque — Raiane em São João da Gente',
    category: 'cultura',
    url: RAIANE_EDITORIAL_PHOTO,
    description: 'Registro autoral e vibrante de Raiane na apresentação junina São João da Gente, capturando força expressiva e movimento sob luz cênica.',
    location: 'Palco Principal, Manaus - AM',
    date: 'Julho 2024',
    cameraInfo: {
      camera: 'Canon EOS R5',
      lens: '70-200mm f/2.8 L IS USM',
      iso: 'ISO 1250',
      aperture: 'f/2.8',
      shutter: '1/1000s'
    }
  },
  {
    id: 'cult-2',
    title: 'Festival Folclórico — Dança com Penas de Pavão',
    category: 'cultura',
    url: INDIGENOUS_PEACOCK_DANCER,
    description: 'Espetáculo de dança ritualística com exuberante cocar de plumas e penas de pavão, celebrando o folclore e riqueza da Amazônia.',
    location: 'Bumbódromo / Arena Cultural Manaus',
    date: 'Junho 2024',
    cameraInfo: {
      camera: 'Canon EOS R6 Mark II',
      lens: '24-70mm f/2.8 L II',
      iso: 'ISO 1600',
      aperture: 'f/2.8',
      shutter: '1/800s'
    }
  },
  {
    id: 'cult-3',
    title: 'Tradição & Ritmo do Mirim Amazônico',
    category: 'cultura',
    url: BOY_MARACAS_DANCER,
    description: 'Performance festiva do dançarino mirim com maracás e vestimenta de plumas verdes sob efeitos de luzes coloridas.',
    location: 'Festival Cultural de Manaus',
    date: 'Junho 2024',
    cameraInfo: {
      camera: 'Canon EOS R5',
      lens: '85mm f/1.2 L',
      iso: 'ISO 800',
      aperture: 'f/2.0',
      shutter: '1/640s'
    }
  },
  {
    id: 'port-1',
    title: 'Layla Vitória — Fotógrafa por trás da Lente',
    category: 'retratos',
    url: LAYLA_REAL_PHOTO,
    description: 'Retrato autoral de Layla Vitória segurando sua câmera Canon com lente da série L profissional.',
    location: 'Estúdio Layla Vitória, Manaus',
    date: 'Julho 2024',
    cameraInfo: {
      camera: 'Canon EOS R5',
      lens: '50mm f/1.2 L USM',
      iso: 'ISO 200',
      aperture: 'f/1.8',
      shutter: '1/400s'
    }
  },
  {
    id: 'port-2',
    title: 'Layla Vitória em Ação Editorial (P&B)',
    category: 'retratos',
    url: LAYLA_ACTION_BW_PHOTO,
    description: 'Fotografia em preto e branco documentando a concentração de Layla Vitória durante a cobertura de evento ao vivo.',
    location: 'Manaus, AM',
    date: 'Junho 2024',
    cameraInfo: {
      camera: 'Canon EOS R5',
      lens: '35mm f/1.4 L',
      iso: 'ISO 400',
      aperture: 'f/2.2',
      shutter: '1/500s'
    }
  },
  {
    id: 'wed-1',
    title: 'Raiane — Movimento & Paixão Cultural',
    category: 'festivais',
    url: RAIANE_EDITORIAL_PHOTO,
    description: 'Ensaio fotográfico autoral destacando drama cênico e riqueza de trajes típicos.',
    location: 'Manaus, AM',
    date: 'Julho 2024',
    cameraInfo: {
      camera: 'Canon EOS R5',
      lens: '70-200mm f/2.8 L',
      iso: 'ISO 1000',
      aperture: 'f/2.8',
      shutter: '1/800s'
    }
  },
  {
    id: 'fash-1',
    title: 'Essência Folclórica Amazônica',
    category: 'moda',
    url: INDIGENOUS_PEACOCK_DANCER,
    description: 'Ensaio editorial com foco no design de indumentárias nativas e expressão artística.',
    location: 'Teatro Amazonas, Manaus',
    date: 'Maio 2024',
    cameraInfo: {
      camera: 'Fujifilm GFX 100 II',
      lens: '110mm f/2 R LM',
      iso: 'ISO 200',
      aperture: 'f/2.8',
      shutter: '1/640s'
    }
  }
];
