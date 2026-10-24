import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Camera, Link as LinkIcon, Play, Video as VideoIcon, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_PORTFOLIO, resolvePortfolioImageUrl } from '../data/photographyData';
import { api } from '../lib/api';
import { PhotoItem } from '../types';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface PortfolioGalleryProps {
  onOpenImageModal: (url: string, title: string) => void;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ onOpenImageModal }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<'fotos' | 'videos'>('fotos');
  const [activeCategory, setActiveCategory] = useState<'todos' | PhotoItem['category']>('todos');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PhotoItem | null>(null);
  const [remotePhotos, setRemotePhotos] = useState<PhotoItem[] | null>(null);
  const [unavailablePhotos, setUnavailablePhotos] = useState<Set<string>>(() => new Set());
  const [unavailableVideos, setUnavailableVideos] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    api<{ photos: PhotoItem[] }>('/api/portfolio')
      .then(({ photos }) => setRemotePhotos(photos))
      .catch(() => setRemotePhotos([]));
  }, []);

  const realPhotoItems = (remotePhotos ?? []).filter((photo) => photo.mediaType !== 'video');
  const videoItems = (remotePhotos ?? []).filter((photo) => photo.mediaType === 'video');
  const allPhotos = useMemo(
    () => (realPhotoItems.length > 0 ? realPhotoItems : INITIAL_PORTFOLIO).map((photo) => ({
      ...photo,
      url: resolvePortfolioImageUrl(photo.url),
    })),
    [remotePhotos],
  );
  const categories = useMemo(
    () => Array.from(new Set(allPhotos.map((photo) => photo.category))),
    [allPhotos],
  );
  const filteredPhotos = activeCategory === 'todos'
    ? allPhotos
    : allPhotos.filter((photo) => photo.category === activeCategory);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      sectionRef.current?.querySelectorAll<HTMLElement>('.portfolio-work').forEach((work) => {
        gsap.fromTo(work, { y: 22, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: work, start: 'top 88%', once: true },
        });
      });
    });
    return () => media.revert();
  }, { scope: sectionRef, dependencies: [tab, activeCategory, allPhotos.length], revertOnUpdate: true });

  const photoForDetail = selectedPhoto
    ? { ...selectedPhoto, url: resolvePortfolioImageUrl(selectedPhoto.url) }
    : null;

  return (
    <section className="portfolio-gallery" id="portfolio" ref={sectionRef} aria-labelledby="portfolio-title">
      <div className="portfolio-gallery__heading">
        <h2 id="portfolio-title">Fotografias para lembrar</h2>
        <p>Festivais, retratos e celebrações vistos de perto.</p>
      </div>

      <div className="portfolio-gallery__toolbar">
        <div className="portfolio-gallery__tabs" role="tablist" aria-label="Tipo de obra">
          <button
            id="photos-tab"
            role="tab"
            aria-selected={tab === 'fotos'}
            aria-controls="photos-panel"
            onClick={() => setTab('fotos')}
          >
            Fotografias
          </button>
          <button
            id="videos-tab"
            role="tab"
            aria-selected={tab === 'videos'}
            aria-controls="videos-panel"
            onClick={() => setTab('videos')}
          >
            <VideoIcon aria-hidden="true" size={17} /> Vídeos
            {videoItems.length > 0 && <span>({videoItems.length})</span>}
          </button>
        </div>

        {tab === 'fotos' && categories.length > 1 && (
          <div className="portfolio-gallery__filters" aria-label="Filtrar por categoria">
            <button className={activeCategory === 'todos' ? 'is-active' : ''} onClick={() => setActiveCategory('todos')}>
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? 'is-active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'cultura' ? 'Cultura' : category}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'fotos' ? (
        <div id="photos-panel" role="tabpanel" aria-labelledby="photos-tab">
          {filteredPhotos.length === 0 ? (
            <p className="portfolio-gallery__empty">Nenhuma fotografia publicada nesta categoria.</p>
          ) : (
            <div className="portfolio-gallery__grid">
              {filteredPhotos.map((photo, index) => (
                <figure className={`portfolio-work portfolio-work--${index % 6}`} key={photo.id}>
                  <button
                    className="portfolio-work__image"
                    onClick={() => setSelectedPhoto(photo)}
                    aria-label={`Ver detalhes: ${photo.title}`}
                    disabled={unavailablePhotos.has(photo.id)}
                  >
                    {unavailablePhotos.has(photo.id) ? (
                      <span className="portfolio-video-unavailable" role="img" aria-label={`Fotografia indisponível: ${photo.title}`}>
                        Fotografia indisponível no momento
                      </span>
                    ) : (
                      <img
                        src={photo.url}
                        alt={photo.title}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        onError={() => setUnavailablePhotos((current) => new Set(current).add(photo.id))}
                      />
                    )}
                    {!unavailablePhotos.has(photo.id) && (
                      <span className="portfolio-work__open"><ArrowUpRight aria-hidden="true" size={19} /></span>
                    )}
                  </button>
                  <figcaption className="portfolio-work__caption">
                    <span>{photo.title}</span>
                    <button
                      onClick={() => onOpenImageModal(photo.url, photo.title)}
                      aria-label={`Link direto: ${photo.title}`}
                      disabled={unavailablePhotos.has(photo.id)}
                    >
                      <LinkIcon aria-hidden="true" size={16} />
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div id="videos-panel" role="tabpanel" aria-labelledby="videos-tab" className="portfolio-gallery__video-panel">
          {videoItems.length === 0 ? (
            <p className="portfolio-gallery__empty">Nenhum vídeo publicado ainda.</p>
          ) : (
            <div className="portfolio-gallery__grid portfolio-gallery__grid--videos">
              {videoItems.map((video, index) => (
                <figure className="portfolio-work portfolio-work--video" key={video.id}>
                  <button className="portfolio-work__image" onClick={() => setSelectedVideo(video)} aria-label={`Reproduzir: ${video.title}`}>
                    {unavailableVideos.has(video.id) ? (
                      <span className="portfolio-video-unavailable">Prévia indisponível no momento</span>
                    ) : (
                      <video
                        src={video.url}
                        muted
                        playsInline
                        preload="metadata"
                        onError={() => setUnavailableVideos((current) => new Set(current).add(video.id))}
                      />
                    )}
                    {!unavailableVideos.has(video.id) && <span className="portfolio-work__play"><Play aria-hidden="true" fill="currentColor" size={21} /></span>}
                  </button>
                  <figcaption className="portfolio-work__caption"><span>{video.title}</span></figcaption>
                  {video.credit && <p className="portfolio-work__credit">{video.credit}</p>}
                </figure>
              ))}
            </div>
          )}
        </div>
      )}

      {photoForDetail && (
        <div className="portfolio-dialog__backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedPhoto(null)}>
          <section className="portfolio-dialog" role="dialog" aria-modal="true" aria-labelledby="photo-dialog-title">
            <header className="portfolio-dialog__header">
              <h3 id="photo-dialog-title">{photoForDetail.title}</h3>
              <button onClick={() => setSelectedPhoto(null)} aria-label="Fechar detalhes"><X aria-hidden="true" size={22} /></button>
            </header>
            <div className="portfolio-dialog__body">
              <img src={photoForDetail.url} alt={photoForDetail.title} />
              {photoForDetail.description && <p>{photoForDetail.description}</p>}
              <dl className="portfolio-dialog__facts">
                {photoForDetail.location && <div><dt>Local</dt><dd>{photoForDetail.location}</dd></div>}
                {photoForDetail.date && <div><dt>Data</dt><dd>{photoForDetail.date}</dd></div>}
                <div><dt>Categoria</dt><dd>{photoForDetail.category}</dd></div>
              </dl>
              {photoForDetail.cameraInfo && (
                <p className="portfolio-dialog__camera"><Camera aria-hidden="true" size={17} />
                  {[photoForDetail.cameraInfo.camera, photoForDetail.cameraInfo.lens, photoForDetail.cameraInfo.aperture]
                    .filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <footer className="portfolio-dialog__footer">
              <button className="editorial-button editorial-button--primary" onClick={() => {
                onOpenImageModal(photoForDetail.url, photoForDetail.title);
                setSelectedPhoto(null);
              }}>
                Abrir link da imagem <LinkIcon aria-hidden="true" size={17} />
              </button>
              <button className="editorial-text-link" onClick={() => setSelectedPhoto(null)}>Fechar</button>
            </footer>
          </section>
        </div>
      )}

      {selectedVideo && (
        <div className="portfolio-dialog__backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedVideo(null)}>
          <section className="portfolio-dialog" role="dialog" aria-modal="true" aria-labelledby="video-dialog-title">
            <header className="portfolio-dialog__header">
              <h3 id="video-dialog-title">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} aria-label="Fechar vídeo"><X aria-hidden="true" size={22} /></button>
            </header>
            <div className="portfolio-dialog__body">
              {unavailableVideos.has(selectedVideo.id) ? (
                <p className="portfolio-video-unavailable">Este vídeo não está disponível para reprodução no momento.</p>
              ) : (
                <video
                  src={selectedVideo.url}
                  controls
                  autoPlay
                  playsInline
                  onError={() => setUnavailableVideos((current) => new Set(current).add(selectedVideo.id))}
                />
              )}
              {selectedVideo.description && <p>{selectedVideo.description}</p>}
              {selectedVideo.credit && <p className="portfolio-work__credit">{selectedVideo.credit}</p>}
            </div>
            <footer className="portfolio-dialog__footer">
              <button className="editorial-text-link" onClick={() => setSelectedVideo(null)}>Fechar vídeo</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
};
