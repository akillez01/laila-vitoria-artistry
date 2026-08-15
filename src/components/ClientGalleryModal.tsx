import React, { useEffect, useState } from 'react';
import { Heart, Check, Link as LinkIcon, X, FolderOpen, Send, AlertCircle, CreditCard, Download, Share2 } from 'lucide-react';
import { ClientGallery } from '../types';
import { api, ApiError } from '../lib/api';
import { PaymentOptions } from './PaymentOptions';

interface ClientGalleryModalProps {
  gallery: ClientGallery;
  onClose: () => void;
  onOpenImageModal: (url: string, title: string) => void;
  initialOrderId?: number | null;
}

export const ClientGalleryModal: React.FC<ClientGalleryModalProps> = ({
  gallery,
  onClose,
  onOpenImageModal,
  initialOrderId,
}) => {
  const [photos, setPhotos] = useState(gallery.photos);
  const [showFinalizeModal, setShowFinalizeModal] = useState(!!initialOrderId);
  const [orderId, setOrderId] = useState<number | null>(initialOrderId || null);

  const extraPhotoPriceCents = gallery.extraPhotoPriceCents || 0;
  const selectedCount = photos.filter((p) => p.selected).length;
  const hasPricing = !!gallery.packageId || extraPhotoPriceCents > 0;
  const extraCount = Math.max(0, selectedCount - gallery.maxSelections);
  const estimatedTotalCents = (gallery.packagePriceCents || 0) + extraCount * extraPhotoPriceCents;

  const toggleSelect = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-md flex flex-col justify-between overflow-y-auto animate-fadeIn">
      {/* Top Bar */}
      <div className="bg-[#1a1c1c] text-white px-6 py-4 flex items-center justify-between border-b border-[#444748] sticky top-0 z-20">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#c6c6c7] block">
            {gallery.accessMode === 'email' ? 'Galeria Gratuita' : `Galeria Privada • ${gallery.code}`}
          </span>
          <h2 className="font-playfair text-xl md:text-2xl font-normal text-white">
            {gallery.clientName} — {gallery.eventType}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#2f3131] px-3 py-1.5 rounded text-xs">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>
              <strong>{selectedCount}</strong> de {gallery.maxSelections} selecionadas
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#c6c6c7] hover:text-white hover:bg-[#2f3131] rounded-full transition-colors"
            title="Fechar Galeria"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Gallery Info Header */}
        <div className="bg-[#1c1b1b] text-white p-6 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#444748]">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#858383]">
              Data do Evento: {gallery.eventDate}
            </span>
            <p className="text-sm text-[#e5e2e1]">
              Clique no coração para selecionar as fotos que farão parte do seu álbum físico impresso.
            </p>
            {hasPricing && (
              <p className="text-xs text-amber-300">
                {gallery.packageName && <>Pacote: <strong>{gallery.packageName}</strong> ({formatPrice(gallery.packagePriceCents || 0)}, inclui até {gallery.maxSelections} fotos). </>}
                {extraCount > 0 && (
                  <>{extraCount} foto(s) extra a {formatPrice(extraPhotoPriceCents)} cada. </>
                )}
                Total estimado: <strong>{formatPrice(estimatedTotalCents)}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {gallery.driveLink && (
              <a
                href={gallery.driveLink}
                target="_blank"
                rel="noreferrer"
                className="bg-[#2f3131] hover:bg-[#444748] text-white text-xs px-4 py-2.5 rounded font-medium flex items-center gap-2 transition-colors border border-[#747878]/50"
              >
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>Abrir no Google Drive</span>
              </a>
            )}

            {orderId ? (
              <span className="bg-emerald-900/60 text-emerald-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2">
                <Check className="w-4 h-4" /> Seleção enviada
              </span>
            ) : (
              <button
                onClick={() => setShowFinalizeModal(true)}
                disabled={selectedCount === 0}
                className="bg-[#ffffff] text-black hover:bg-[#e2e2e2] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Finalizar Seleção {hasPricing ? '& Pagar' : ''}</span>
              </button>
            )}

            {orderId && (
              <button
                onClick={() => setShowFinalizeModal(true)}
                className="bg-amber-500 text-neutral-950 hover:bg-amber-400 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Ver pagamento
              </button>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`group bg-[#1c1b1b] rounded overflow-hidden border transition-all duration-300 flex flex-col ${
                photo.selected
                  ? 'border-rose-500/80 ring-2 ring-rose-500/30'
                  : 'border-[#444748]'
              }`}
            >
              <div className="aspect-[4/3] w-full bg-black relative overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Heart Select Button Overlay */}
                <button
                  onClick={() => toggleSelect(photo.id)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full transition-transform active:scale-95 shadow-md ${
                    photo.selected
                      ? 'bg-rose-600 text-white'
                      : 'bg-black/60 text-white/80 hover:bg-black hover:text-white'
                  }`}
                  title={photo.selected ? 'Desmarcar Foto' : 'Marcar como Favorita'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      photo.selected ? 'fill-white text-white' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                <div>
                  <h4 className="font-playfair text-base text-white">{photo.title}</h4>
                  {photo.note && (
                    <p className="text-xs text-rose-300/90 italic mt-1">"{photo.note}"</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#2f3131] flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleSelect(photo.id)}
                    className={`flex items-center gap-1.5 font-medium ${
                      photo.selected ? 'text-rose-400' : 'text-[#c6c6c7] hover:text-white'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${photo.selected ? 'opacity-100' : 'opacity-40'}`} />
                    <span>{photo.selected ? 'Selecionada' : 'Selecionar'}</span>
                  </button>

                  <button
                    onClick={() => onOpenImageModal(photo.url, photo.title)}
                    className="text-[11px] text-[#c6c6c7] hover:text-white flex items-center gap-1 bg-[#2f3131] px-2.5 py-1 rounded transition-colors"
                    title="Obter Link Direto da Imagem em alta resolução"
                  >
                    <LinkIcon className="w-3 h-3" /> Link Direto
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="bg-[#1a1c1c] text-white px-6 py-4 border-t border-[#444748] sticky bottom-0 z-20 flex justify-between items-center">
        <span className="text-xs text-[#c6c6c7]">
          Seleção: <strong>{selectedCount}</strong> fotos marcadas
          {hasPricing && <> · Total estimado: <strong>{formatPrice(estimatedTotalCents)}</strong></>}
        </span>
        <button
          onClick={onClose}
          className="bg-white text-black px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors"
        >
          Voltar ao Portfolio
        </button>
      </div>

      {showFinalizeModal && (
        <FinalizeAndPayModal
          gallery={gallery}
          photos={photos}
          orderId={orderId}
          hasPricing={hasPricing}
          estimatedTotalCents={estimatedTotalCents}
          onClose={() => setShowFinalizeModal(false)}
          onFinalized={(id) => setOrderId(id)}
        />
      )}
    </div>
  );
};

const FinalizeAndPayModal: React.FC<{
  gallery: ClientGallery;
  photos: ClientGallery['photos'];
  orderId: number | null;
  hasPricing: boolean;
  estimatedTotalCents: number;
  onClose: () => void;
  onFinalized: (orderId: number) => void;
}> = ({ gallery, photos, orderId, hasPricing, estimatedTotalCents, onClose, onFinalized }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const { order } = await api<{ order: { status: string } }>(`/api/orders/${orderId}`);
        if (cancelled) return;
        setOrderStatus(order.status);
        if (order.status === 'pending') {
          timer = setTimeout(poll, 6000);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, 6000);
      }
    };
    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  const handleShare = async () => {
    const shareData = {
      title: 'Laila Vitória Artistry',
      text: `Confira minhas fotos do ensaio "${gallery.eventType}" com a Laila Vitória!`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // usuário cancelou o compartilhamento
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (hasPricing) {
        const data = await api<{ orderId: number }>(`/api/galleries/${encodeURIComponent(gallery.code)}/checkout`, {
          method: 'POST',
          body: JSON.stringify({
            photos: photos.map((p) => ({ id: p.id, selected: p.selected, note: p.note })),
            clientEmail: email,
            clientPhone: phone || undefined,
          }),
        });
        onFinalized(data.orderId);
      } else {
        await api(`/api/galleries/${encodeURIComponent(gallery.code)}/selection`, {
          method: 'PATCH',
          body: JSON.stringify({
            photos: photos.map((p) => ({ id: p.id, selected: p.selected, note: p.note })),
          }),
        });
        onClose();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar sua seleção agora.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-1">
          {orderId ? (orderStatus === 'approved' ? 'Pagamento Confirmado' : 'Pagamento') : 'Finalizar Seleção'}
        </h3>

        {orderId ? (
          orderStatus === 'approved' ? (
            <div className="space-y-3 mt-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Seu pagamento foi confirmado! Suas fotos em alta resolução já estão prontas para download.
              </p>
              <a
                href={`/api/orders/${orderId}/download`}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all rounded-md"
              >
                <Download className="w-4 h-4" /> Baixar minhas fotos (.zip)
              </a>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                {shareCopied ? 'Link copiado!' : 'Compartilhar'}
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                Aguardando confirmação do pagamento...
              </p>
              <PaymentOptions orderId={orderId} />
            </>
          )
        ) : (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {hasPricing
                ? `Total a pagar: ${formatPrice(estimatedTotalCents)}. Informe seu email para receber a confirmação.`
                : 'Confirma o envio da sua seleção de fotos para a fotógrafa?'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {hasPricing && (
                <>
                  <input
                    type="email"
                    required
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (opcional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : hasPricing ? 'Continuar para Pagamento' : 'Confirmar Seleção'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
