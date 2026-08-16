import { AlertCircle, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { api, ApiError, apiUpload } from '../lib/api';
import { AlbumImage } from '../types';

export const AdminAlbumManager: React.FC = () => {
  const [images, setImages] = useState<AlbumImage[] | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<AlbumImage | null>(null);

  const loadImages = () => {
    api<{ images: AlbumImage[] }>('/api/albums')
      .then(({ images }) => setImages(images))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o álbum.'));
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover esta imagem do álbum?')) return;
    try {
      await api(`/api/admin/albums/${id}`, { method: 'DELETE' });
      setImages((prev) => prev?.filter((img) => img.id !== id) || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover a imagem.');
    }
  };

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">Imagens do Álbum</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Adicionar Imagem
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {images === null ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma imagem no álbum ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800">
                <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{image.title}</p>
                {image.description && (
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2">{image.description}</p>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingImage(image)}
                  className="bg-black/70 text-white p-1.5 rounded-full hover:bg-neutral-700"
                  title="Editar imagem"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="bg-black/70 text-white p-1.5 rounded-full hover:bg-red-600"
                  title="Remover imagem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AlbumImageModal
          onClose={() => setShowForm(false)}
          onSaved={(image) => {
            setImages((prev) => (prev ? [...prev, image] : [image]));
            setShowForm(false);
          }}
        />
      )}

      {editingImage && (
        <AlbumImageModal
          existing={editingImage}
          onClose={() => setEditingImage(null)}
          onSaved={(image) => {
            setImages((prev) => prev?.map((img) => (img.id === image.id ? image : img)) || null);
            setEditingImage(null);
          }}
        />
      )}
    </main>
  );
};

const AlbumImageModal: React.FC<{
  existing?: AlbumImage;
  onClose: () => void;
  onSaved: (image: AlbumImage) => void;
}> = ({ existing, onClose, onSaved }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(existing?.url || '');
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');

  const isEditing = !!existing;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await apiUpload<{ url: string }>('/api/admin/albums/upload', file);
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
      setError('Envie uma imagem primeiro.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { image } = isEditing
        ? await api<{ image: AlbumImage }>(`/api/admin/albums/${existing!.id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, url: imageUrl, description }),
          })
        : await api<{ image: AlbumImage }>('/api/admin/albums', {
            method: 'POST',
            body: JSON.stringify({ title, url: imageUrl, description }),
          });
      onSaved(image);
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
          {isEditing ? 'Editar Imagem' : 'Adicionar Imagem'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
              <img src={imageUrl} alt="Preview" className="h-20 object-cover rounded" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {uploading ? 'Enviando...' : 'Selecionar imagem'}
              </>
            )}
          </button>

          <input
            type="text"
            required
            placeholder="Título da imagem"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />

          <textarea
            placeholder="Descrição (opcional)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
          />

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
            {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Salvar Imagem'}
          </button>
        </form>
      </div>
    </div>
  );
};
