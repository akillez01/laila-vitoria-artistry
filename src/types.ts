export interface PhotoItem {
  id: string;
  title: string;
  category: 'casamentos' | 'retratos' | 'moda' | 'cultura' | 'festivais' | 'esporte' | 'aniversarios' | 'eventos';
  url: string;
  aspectRatio?: string;
  description?: string;
  location?: string;
  date?: string;
  mediaType?: 'photo' | 'video';
  credit?: string;
  cameraInfo?: {
    camera?: string;
    lens?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
  };
}

export interface ClientGallery {
  code: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  coverImage: string;
  totalPhotos: number;
  maxSelections: number;
  driveLink?: string;
  selectionSubmittedAt?: string;
  packageId?: number | null;
  packageName?: string;
  packagePriceCents?: number;
  extraPhotoPriceCents?: number;
  accessMode: 'code' | 'email';
  clientEmail?: string;
  photos: {
    id: string;
    url: string;
    title: string;
    selected: boolean;
    note?: string;
  }[];
}

export interface AdminProfile {
  id?: number;
  name: string;
  email: string;
  whatsapp: string;
  studioAddress: string;
  role: string;
  avatarUrl: string;
  instagramHandle?: string;
  instagramWidgetUrl?: string;
  bio?: string;
  notifications: {
    newOrders: boolean; // Novos Pedidos
    paymentAlerts: boolean; // Alertas de Pagamento
    weeklySummary: boolean; // Resumo Semanal
  };
}

export interface Package {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  active: boolean;
}

export interface Order {
  id: number;
  packageId: number | null;
  galleryCode?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  amountCents: number;
  status: string;
  paymentMethod?: string;
  mpPaymentId?: string;
  installments?: number;
  createdAt: string;
  paidAt?: string;
}

export interface InstagramPost {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  permalink: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
