import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, X, AlertCircle, Copy, Check, ChevronLeft, Heart, Pencil } from 'lucide-react';
import { ClientGallery, Package } from '../types';
import { api, apiUpload, ApiError } from '../lib/api';

interface AdminGalleriesManagerProps {
  initialCode?: string | null;
}

export const AdminGalleriesManager: React.FC<AdminGalleriesManagerProps> = ({ initialCode }) => {
  const [galleries, setGalleries] = useState<ClientGallery[] | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(initialCode || null);

  useEffect(() => {
    if (initialCode) setActiveCode(initialCode);
  }, [initialCode]);

  const loadGalleries = () => {
    api<{ galleries: ClientGallery[] }>('/api/admin/galleries')
      .then(({ galleries }) => setGalleries(galleries))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as galerias.'));
  };

  useEffect(() => {
    loadGalleries();
  }, []);

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Remover a galeria "${code}" e todas as suas fotos?`)) return;
    try {
      await api(`/api/admin/galleries/${encodeURIComponent(code)}`, { method: 'DELETE' });
      setGalleries((prev) => prev?.filter((g) => g.code !== code) || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover a galeria.');
    }
  };

  if (activeCode) {
    const gallery = galleries?.find((g) => g.code === activeCode);
    if (gallery) {
      return (
        <GalleryDetail
          gallery={gallery}
          onBack={() => setActiveCode(null)}
          onUpdated={(updated) =>
            setGalleries((prev) => prev?.map((g) => (g.code === updated.code ? updated : g)) || null)
          }
        />
      );
    }
  }

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">Galerias de Clientes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Galeria
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {galleries === null ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : galleries.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma galeria criada ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {galleries.map((gallery) => {
            const selectedCount = gallery.photos.filter((p) => p.selected).length;
            return (
              <div
                key={gallery.code}
                className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                  {gallery.coverImage && (
                    <img src={gallery.coverImage} alt={gallery.clientName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {gallery.clientName} — {gallery.eventType}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Código: <span className="font-mono font-bold">{gallery.code}</span> · {gallery.photos.length} fotos ·{' '}
                    {selectedCount} selecionadas
                    {gallery.selectionSubmittedAt && ' · seleção enviada'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {gallery.packageName ? `Pacote: ${gallery.packageName}` : 'Sem pacote vinculado'}
                    {(gallery.extraPhotoPriceCents || 0) > 0 &&
                      ` · Foto extra: ${((gallery.extraPhotoPriceCents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                  </p>
                </div>
                <button
                  onClick={() => setActiveCode(gallery.code)}
                  className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                >
                  Gerenciar
                </button>
                <button
                  onClick={() => handleDelete(gallery.code)}
                  className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                  title="Remover galeria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <CreateGalleryModal
          onClose={() => setShowForm(false)}
          onCreated={(gallery) => {
            setGalleries((prev) => (prev ? [gallery, ...prev] : [gallery]));
            setShowForm(false);
          }}
        />
      )}
    </main>
  );
};

const CreateGalleryModal: React.FC<{ onClose: () => void; onCreated: (gallery: ClientGallery) => void }> = ({
  onClose,
  onCreated,
}) => {
  const [accessMode, setAccessMode] = useState<'code' | 'email'>('code');
  const [code, setCode] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxSelections, setMaxSelections] = useState(10);
  const [driveLink, setDriveLink] = useState('');
  const [packageId, setPackageId] = useState<number | ''>('');
  const [extraPhotoPrice, setExtraPhotoPrice] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ packages: Package[] }>('/api/admin/packages')
      .then(({ packages }) => setPackages(packages))
      .catch(() => setPackages([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { gallery } = await api<{ gallery: ClientGallery }>('/api/admin/galleries', {
        method: 'POST',
        body: JSON.stringify({
          code: code || undefined,
          clientName,
          eventType,
          eventDate,
          maxSelections,
          driveLink: driveLink || undefined,
          packageId: packageId || undefined,
          extraPhotoPriceCents: extraPhotoPrice ? Math.round(Number(extraPhotoPrice) * 100) : 0,
          accessMode,
          clientEmail: accessMode === 'email' ? clientEmail : undefined,
        }),
      });
      onCreated(gallery);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a galeria.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-4">Nova Galeria de Cliente</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-md text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setAccessMode('code')}
              className={`flex-1 px-3 py-2 rounded transition-colors ${
                accessMode === 'code'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Código (paga)
            </button>
            <button
              type="button"
              onClick={() => setAccessMode('email')}
              className={`flex-1 px-3 py-2 rounded transition-colors ${
                accessMode === 'email'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              E-mail (gratuita)
            </button>
          </div>

          {accessMode === 'email' && (
            <input
              type="email"
              required
              placeholder="E-mail do cliente"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          )}

          <input
            type="text"
            required={accessMode === 'code'}
            placeholder={
              accessMode === 'code'
                ? 'Código de acesso (ex: CASAMENTO-2026)'
                : 'Código interno (opcional, gerado automaticamente)'
            }
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 uppercase"
          />
          <input
            type="text"
            required
            placeholder="Nome do cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            required
            placeholder="Tipo de evento (ex: Casamento Fine Art)"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            required
            placeholder="Data do evento (ex: 18 de Maio, 2026)"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-600 dark:text-neutral-400">Máximo de fotos selecionáveis</label>
            <input
              type="number"
              min={1}
              required
              value={maxSelections}
              onChange={(e) => setMaxSelections(Number(e.target.value))}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <input
            type="url"
            placeholder="Link do Google Drive (opcional)"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />

          <div className="flex flex-col gap-1 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              Pacote vinculado (define o valor do pagamento)
            </label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Nenhum pacote (definir só valor por foto)</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {(pkg.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-600 dark:text-neutral-400">
              Valor por foto extra (R$, além do limite de seleção)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0,00"
              value={extraPhotoPrice}
              onChange={(e) => setExtraPhotoPrice(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
          >
            {saving ? 'Criando...' : 'Criar Galeria'}
          </button>
        </form>
      </div>
    </div>
  );
};

const GalleryDetail: React.FC<{
  gallery: ClientGallery;
  onBack: () => void;
  onUpdated: (gallery: ClientGallery) => void;
}> = ({ gallery, onBack, onUpdated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const { url } = await apiUpload<{ url: string }>(
          `/api/admin/galleries/${encodeURIComponent(gallery.code)}/upload`,
          file
        );
        const { gallery: updated } = await api<{ gallery: ClientGallery }>(
          `/api/admin/galleries/${encodeURIComponent(gallery.code)}/photos`,
          { method: 'POST', body: JSON.stringify({ url, title: file.name.replace(/\.[^.]+$/, '') }) }
        );
        onUpdated(updated);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao enviar imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await api(`/api/admin/galleries/${encodeURIComponent(gallery.code)}/photos/${photoId}`, { method: 'DELETE' });
      onUpdated({ ...gallery, photos: gallery.photos.filter((p) => p.id !== photoId) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover a foto.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gallery.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-amber-400 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar às Galerias
      </button>

      <div className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">
            {gallery.clientName} — {gallery.eventType}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{gallery.eventDate}</p>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-4 py-2.5 rounded-md text-sm font-bold"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {gallery.accessMode === 'email' ? `E-mail: ${gallery.clientEmail}` : `Código: ${gallery.code}`}
        </button>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        {gallery.accessMode === 'email'
          ? 'Galeria gratuita — avise a cliente que ela pode acessar em "Área Exclusiva do Cliente" no site, na aba "Recebi uma galeria gratuita", digitando esse e-mail.'
          : 'Compartilhe esse código com a cliente — ela acessa em "Área Exclusiva do Cliente" no site, escolhe as fotos e finaliza o pagamento por lá.'}
      </p>

      <div className="bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
        <div className="text-sm text-neutral-700 dark:text-neutral-300">
          {gallery.packageName ? (
            <>
              Pacote: <strong>{gallery.packageName}</strong> (
              {((gallery.packagePriceCents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              , inclui até {gallery.maxSelections} fotos)
            </>
          ) : (
            'Sem pacote vinculado'
          )}
          {(gallery.extraPhotoPriceCents || 0) > 0 && (
            <>
              {' '}
              · Foto extra:{' '}
              {((gallery.extraPhotoPriceCents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </>
          )}
        </div>
        <button
          onClick={() => setShowPricingModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md py-6 text-sm text-neutral-600 dark:text-neutral-400 hover:border-amber-500 transition-colors disabled:opacity-50 mb-6"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Enviando...' : 'Adicionar fotos a esta galeria'}
      </button>

      {gallery.photos.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma foto nesta galeria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
              </div>
              {photo.selected && (
                <span className="absolute top-2 left-2 bg-rose-600 text-white p-1 rounded-full">
                  <Heart className="w-3 h-3 fill-white" />
                </span>
              )}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remover foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="p-2">
                <p className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPricingModal && (
        <EditPricingModal
          gallery={gallery}
          onClose={() => setShowPricingModal(false)}
          onUpdated={(updated) => {
            onUpdated(updated);
            setShowPricingModal(false);
          }}
        />
      )}
    </main>
  );
};

const EditPricingModal: React.FC<{
  gallery: ClientGallery;
  onClose: () => void;
  onUpdated: (gallery: ClientGallery) => void;
}> = ({ gallery, onClose, onUpdated }) => {
  const [accessMode, setAccessMode] = useState<'code' | 'email'>(gallery.accessMode);
  const [clientEmail, setClientEmail] = useState(gallery.clientEmail || '');
  const [packageId, setPackageId] = useState<number | ''>(gallery.packageId || '');
  const [extraPhotoPrice, setExtraPhotoPrice] = useState(
    gallery.extraPhotoPriceCents ? (gallery.extraPhotoPriceCents / 100).toString() : ''
  );
  const [maxSelections, setMaxSelections] = useState(gallery.maxSelections);
  const [packages, setPackages] = useState<Package[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ packages: Package[] }>('/api/admin/packages')
      .then(({ packages }) => setPackages(packages))
      .catch(() => setPackages([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { gallery: updated } = await api<{ gallery: ClientGallery }>(
        `/api/admin/galleries/${encodeURIComponent(gallery.code)}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            packageId: packageId || null,
            extraPhotoPriceCents: extraPhotoPrice ? Math.round(Number(extraPhotoPrice) * 100) : 0,
            maxSelections,
            accessMode,
            clientEmail: accessMode === 'email' ? clientEmail : gallery.clientEmail || '',
          }),
        }
      );
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-4">Acesso, Pacote & Preço</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-md text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setAccessMode('code')}
              className={`flex-1 px-3 py-2 rounded transition-colors ${
                accessMode === 'code'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Código (paga)
            </button>
            <button
              type="button"
              onClick={() => setAccessMode('email')}
              className={`flex-1 px-3 py-2 rounded transition-colors ${
                accessMode === 'email'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              E-mail (gratuita)
            </button>
          </div>

          {accessMode === 'email' && (
            <input
              type="email"
              required
              placeholder="E-mail do cliente"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          )}

          <div className="flex flex-col gap-1 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">Máximo de fotos incluídas</label>
            <input
              type="number"
              min={0}
              value={maxSelections}
              onChange={(e) => setMaxSelections(Number(e.target.value))}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-600 dark:text-neutral-400">Pacote vinculado</label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Nenhum pacote</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {(pkg.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-600 dark:text-neutral-400">Valor por foto extra (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={extraPhotoPrice}
              onChange={(e) => setExtraPhotoPrice(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
};
