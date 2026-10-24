import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Instagram, Link as LinkIcon, MessageCircle } from 'lucide-react';
import React, { useRef } from 'react';
import {
    HERO_IMAGE_URL,
    INSTAGRAM_HANDLE,
    INSTAGRAM_URL,
    LAYLA_ACTION_BW_PHOTO,
    LAYLA_REAL_PHOTO,
    WHATSAPP_LINK,
} from '../data/photographyData';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface HeroProps {
  onExplore: () => void;
  onOpenImageModal: (url: string, title: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onOpenImageModal }) => {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const root = heroRef.current;
    if (!root) return;

    const frame = root.querySelector<HTMLElement>('.site-hero__photo--portrait-frame');
    const portrait = root.querySelector<HTMLElement>('.site-hero__portrait');
    const copy = Array.from(root.querySelectorAll<HTMLElement>('.site-hero__copy > *'));
    const secondaryPhotos = Array.from(root.querySelectorAll<HTMLElement>('.site-hero__photo--small, .site-hero__photo--wide'));
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (frame) intro.fromTo(frame, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power3.inOut' }, 0);
      if (portrait) {
        intro.fromTo(portrait, { scale: 1.08 }, { scale: 1, duration: 1.35, ease: 'power3.out' }, 0);
        gsap.to(portrait, {
          yPercent: -3,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
      if (copy.length) intro.fromTo(copy, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.09, ease: 'power3.out' }, 0.18);
      if (secondaryPhotos.length) intro.fromTo(secondaryPhotos, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12 }, 0.38);
    });

    return () => media.revert();
  }, { scope: heroRef });

  return (
    <section className="site-hero" ref={heroRef} aria-labelledby="home-title">
      <div className="site-hero__composition">
        <figure className="site-hero__photo site-hero__photo--small" aria-hidden="true">
          <img src={LAYLA_ACTION_BW_PHOTO} alt="Layla Vitória fotografando um espetáculo" loading="eager" />
        </figure>

        <div className="site-hero__copy">
          <h1 id="home-title">São João da Gente</h1>
          <p>Cultura, retratos e festivais amazônicos fotografados em Manaus por Layla Vitória.</p>
          <div className="site-hero__actions">
            <button className="editorial-button editorial-button--primary" onClick={onExplore}>
              Ver fotografias <ArrowRight aria-hidden="true" size={18} />
            </button>
            <a className="editorial-text-link" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" size={18} /> Falar pelo WhatsApp
            </a>
          </div>
        </div>

        <figure
          className="site-hero__photo site-hero__photo--portrait-frame"
          role="button"
          tabIndex={0}
          aria-label="Abrir fotografia em destaque"
          onClick={() => onOpenImageModal(HERO_IMAGE_URL, 'Dança e cultura amazônica em Manaus')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpenImageModal(HERO_IMAGE_URL, 'Dança e cultura amazônica em Manaus');
            }
          }}
        >
          <img
            className="site-hero__portrait"
            src={HERO_IMAGE_URL}
            alt="Apresentação de dança do Festival Folclórico de Manaus"
            fetchPriority="high"
          />
          <figcaption>Dança e cultura amazônica</figcaption>
        </figure>

        <figure className="site-hero__photo site-hero__photo--wide">
          <img src={LAYLA_REAL_PHOTO} alt="Retrato de Layla Vitória em Manaus" loading="eager" />
          <figcaption>Layla Vitória · Manaus</figcaption>
        </figure>

        <a className="site-hero__social" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          <Instagram aria-hidden="true" size={18} /> {INSTAGRAM_HANDLE}
        </a>
        <button
          className="site-hero__direct-link"
          onClick={() => onOpenImageModal(HERO_IMAGE_URL, 'Dança e cultura amazônica em Manaus')}
          aria-label="Abrir link direto da fotografia em destaque"
        >
          <LinkIcon aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  );
};

