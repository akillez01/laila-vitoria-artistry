import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, Plus, AlertCircle, X, Video } from 'lucide-react';
import { InstagramPost } from '../types';
import { api, apiUpload, ApiError } from '../lib/api';

export const AdminInstagramManager: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[] | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadPosts = () => {
    api<{ posts: InstagramPost[] }>('/api/instagram')
      .then(({ posts }) => setPosts(posts))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os posts.'));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este post da grade do Instagram?')) return;
    try {
      await api(`/api/admin/instagram/${id}`, { method: 'DELETE' });
      setPosts((prev) => prev?.filter((p) => p.id !== id) || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover o post.');
    }
  };

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">Grade do Instagram</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Fotos e vídeos curtos exibidos na seção "Instagram" do site. Suba manualmente os mesmos posts que você
            publica lá.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Adicionar Post
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {posts === null ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum post cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative group bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 relative">
                {post.mediaType === 'video' ? (
                  <>
                    <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                    <span className="absolute top-1.5 left-1.5 bg-black/70 text-white p-1 rounded-full">
                      <Video className="w-3 h-3" />
                    </span>
                  </>
                ) : (
                  <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
                )}
              </div>
              {post.caption && (
                <div className="p-2">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2">{post.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(post.id)}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remover post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddInstagramPostModal
          onClose={() => setShowForm(false)}
          onCreated={(post) => {
            setPosts((prev) => (prev ? [...prev, post] : [post]));
            setShowForm(false);
          }}
        />
      )}
    </main>
  );
};

const AddInstagramPostModal: React.FC<{ onClose: () => void; onCreated: (post: InstagramPost) => void }> = ({
  onClose,
  onCreated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [permalink, setPermalink] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url, mediaType: uploadedType } = await apiUpload<{ url: string; mediaType: 'image' | 'video' }>(
        '/api/admin/instagram/upload',
        file
      );
      setMediaUrl(url);
      setMediaType(uploadedType);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      setError('Envie uma foto ou vídeo primeiro.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { post } = await api<{ post: InstagramPost }>('/api/admin/instagram', {
        method: 'POST',
        body: JSON.stringify({ mediaUrl, mediaType, caption, permalink }),
      });
      onCreated(post);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o post.');
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

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-4">Adicionar Post</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md py-6 text-sm text-neutral-600 dark:text-neutral-400 hover:border-amber-500 transition-colors disabled:opacity-50"
          >
            {mediaUrl ? (
              mediaType === 'video' ? (
                <video src={mediaUrl} className="h-20 object-cover rounded" muted />
              ) : (
                <img src={mediaUrl} alt="Preview" className="h-20 object-cover rounded" />
              )
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {uploading ? 'Enviando...' : 'Selecionar foto ou vídeo curto'}
              </>
            )}
          </button>

          <textarea
            placeholder="Legenda (opcional)"
            rows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
          />

          <input
            type="url"
            placeholder="Link do post real no Instagram (opcional)"
            value={permalink}
            onChange={(e) => setPermalink(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || uploading || !mediaUrl}
            className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Post'}
          </button>
        </form>
      </div>
    </div>
  );
};
