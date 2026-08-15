import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Check, Save, Instagram, LogOut, ClipboardList, AlertCircle, Images, FolderHeart, ChevronDown, QrCode, Download, Tag } from 'lucide-react';
import { AdminProfile, Order, ClientGallery } from '../types';
import { api, apiUpload, ApiError } from '../lib/api';
import { AdminPortfolioManager } from './AdminPortfolioManager';
import { AdminGalleriesManager } from './AdminGalleriesManager';
import { AdminInstagramManager } from './AdminInstagramManager';
import { AdminPackagesManager } from './AdminPackagesManager';

interface ProfileAdminViewProps {
  profile: AdminProfile;
  onProfileChange: (profile: AdminProfile) => void;
  onBack: () => void;
  onLogout: () => void;
  onOpenImageModal: (url: string, title: string) => void;
}

export const ProfileAdminView: React.FC<ProfileAdminViewProps> = ({
  profile: initialProfile,
  onProfileChange,
  onBack,
  onLogout,
  onOpenImageModal,
}) => {
  const [tab, setTab] = useState<'perfil' | 'pedidos' | 'portfolio' | 'galerias' | 'pacotes' | 'instagram'>('perfil');
  const [profile, setProfile] = useState<AdminProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [openGalleryCode, setOpenGalleryCode] = useState<string | null>(null);

  const handleViewGallery = (code: string) => {
    setOpenGalleryCode(code);
    setTab('galerias');
  };

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleToggle = (key: keyof AdminProfile['notifications']) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { profile: saved } = await api<{ profile: AdminProfile }>('/api/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      onProfileChange(saved);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const { url } = await apiUpload<{ url: string }>('/api/admin/profile/avatar', file);
      const { profile: saved } = await api<{ profile: AdminProfile }>('/api/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify({ ...profile, avatarUrl: url }),
      });
      setProfile(saved);
      onProfileChange(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar a foto.');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-[#121315] text-neutral-900 dark:text-white min-h-screen pb-32 transition-colors duration-300">
      {/* Header / Back Navigation */}
      <header className="w-full px-5 sm:px-8 md:px-16 py-4 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#121315]/90 backdrop-blur-md z-20 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar ao Portfolio</span>
        </button>

        <h1 className="font-playfair text-xl sm:text-2xl font-bold tracking-tight">
          Painel Administrativo
        </h1>

        <button
          onClick={onLogout}
          className="text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
          title="Sair"
        >
          <span className="hidden sm:inline">Sair</span>
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 md:px-16 mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('perfil')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${
            tab === 'perfil'
              ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setTab('portfolio')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1.5 ${
            tab === 'portfolio'
              ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Images className="w-3.5 h-3.5" /> Portfólio
        </button>
        <button
          onClick={() => setTab('galerias')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1.5 ${
            tab === 'galerias'
              ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" /> Galerias
        </button>
        <button
          onClick={() => setTab('pacotes')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1.5 ${
            tab === 'pacotes'
              ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Tag className="w-3.5 h-3.5" /> Pacotes
        </button>
        <button
          onClick={() => setTab('pedidos')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1.5 ${
            tab === 'pedidos'
              ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" /> Pedidos
        </button>
        <button
          onClick={() => setTab('instagram')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1.5 ${
            tab === 'instagram'
              ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" /> Instagram
        </button>
      </div>

      {tab === 'portfolio' ? (
        <AdminPortfolioManager />
      ) : tab === 'galerias' ? (
        <AdminGalleriesManager initialCode={openGalleryCode} />
      ) : tab === 'pacotes' ? (
        <AdminPackagesManager />
      ) : tab === 'instagram' ? (
        <AdminInstagramManager />
      ) : tab === 'perfil' ? (
        <main className="px-5 sm:px-8 md:px-16 max-w-2xl mx-auto mt-8 flex flex-col gap-8">
          {/* Avatar Section */}
          <section className="flex flex-col items-center gap-2">
            <div className="relative group">
              <button
                onClick={() => onOpenImageModal(profile.avatarUrl, 'Foto de Perfil Admin - Laila Vitória')}
                aria-label="Ver foto em tamanho maior"
                title="Ver foto em tamanho maior"
                className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-amber-400 shadow-md bg-neutral-200 dark:bg-neutral-800 block"
              >
                <img
                  alt="Foto de Perfil Laila Vitória"
                  className="w-full h-full object-cover"
                  src={profile.avatarUrl}
                />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Trocar foto de perfil"
                className="absolute bottom-0 right-0 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 rounded-full p-2.5 shadow-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-colors disabled:opacity-50"
                title="Trocar foto de perfil (selecionar do computador)"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            {uploadingAvatar && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Enviando foto...</p>
            )}
            <p className="font-inter text-xs tracking-[0.2em] text-amber-600 dark:text-amber-400 uppercase mt-2 font-bold">
              {profile.role}
            </p>
          </section>

          {/* Contact Information Section */}
          <section className="flex flex-col gap-4 bg-white dark:bg-[#181a1d] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h2 className="font-playfair text-xl text-neutral-900 dark:text-white mb-2 font-bold">
              Informações Pessoais
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="name">
                Nome Completo
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-0 text-amber-500 ml-1 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-inter text-sm pl-8 py-2 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="email">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-0 text-amber-500 ml-1 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-inter text-sm pl-8 py-2 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="whatsapp">
                WhatsApp
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 absolute left-0 text-amber-500 ml-1 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-inter text-sm pl-8 py-2 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                  id="whatsapp"
                  type="tel"
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="instagram">
                Instagram
              </label>
              <div className="relative flex items-center">
                <Instagram className="w-4 h-4 absolute left-0 text-rose-500 ml-1 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-inter text-sm pl-8 py-2 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                  id="instagram"
                  type="text"
                  value={profile.instagramHandle || ''}
                  onChange={(e) => setProfile({ ...profile, instagramHandle: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="instagramWidget">
                Link do Widget de Instagram (feed ao vivo)
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-inter text-sm py-2 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                id="instagramWidget"
                type="url"
                placeholder="Ex: https://snapwidget.com/embed/123456"
                value={profile.instagramWidgetUrl || ''}
                onChange={(e) => setProfile({ ...profile, instagramWidgetUrl: e.target.value })}
              />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Crie um widget gratuito em snapwidget.com com o @{profile.instagramHandle?.replace('@', '') || '...'} e
                cole aqui o link de incorporação (embed). Isso faz a seção Instagram do site mostrar os posts reais
                automaticamente, sem precisar subir nada manualmente.
              </p>
            </div>

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="address">
                Endereço do Estúdio
              </label>
              <div className="relative flex items-start mt-1">
                <MapPin className="w-4 h-4 absolute left-0 text-amber-500 ml-1 mt-1 pointer-events-none" />
                <textarea
                  className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-inter text-sm pl-8 py-1 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors resize-none"
                  id="address"
                  rows={2}
                  value={profile.studioAddress}
                  onChange={(e) => setProfile({ ...profile, studioAddress: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold" htmlFor="bio">
                Sobre / Formação
              </label>
              <textarea
                className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white font-inter text-sm px-3 py-2 focus:ring-0 focus:border-amber-500 dark:focus:border-amber-400 transition-colors resize-none"
                id="bio"
                rows={3}
                placeholder="Ex: Estudante de Audiovisual pela UEA (Universidade do Estado do Amazonas)..."
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
          </section>

          {/* Notification Settings Section */}
          <section className="flex flex-col gap-4 bg-white dark:bg-[#181a1d] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h2 className="font-playfair text-xl text-neutral-900 dark:text-white mb-2 font-bold">
              Notificações
            </h2>

            <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">Novos Pedidos & Seleções</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Alertas em tempo real quando clientes enviarem seleções</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.notifications.newOrders}
                onClick={() => handleToggle('newOrders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  profile.notifications.newOrders ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-950 transition-transform ${
                    profile.notifications.newOrders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">Alertas de Pagamento</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Notificações de faturas e parcelas</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.notifications.paymentAlerts}
                onClick={() => handleToggle('paymentAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  profile.notifications.paymentAlerts ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-950 transition-transform ${
                    profile.notifications.paymentAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">Resumo Semanal</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Métricas de visualização das galerias</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.notifications.weeklySummary}
                onClick={() => handleToggle('weeklySummary')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  profile.notifications.weeklySummary ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-950 transition-transform ${
                    profile.notifications.weeklySummary ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
        </main>
      ) : (
        <OrdersTab onViewGallery={handleViewGallery} />
      )}

      {/* Toast Notification */}
      {savedSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-6 py-3 rounded-md shadow-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 dark:text-neutral-950" />
          <span>Alterações salvas com sucesso!</span>
        </div>
      )}

      {/* Fixed Action Bottom Bar */}
      {tab === 'perfil' && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 dark:bg-[#121315]/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex justify-center pb-6 pt-3 z-20">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full max-w-sm bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-inter text-xs font-bold uppercase py-3.5 px-8 rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  approved: { label: 'Pago', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  cancelled: { label: 'Cancelado', className: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' },
  in_process: { label: 'Em Processamento', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix_estatico: 'Pix (QR direto)',
  pix: 'Pix',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  bolbradesco: 'Boleto',
  ticket: 'Boleto',
};

const OrdersTab: React.FC<{ onViewGallery: (code: string) => void }> = ({ onViewGallery }) => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    api<{ orders: Order[] }>('/api/admin/orders')
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os pedidos.'));
  }, []);

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const { order } = await api<{ order: Order }>(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev?.map((o) => (o.id === order.id ? order : o)) || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível atualizar o pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    if (!orders) return null;
    const approved = orders.filter((o) => o.status === 'approved');
    const pending = orders.filter((o) => o.status === 'pending');
    return {
      totalReceivedCents: approved.reduce((sum, o) => sum + o.amountCents, 0),
      totalPendingCents: pending.reduce((sum, o) => sum + o.amountCents, 0),
      approvedCount: approved.length,
    };
  }, [orders]);

  const handleExportCsv = () => {
    if (!orders || orders.length === 0) return;
    const header = ['ID', 'Cliente', 'Email', 'Valor (R$)', 'Status', 'Método', 'Parcelas', 'Data'];
    const rows = orders.map((o) => [
      String(o.id),
      o.clientName,
      o.clientEmail,
      (o.amountCents / 100).toFixed(2).replace('.', ','),
      STATUS_LABELS[o.status]?.label || o.status,
      o.paymentMethod ? PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod : '',
      o.installments ? `${o.installments}x` : '',
      new Date(o.createdAt).toLocaleString('pt-BR'),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-laila-vitoria-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {stats && orders && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">Total Recebido</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(stats.totalReceivedCents)}</p>
          </div>
          <div className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">Pendente</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatPrice(stats.totalPendingCents)}</p>
          </div>
          <div className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between gap-2 col-span-2 sm:col-span-1">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Pedidos Pagos</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats.approvedCount}</p>
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors shrink-0"
              title="Exportar todos os pedidos para uma planilha CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>
      )}

      {orders === null ? (
        <p className="text-sm text-neutral-500">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum pedido registrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || {
              label: order.status,
              className: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
            };
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="cursor-pointer p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">{order.clientName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {order.clientEmail} · Pedido #{order.id} · {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </p>
                    {order.galleryCode && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Galeria: {order.galleryCode}{' '}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewGallery(order.galleryCode!);
                          }}
                          className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                        >
                          Ver seleção
                        </button>
                      </p>
                    )}
                    {order.paymentMethod && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Método: {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                        {order.installments ? ` · ${order.installments}x` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-900 dark:text-amber-400">{formatPrice(order.amountCents)}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                    {order.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, 'approved');
                          }}
                          disabled={updatingId === order.id}
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          title="Confirmar que o pagamento foi recebido"
                        >
                          Marcar Pago
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, 'cancelled');
                          }}
                          disabled={updatingId === order.id}
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
                          title="Cancelar pedido"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {isExpanded && <OrderDetailExpanded order={order} />}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

const OrderDetailExpanded: React.FC<{ order: Order }> = ({ order }) => {
  const [gallery, setGallery] = useState<ClientGallery | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(!!order.galleryCode);
  const [pix, setPix] = useState<{ payload: string; qrCodeDataUrl: string } | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState('');

  useEffect(() => {
    if (!order.galleryCode) return;
    setGalleryLoading(true);
    api<{ gallery: ClientGallery }>(`/api/galleries/${encodeURIComponent(order.galleryCode)}`)
      .then(({ gallery }) => setGallery(gallery))
      .catch(() => setGallery(null))
      .finally(() => setGalleryLoading(false));
  }, [order.galleryCode]);

  const handleViewPix = async () => {
    setPixLoading(true);
    setPixError('');
    try {
      const data = await api<{ payload: string; qrCodeDataUrl: string }>('/api/payments/pix', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id }),
      });
      setPix(data);
    } catch (err) {
      setPixError(err instanceof ApiError ? err.message : 'Não foi possível gerar o QR Code Pix.');
    } finally {
      setPixLoading(false);
    }
  };

  const selectedPhotos = gallery?.photos.filter((p) => p.selected) || [];

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-[#101113] space-y-4">
      {order.mpPaymentId && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          ID pagamento Mercado Pago: <span className="font-mono">{order.mpPaymentId}</span>
        </p>
      )}

      {order.status === 'pending' && (
        <div>
          {!pix ? (
            <button
              onClick={handleViewPix}
              disabled={pixLoading}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              <QrCode className="w-3.5 h-3.5" /> {pixLoading ? 'Gerando...' : 'Ver QR Pix'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <img
                src={pix.qrCodeDataUrl}
                alt="QR Code Pix"
                className="w-32 h-32 rounded border border-neutral-300 dark:border-neutral-700"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 break-all font-mono max-w-md">{pix.payload}</p>
            </div>
          )}
          {pixError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{pixError}</p>}
        </div>
      )}

      {order.galleryCode && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Fotos Selecionadas</p>
          {galleryLoading ? (
            <p className="text-xs text-neutral-500">Carregando...</p>
          ) : selectedPhotos.length === 0 ? (
            <p className="text-xs text-neutral-500">Nenhuma foto selecionada ainda.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedPhotos.map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.title}
                  title={p.title}
                  className="aspect-square w-full object-cover rounded border border-neutral-300 dark:border-neutral-700"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
