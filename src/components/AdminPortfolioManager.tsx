import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, Plus, AlertCircle, X, Video as VideoIcon } from 'lucide-react';
import { PhotoItem } from '../types';
import { api, apiUpload, ApiError } from '../lib/api';

const CATEGORIES = ['casamentos', 'retratos', 'moda', 'cultura', 'esporte', 'aniversarios', 'eventos'];

export const AdminPortfolioManager: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[] | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadPhotos = () => {
    api<{ photos: PhotoItem[] }>('/api/portfolio')
      .then(({ photos }) => setPhotos(photos))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o portfólio.'));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover esta foto do portfólio?')) return;
    try {
      await api(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
      setPhotos((prev) => prev?.filter((p) => p.id !== id) || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover a foto.');
    }
  };

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">Fotos do Portfólio</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Adicionar Foto
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {photos === null ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma foto no portfólio ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 relative">
                {photo.mediaType === 'video' ? (
                  <>
                    <video src={photo.url} muted preload="metadata" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/70 text-white p-1 rounded-full">
                      <VideoIcon className="w-3 h-3" />
                    </div>
                  </>
                ) : (
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{photo.title}</p>
                <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">{photo.category}</p>
                {photo.credit && (
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{photo.credit}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remover foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddPhotoModal
          onClose={() => setShowForm(false)}
          onCreated={(photo) => {
            setPhotos((prev) => (prev ? [...prev, photo] : [photo]));
            setShowForm(false);
          }}
        />
      )}
    </main>
  );
};

const AddPhotoModal: React.FC<{ onClose: () => void; onCreated: (photo: PhotoItem) => void }> = ({
  onClose,
  onCreated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('casamentos');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [credit, setCredit] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await apiUpload<{ url: string }>('/api/admin/portfolio/upload', file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError(mediaType === 'video' ? 'Envie um vídeo primeiro.' : 'Envie uma imagem primeiro.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { photo } = await api<{ photo: PhotoItem }>('/api/admin/portfolio', {
        method: 'POST',
        body: JSON.stringify({ title, category, url: imageUrl, description, location, date, mediaType, credit }),
      });
      onCreated(photo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
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

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Adicionar {mediaType === 'video' ? 'Vídeo' : 'Foto'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-md text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setMediaType('photo');
                setImageUrl('');
              }}
              className={`flex-1 px-3 py-2 rounded transition-colors ${
                mediaType === 'photo'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Foto
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaType('video');
                setImageUrl('');
              }}
              className={`flex-1 px-3 py-2 rounded transition-colors ${
                mediaType === 'video'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Vídeo
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={mediaType === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/*'}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md py-6 text-sm text-neutral-600 dark:text-neutral-400 hover:border-amber-500 transition-colors disabled:opacity-50"
          >
            {imageUrl ? (
              mediaType === 'video' ? (
                <video src={imageUrl} controls className="h-24 object-contain rounded" />
              ) : (
                <img src={imageUrl} alt="Preview" className="h-20 object-cover rounded" />
              )
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {uploading ? 'Enviando...' : mediaType === 'video' ? 'Selecionar vídeo (máx. 250MB)' : 'Selecionar imagem'}
              </>
            )}
          </button>

          <input
            type="text"
            required
            placeholder={mediaType === 'video' ? 'Título do vídeo' : 'Título da foto'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />

          {mediaType === 'video' && (
            <input
              type="text"
              placeholder="Créditos (ex: Vídeo por Raiane)"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          )}

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Descrição (opcional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
          />

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Local (opcional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-1/2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Data (opcional)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-1/2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
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
            disabled={saving || uploading || !imageUrl}
            className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Foto'}
          </button>
        </form>
      </div>
    </div>
  );
};
