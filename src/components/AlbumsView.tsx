import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ALBUM_IMAGES } from '../data/albumData';
import { api } from '../lib/api';
import { AlbumImage } from '../types';

interface AlbumsViewProps {
  onBack: () => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ onBack }) => {
  const [remoteImages, setRemoteImages] = useState<AlbumImage[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    api<{ images: AlbumImage[] }>('/api/albums')
      .then(({ images }) => setRemoteImages(images))
      .catch(() => setRemoteImages([]));
  }, []);

  const images = remoteImages && remoteImages.length > 0 ? remoteImages : ALBUM_IMAGES;

  return (
    <main className="min-h-screen bg-[#f9f9f9] dark:bg-[#0f1012] pt-8 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-emerald-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Portfólio
            </button>
            <h1 className="font-serif italic font-medium text-4xl sm:text-5xl text-neutral-900 dark:text-white">
              Álbuns & Inspirações
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400 max-w-2xl">
              Um acervo de registros autorais — de coberturas de dança, celebrações de 15 anos e procissões culturais — reunidos com o mesmo olhar sensível e editorial.
            </p>
          </div>
          <div className="hidden sm:flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="break-inside-avoid relative group overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => setLightboxIndex(index)}
              data-cursor="view"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                loading="lazy"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">
                  Registro Autoral
                </span>
                <h3 className="font-serif italic font-medium text-white text-xl md:text-2xl mb-1">
                  {image.title}
                </h3>
                <p className="text-white/80 text-sm line-clamp-2">
                  {image.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <AlbumLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </main>
  );
};

const AlbumLightbox: React.FC<{
  images: AlbumImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}> = ({ images, index, onClose, onNavigate }) => {
  const image = images[index];
  const goPrev = () => onNavigate((index - 1 + images.length) % images.length);
  const goNext = () => onNavigate((index + 1) % images.length);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.title}
          className="max-w-full max-h-[75vh] object-contain rounded-md shadow-2xl"
        />
        <div className="text-center px-4">
          <h3 className="font-serif italic font-medium text-white text-xl sm:text-2xl">{image.title}</h3>
          {image.description && (
            <p className="text-white/70 text-sm mt-1 max-w-2xl mx-auto">{image.description}</p>
          )}
          {images.length > 1 && (
            <p className="text-white/40 text-xs mt-3 uppercase tracking-widest">
              {index + 1} / {images.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
