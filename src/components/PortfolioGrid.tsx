import { ArrowUpRight, Camera, Eye, Link as LinkIcon, Play, Video as VideoIcon, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  FASHION_COVER_URL,
  INITIAL_PORTFOLIO,
  PORTRAIT_COVER_URL,
  WEDDING_COVER_URL,
} from '../data/photographyData';
import { api } from '../lib/api';
import { PhotoItem } from '../types';

interface PortfolioGridProps {
  onOpenImageModal: (url: string, title: string) => void;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ onOpenImageModal }) => {
  const [tab, setTab] = useState<'fotos' | 'videos'>('fotos');
  const [activeCategory, setActiveCategory] = useState<'todos' | 'festivais' | 'retratos' | 'moda'>('todos');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PhotoItem | null>(null);
  const [remotePhotos, setRemotePhotos] = useState<PhotoItem[] | null>(null);

  useEffect(() => {
    api<{ photos: PhotoItem[] }>('/api/portfolio')
      .then(({ photos }) => setRemotePhotos(photos))
      .catch(() => setRemotePhotos([]));
  }, []);

  const realPhotoItems = (remotePhotos || []).filter((p) => p.mediaType !== 'video');
  const videoItems = (remotePhotos || []).filter((p) => p.mediaType === 'video');
  const allPhotos = realPhotoItems.length > 0 ? realPhotoItems : INITIAL_PORTFOLIO;

  const findCover = (category: string, fallback: string) =>
    allPhotos.find((p) => p.category === category)?.url || fallback;
  const weddingCoverUrl = findCover('festivais', WEDDING_COVER_URL);
  const portraitCoverUrl = findCover('retratos', PORTRAIT_COVER_URL);
  const fashionCoverUrl = findCover('moda', FASHION_COVER_URL);

  const filteredPhotos = activeCategory === 'todos'
    ? allPhotos
    : allPhotos.filter(p => p.category === activeCategory);

  return (
    <section className="max-w-[1440px] mx-auto px-5 md:px-16 py-16 border-t border-[#c4c7c7]/30" id="portfolio" data-motion="reveal">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#747878] dark:text-neutral-400 font-medium block mb-1">
            Galerias & Categorias
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl text-[#1a1c1c] dark:text-white font-normal">
            Obras Curadas
          </h2>
        </div>

        {/* Top-level tabs: Fotos / Vídeos */}
        <div className="flex items-center gap-1 bg-[#eeeeee] dark:bg-neutral-900 p-1 rounded-sm">
          <button
            onClick={() => setTab('fotos')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors rounded-sm ${tab === 'fotos'
              ? 'bg-white dark:bg-neutral-800 text-[#000000] dark:text-white shadow-sm'
              : 'text-[#5e5e5e] hover:text-[#000000] dark:hover:text-white'
              }`}
          >
            Fotos
          </button>
          <button
            onClick={() => setTab('videos')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors rounded-sm flex items-center gap-1.5 ${tab === 'videos'
              ? 'bg-white dark:bg-neutral-800 text-[#000000] dark:text-white shadow-sm'
              : 'text-[#5e5e5e] hover:text-[#000000] dark:hover:text-white'
              }`}
          >
            <VideoIcon className="w-3.5 h-3.5" /> Vídeos
            {videoItems.length > 0 && <span className="text-[10px] opacity-70">({videoItems.length})</span>}
          </button>
        </div>
      </div>

      {tab === 'fotos' && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div />
            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory('todos')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-sm ${activeCategory === 'todos'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#eeeeee] text-[#5e5e5e] hover:bg-[#e2e2e2] hover:text-[#000000]'
                  }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveCategory('festivais')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-sm ${activeCategory === 'festivais'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#eeeeee] text-[#5e5e5e] hover:bg-[#e2e2e2] hover:text-[#000000]'
                  }`}
              >
                Festivais
              </button>
              <button
                onClick={() => setActiveCategory('retratos')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-sm ${activeCategory === 'retratos'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#eeeeee] text-[#5e5e5e] hover:bg-[#e2e2e2] hover:text-[#000000]'
                  }`}
              >
                Retratos
              </button>
              <button
                onClick={() => setActiveCategory('moda')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-sm ${activeCategory === 'moda'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#eeeeee] text-[#5e5e5e] hover:bg-[#e2e2e2] hover:text-[#000000]'
                  }`}
              >
                Moda Editorial
              </button>
            </div>
          </div>

          {/* Main Asymmetric Bento View (When 'todos' selected) */}
          {activeCategory === 'todos' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Category 1: Festivais (Large) */}
              <div className="md:col-span-7 group block relative" data-motion="mask">
                <div
                  className="aspect-[4/3] w-full overflow-hidden bg-[#e2e2e2] rounded-sm mb-4 relative cursor-pointer"
                  onClick={() => setSelectedPhoto(allPhotos.find(p => p.category === 'festivais') || null)}
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    src={weddingCoverUrl}
                    alt="Festivais & Cultura"
                    data-motion="zoom"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhoto(allPhotos.find(p => p.category === 'festivais') || null);
                      }}
                      className="bg-white text-black px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow hover:bg-neutral-100"
                    >
                      <Eye className="w-4 h-4 inline mr-1" /> Ver Detalhes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenImageModal(weddingCoverUrl, 'Festivais & Cultura - Laila Vitória');
                      }}
                      className="bg-black/80 text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow hover:bg-black"
                    >
                      <LinkIcon className="w-4 h-4 inline mr-1" /> Link Direto
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1a1c1c] dark:text-white">
                      Festivais
                    </h3>
                    <p className="text-sm text-[#5e5e5e] dark:text-neutral-400 mt-1">Cores e ritmos em movimento.</p>
                  </div>
                  <button
                    onClick={() => onOpenImageModal(weddingCoverUrl, 'Festivais - Link Direto')}
                    className="text-xs text-[#747878] dark:text-neutral-400 hover:text-[#000000] dark:hover:text-white flex items-center gap-1"
                    title="Copiar URL direta da imagem"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Direct URL
                  </button>
                </div>
              </div>

              {/* Category 2: Portraits (Tall) */}
              <div className="md:col-span-5 group block md:-mt-8" data-motion="mask">
                <div
                  className="aspect-[3/4] w-full overflow-hidden bg-[#e2e2e2] rounded-sm mb-4 relative cursor-pointer"
                  onClick={() => setSelectedPhoto(allPhotos.find(p => p.category === 'retratos') || null)}
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    src={portraitCoverUrl}
                    alt="Retratos Autorais"
                    data-motion="zoom"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhoto(allPhotos.find(p => p.category === 'retratos') || null);
                      }}
                      className="bg-white text-black px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow hover:bg-neutral-100"
                    >
                      <Eye className="w-4 h-4 inline mr-1" /> Ver Detalhes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenImageModal(portraitCoverUrl, 'Retrato Autoral - Laila Vitória');
                      }}
                      className="bg-black/80 text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow hover:bg-black"
                    >
                      <LinkIcon className="w-4 h-4 inline mr-1" /> Link Direto
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1a1c1c] dark:text-white">
                      Retratos
                    </h3>
                    <p className="text-sm text-[#5e5e5e] dark:text-neutral-400 mt-1">A essência individual capturada.</p>
                  </div>
                  <button
                    onClick={() => onOpenImageModal(portraitCoverUrl, 'Retratos - Link Direto')}
                    className="text-xs text-[#747878] dark:text-neutral-400 hover:text-[#000000] dark:hover:text-white flex items-center gap-1"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Direct URL
                  </button>
                </div>
              </div>

              {/* Category 3: Fashion (Wide) */}
              <div className="md:col-span-12 group block mt-8" data-motion="mask">
                <div
                  className="aspect-[21/9] w-full overflow-hidden bg-[#e2e2e2] rounded-sm mb-4 relative cursor-pointer"
                  onClick={() => setSelectedPhoto(allPhotos.find(p => p.category === 'moda') || null)}
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out object-center"
                    src={fashionCoverUrl}
                    alt="Moda Editorial"
                    data-motion="zoom"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhoto(allPhotos.find(p => p.category === 'moda') || null);
                      }}
                      className="bg-white text-black px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow hover:bg-neutral-100"
                    >
                      <Eye className="w-4 h-4 inline mr-1" /> Ver Detalhes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenImageModal(fashionCoverUrl, 'Moda Editorial - Laila Vitória');
                      }}
                      className="bg-black/80 text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow hover:bg-black"
                    >
                      <LinkIcon className="w-4 h-4 inline mr-1" /> Link Direto
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1a1c1c] dark:text-white">
                      Moda Editorial
                    </h3>
                    <p className="text-sm text-[#5e5e5e] dark:text-neutral-400 mt-1">Conceitos visuais para marcas.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenImageModal(fashionCoverUrl, 'Moda Editorial - Link Direto')}
                      className="text-xs text-[#747878] dark:text-neutral-400 hover:text-[#000000] dark:hover:text-white flex items-center gap-1"
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Direct URL
                    </button>
                    <ArrowUpRight className="w-5 h-5 text-[#5e5e5e] dark:text-neutral-400 group-hover:text-[#000000] dark:group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Grid for Specific Filtered Category */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="group bg-white dark:bg-neutral-900 p-4 rounded border border-[#c4c7c7]/30 dark:border-neutral-800 shadow-xs flex flex-col">
                  <div
                    className="aspect-[4/3] w-full overflow-hidden bg-[#eeeeee] dark:bg-neutral-800 rounded-sm mb-3 relative cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-playfair text-lg text-[#1a1c1c] dark:text-white font-medium">{photo.title}</h4>
                  <p className="text-xs text-[#5e5e5e] dark:text-neutral-400 mt-1 line-clamp-2">{photo.description}</p>
                  {photo.cameraInfo && (
                    <div className="mt-3 pt-3 border-t border-[#eeeeee] dark:border-neutral-800 flex items-center justify-between text-[11px] text-[#747878] dark:text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" /> {photo.cameraInfo.camera} ({photo.cameraInfo.lens})
                      </span>
                      <span>{photo.cameraInfo.aperture}</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-[#eeeeee] dark:border-neutral-800">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="text-xs font-medium text-[#000000] dark:text-white hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detalhes da Fotografia
                    </button>
                    <button
                      onClick={() => onOpenImageModal(photo.url, photo.title)}
                      className="text-xs text-[#747878] dark:text-neutral-400 hover:text-[#000000] dark:hover:text-white flex items-center gap-1 bg-[#eeeeee] dark:bg-neutral-800 px-2.5 py-1 rounded"
                    >
                      <LinkIcon className="w-3 h-3" /> Link Direto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'videos' && (
        <div>
          {videoItems.length === 0 ? (
            <p className="text-sm text-[#5e5e5e] dark:text-neutral-400 py-8 text-center">
              Nenhum vídeo publicado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoItems.map((video) => (
                <div
                  key={video.id}
                  className="group bg-white dark:bg-neutral-900 p-4 rounded border border-[#c4c7c7]/30 dark:border-neutral-800 shadow-xs flex flex-col"
                >
                  <div
                    className="aspect-[4/3] w-full overflow-hidden bg-black rounded-sm mb-3 relative cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <video
                      src={video.url}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-playfair text-lg text-[#1a1c1c] dark:text-white font-medium">{video.title}</h4>
                  {video.description && (
                    <p className="text-xs text-[#5e5e5e] dark:text-neutral-400 mt-1 line-clamp-2">{video.description}</p>
                  )}
                  {video.credit && (
                    <p className="text-[11px] text-[#747878] dark:text-neutral-500 mt-2 uppercase tracking-wider">
                      {video.credit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'fotos' && (
        <section className="gal-h mt-16" data-motion="reveal">
          <div className="gal-pin">
            <div className="h-track">
              {allPhotos.slice(0, 6).map((photo) => (
                <article key={`h-${photo.id}`} className="h-panel group" data-motion="mask">
                  <div
                    className="h-media aspect-[16/10] overflow-hidden rounded-lg bg-[#e2e2e2] dark:bg-neutral-800 border border-[#c4c7c7]/40 dark:border-neutral-700 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                    data-cursor="view"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-3 px-1 flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium text-[#1a1c1c] dark:text-neutral-200 line-clamp-1">
                      {photo.title}
                    </p>
                    <button
                      onClick={() => onOpenImageModal(photo.url, photo.title)}
                      className="text-[11px] text-[#5e5e5e] dark:text-neutral-400 hover:text-black dark:hover:text-white"
                      data-cursor="link"
                    >
                      Link
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Details Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f9f9f9] dark:bg-[#181a1d] max-w-3xl w-full rounded-md shadow-2xl overflow-hidden border border-[#c4c7c7] dark:border-neutral-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#c4c7c7] dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
              <h3 className="font-playfair text-xl text-[#1a1c1c] dark:text-white">{selectedPhoto.title}</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-[#5e5e5e] dark:text-neutral-400 hover:text-black dark:hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              <div className="w-full aspect-[16/10] bg-black rounded overflow-hidden">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-[#e2e2e2] dark:border-neutral-800 space-y-3">
                <p className="text-sm text-[#1a1c1c] dark:text-neutral-200">{selectedPhoto.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#5e5e5e] dark:text-neutral-400 pt-2 border-t border-[#eeeeee] dark:border-neutral-800">
                  <div>
                    <span className="block text-[10px] text-[#747878] dark:text-neutral-500 uppercase">Local</span>
                    <span className="font-medium text-[#1a1c1c] dark:text-neutral-200">{selectedPhoto.location}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#747878] dark:text-neutral-500 uppercase">Data</span>
                    <span className="font-medium text-[#1a1c1c] dark:text-neutral-200">{selectedPhoto.date}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#747878] dark:text-neutral-500 uppercase">Categoria</span>
                    <span className="font-medium text-[#1a1c1c] dark:text-neutral-200 capitalize">{selectedPhoto.category}</span>
                  </div>
                </div>

                {selectedPhoto.cameraInfo && (
                  <div className="bg-[#f9f9f9] dark:bg-[#121315] p-3 rounded text-xs space-y-1 mt-2">
                    <span className="block text-[10px] font-semibold text-[#747878] dark:text-neutral-500 uppercase">Especificações Técnicas da Tomada</span>
                    <div className="grid grid-cols-2 gap-2 text-[#444748] dark:text-neutral-300">
                      <div>Câmera: {selectedPhoto.cameraInfo.camera}</div>
                      <div>Lente: {selectedPhoto.cameraInfo.lens}</div>
                      <div>Apertura: {selectedPhoto.cameraInfo.aperture}</div>
                      <div>Shutter: {selectedPhoto.cameraInfo.shutter}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 border-t border-[#c4c7c7] dark:border-neutral-800 flex justify-between items-center">
              <button
                onClick={() => {
                  onOpenImageModal(selectedPhoto.url, selectedPhoto.title);
                  setSelectedPhoto(null);
                }}
                className="bg-[#000000] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Copiar Link Direto da Imagem
              </button>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 text-xs uppercase font-medium text-[#5e5e5e] dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Details Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f9f9f9] dark:bg-[#181a1d] max-w-3xl w-full rounded-md shadow-2xl overflow-hidden border border-[#c4c7c7] dark:border-neutral-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#c4c7c7] dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
              <h3 className="font-playfair text-xl text-[#1a1c1c] dark:text-white">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-[#5e5e5e] dark:text-neutral-400 hover:text-black dark:hover:text-white font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              <div className="w-full aspect-[16/10] bg-black rounded overflow-hidden">
                <video
                  src={selectedVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {(selectedVideo.description || selectedVideo.credit) && (
                <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-[#e2e2e2] dark:border-neutral-800 space-y-2">
                  {selectedVideo.description && (
                    <p className="text-sm text-[#1a1c1c] dark:text-neutral-200">{selectedVideo.description}</p>
                  )}
                  {selectedVideo.credit && (
                    <p className="text-[11px] text-[#747878] dark:text-neutral-500 uppercase tracking-wider">
                      {selectedVideo.credit}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 border-t border-[#c4c7c7] dark:border-neutral-800 flex justify-end items-center">
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 text-xs uppercase font-medium text-[#5e5e5e] dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
