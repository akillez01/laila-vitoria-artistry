import { AlertCircle, ArrowLeft, FolderPlus, Images, Pencil, Plus, Star, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { api, ApiError, apiUpload } from '../lib/api';
import { Album, AlbumImage } from '../types';

const errMsg = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

const inputClass =
  'w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500';
const primaryBtn =
  'flex items-center justify-center gap-1.5 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all disabled:opacity-50';
const secondaryBtn =
  'flex items-center justify-center gap-1.5 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:border-amber-500 transition-all disabled:opacity-50';

const ErrorBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
    <div>{children}</div>
  </div>
);

const ModalShell: React.FC<{ title: string; onClose: () => void; disableClose?: boolean; children: React.ReactNode }> = ({
  title,
  onClose,
  disableClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
    <div className="bg-white dark:bg-[#181a1d] rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        disabled={disableClose}
        className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
      <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

// ======================= Lista de álbuns =======================

export const AdminAlbumManager: React.FC = () => {
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);

  const loadAlbums = () => {
    api<{ albums: Album[] }>('/api/albums')
      .then(({ albums }) => setAlbums(albums))
      .catch((err) => setError(errMsg(err, 'Não foi possível carregar os álbuns.')));
  };

  useEffect(loadAlbums, []);

  if (openAlbumId) {
    return (
      <AdminAlbumDetail
        albumId={openAlbumId}
        onBack={() => {
          setOpenAlbumId(null);
          loadAlbums();
        }}
      />
    );
  }

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-5xl mx-auto mt-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">Álbuns</h2>
        <button onClick={() => setCreating(true)} className={primaryBtn}>
          <FolderPlus className="w-4 h-4" /> Novo Álbum
        </button>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {albums === null ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : albums.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum álbum ainda. Clique em “Novo Álbum” para criar o primeiro.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setOpenAlbumId(album.id)}
              className="text-left group bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:border-amber-500 transition-colors"
            >
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Images className="w-8 h-8 text-neutral-400" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{album.title}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {album.photoCount} {album.photoCount === 1 ? 'foto' : 'fotos'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {creating && (
        <AlbumFormModal
          onClose={() => setCreating(false)}
          onSaved={(album) => {
            setCreating(false);
            // Abre o álbum recém-criado já pedindo as fotos.
            setOpenAlbumId(album.id);
          }}
        />
      )}
    </main>
  );
};

// ======================= Criar / editar álbum =======================

const AlbumFormModal: React.FC<{
  existing?: Album;
  onClose: () => void;
  onSaved: (album: Album) => void;
}> = ({ existing, onClose, onSaved }) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { album } = existing
        ? await api<{ album: Album }>(`/api/admin/albums/${existing.id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description }),
          })
        : await api<{ album: Album }>('/api/admin/albums', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
          });
      onSaved(album);
    } catch (err) {
      setError(errMsg(err, 'Não foi possível salvar o álbum.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={existing ? 'Editar Álbum' : 'Novo Álbum'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          autoFocus
          placeholder="Nome do álbum (ex.: 50 anos Aragão)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Descrição (opcional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
        />
        {error && <ErrorBox>{error}</ErrorBox>}
        <button type="submit" disabled={saving || !title.trim()} className={`${primaryBtn} w-full py-3`}>
          {saving ? 'Salvando...' : existing ? 'Salvar Alterações' : 'Criar e adicionar fotos'}
        </button>
      </form>
    </ModalShell>
  );
};

// ======================= Dentro do álbum =======================

const AdminAlbumDetail: React.FC<{ albumId: string; onBack: () => void }> = ({ albumId, onBack }) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [images, setImages] = useState<AlbumImage[] | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(false);
  const [editingImage, setEditingImage] = useState<AlbumImage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<{ album: Album; images: AlbumImage[] }>(`/api/albums/${albumId}`)
      .then(({ album, images }) => {
        setAlbum(album);
        setImages(images);
        // Álbum vazio (recém-criado): já abre o envio de fotos.
        if (images.length === 0) setUploading(true);
      })
      .catch((err) => setError(errMsg(err, 'Não foi possível carregar o álbum.')));
  }, [albumId]);

  const coverId = album?.coverImageId && images?.some((i) => i.id === album.coverImageId) ? album.coverImageId : images?.[0]?.id;

  const setCover = async (imageId: string) => {
    setBusyId(imageId);
    setError('');
    try {
      const { album: updated } = await api<{ album: Album }>(`/api/admin/albums/${albumId}`, {
        method: 'PUT',
        body: JSON.stringify({ coverImageId: imageId }),
      });
      setAlbum(updated);
    } catch (err) {
      setError(errMsg(err, 'Não foi possível definir a capa.'));
    } finally {
      setBusyId(null);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!window.confirm('Remover esta foto do álbum?')) return;
    setBusyId(imageId);
    setError('');
    try {
      await api(`/api/admin/album-images/${imageId}`, { method: 'DELETE' });
      setImages((prev) => prev?.filter((i) => i.id !== imageId) || null);
      setAlbum((prev) => (prev && prev.coverImageId === imageId ? { ...prev, coverImageId: null } : prev));
    } catch (err) {
      setError(errMsg(err, 'Não foi possível remover a foto.'));
    } finally {
      setBusyId(null);
    }
  };

  const deleteAlbum = async () => {
    if (!album) return;
    if (!window.confirm(`Excluir o álbum “${album.title}” e todas as ${images?.length ?? 0} fotos dele?`)) return;
    try {
      await api(`/api/admin/albums/${albumId}`, { method: 'DELETE' });
      onBack();
    } catch (err) {
      setError(errMsg(err, 'Não foi possível excluir o álbum.'));
    }
  };

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-5xl mx-auto mt-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Todos os álbuns
      </button>

      {error && <ErrorBox>{error}</ErrorBox>}

      {!album || images === null ? (
        !error && <p className="text-sm text-neutral-500">Carregando...</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h2 className="font-playfair text-2xl font-bold text-neutral-900 dark:text-white break-words">{album.title}</h2>
              {album.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{album.description}</p>}
              <p className="text-xs text-neutral-500 mt-1">
                {images.length} {images.length === 1 ? 'foto' : 'fotos'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button onClick={() => setUploading(true)} className={primaryBtn}>
                <Plus className="w-4 h-4" /> Adicionar Fotos
              </button>
              <button onClick={() => setEditingAlbum(true)} className={secondaryBtn}>
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button onClick={deleteAlbum} className={`${secondaryBtn} hover:!border-red-500 hover:text-red-600`}>
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </div>
          </div>

          {images.length === 0 ? (
            <p className="text-sm text-neutral-500">Este álbum ainda não tem fotos.</p>
          ) : (
            <>
              <p className="text-xs text-neutral-500 mb-3">
                Toque na <Star className="inline w-3 h-3 -mt-0.5" /> de uma foto para usá-la como capa do álbum.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => {
                  const isCover = image.id === coverId;
                  return (
                    <div
                      key={image.id}
                      className={`relative group bg-white dark:bg-[#181a1d] border rounded-lg overflow-hidden ${
                        isCover ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      <div className="aspect-square bg-neutral-200 dark:bg-neutral-800">
                        <img src={image.url} alt={image.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      {isCover && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-neutral-950 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                          Capa
                        </span>
                      )}
                      {image.title && (
                        <p className="p-2 text-xs font-semibold text-neutral-900 dark:text-white truncate">{image.title}</p>
                      )}
                      {/* Botões sempre visíveis no celular, no hover no desktop */}
                      <div className="absolute top-2 right-2 flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {!isCover && (
                          <button
                            onClick={() => setCover(image.id)}
                            disabled={busyId === image.id}
                            className="bg-black/70 text-white p-1.5 rounded-full hover:bg-amber-500 hover:text-neutral-950 disabled:opacity-50"
                            title="Usar como capa"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingImage(image)}
                          className="bg-black/70 text-white p-1.5 rounded-full hover:bg-neutral-700"
                          title="Editar foto"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          disabled={busyId === image.id}
                          className="bg-black/70 text-white p-1.5 rounded-full hover:bg-red-600 disabled:opacity-50"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {uploading && album && (
        <AlbumUploadModal
          albumId={albumId}
          albumTitle={album.title}
          onClose={() => setUploading(false)}
          onAdded={(image) => {
            setImages((prev) => (prev ? [...prev, image] : [image]));
            // A primeira foto vira capa no servidor; reflete aqui também.
            setAlbum((prev) => (prev && !prev.coverImageId ? { ...prev, coverImageId: image.id } : prev));
          }}
        />
      )}

      {editingAlbum && album && (
        <AlbumFormModal
          existing={album}
          onClose={() => setEditingAlbum(false)}
          onSaved={(updated) => {
            setAlbum(updated);
            setEditingAlbum(false);
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

// ======================= Enviar várias fotos =======================

// Cada arquivo é enviado ao R2 e vira uma foto do álbum, em sequência,
// para manter a ordem escolhida e não sobrecarregar a conexão.
const AlbumUploadModal: React.FC<{
  albumId: string;
  albumTitle: string;
  onClose: () => void;
  onAdded: (image: AlbumImage) => void;
}> = ({ albumId, albumTitle, onClose, onAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState<string[]>([]);

  const busy = progress !== null;

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from<File>(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;
    setFailed([]);
    const errors: string[] = [];
    const remaining: File[] = [];
    setProgress({ done: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { url } = await apiUpload<{ url: string }>('/api/admin/albums/upload', file);
        const { image } = await api<{ image: AlbumImage }>(`/api/admin/albums/${albumId}/images`, {
          method: 'POST',
          body: JSON.stringify({ url }),
        });
        onAdded(image);
      } catch (err) {
        errors.push(`${file.name}: ${errMsg(err, 'falha no envio')}`);
        remaining.push(file);
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setProgress(null);
    if (errors.length) {
      // Mantém só as que falharam, para tentar de novo.
      setFiles(remaining);
      setFailed(errors);
    } else {
      onClose();
    }
  };

  return (
    <ModalShell title={`Adicionar fotos — ${albumTitle}`} onClose={onClose} disableClose={busy}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md py-6 text-sm text-neutral-600 dark:text-neutral-400 hover:border-amber-500 transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {files.length ? 'Escolher mais fotos' : 'Escolher fotos (pode selecionar várias)'}
        </button>

        {files.length > 0 && (
          <>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {files.length} {files.length === 1 ? 'foto selecionada' : 'fotos selecionadas'}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative aspect-square rounded overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <img src={src} alt={files[i]?.name} className="w-full h-full object-cover" />
                  {!busy && (
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/70 text-white p-0.5 rounded-full hover:bg-red-600"
                      title="Tirar da seleção"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {progress && (
          <div>
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Enviando {Math.min(progress.done + 1, progress.total)} de {progress.total}...
            </p>
          </div>
        )}

        {failed.length > 0 && (
          <ErrorBox>
            <p className="font-semibold">Algumas fotos não foram enviadas (as outras já estão no álbum):</p>
            <ul className="list-disc ml-4">
              {failed.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </ErrorBox>
        )}

        <button type="submit" disabled={busy || !files.length} className={`${primaryBtn} w-full py-3`}>
          {busy
            ? 'Enviando...'
            : failed.length
              ? 'Tentar novamente'
              : `Enviar ${files.length > 1 ? `${files.length} fotos` : 'foto'}`}
        </button>
      </form>
    </ModalShell>
  );
};

// ======================= Editar uma foto =======================

const AlbumImageModal: React.FC<{
  existing: AlbumImage;
  onClose: () => void;
  onSaved: (image: AlbumImage) => void;
}> = ({ existing, onClose, onSaved }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(existing.url);
  const [title, setTitle] = useState(existing.title);
  const [description, setDescription] = useState(existing.description);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await apiUpload<{ url: string }>('/api/admin/albums/upload', file);
      setImageUrl(url);
    } catch (err) {
      setError(errMsg(err, 'Falha ao enviar arquivo.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { image } = await api<{ image: AlbumImage }>(`/api/admin/album-images/${existing.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, url: imageUrl, description }),
      });
      onSaved(image);
    } catch (err) {
      setError(errMsg(err, 'Não foi possível salvar.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Editar Foto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md py-4 text-xs text-neutral-600 dark:text-neutral-400 hover:border-amber-500 transition-colors disabled:opacity-50"
        >
          <img src={imageUrl} alt="Prévia" className="h-24 object-cover rounded" />
          {uploading ? 'Enviando...' : 'Trocar imagem'}
        </button>
        <input type="text" placeholder="Legenda (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        <textarea
          placeholder="Descrição (opcional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
        />
        {error && <ErrorBox>{error}</ErrorBox>}
        <button type="submit" disabled={saving || uploading} className={`${primaryBtn} w-full py-3`}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </ModalShell>
  );
};
