import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Instagram, Link as LinkIcon, MessageCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { ABOUT_PORTRAIT_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_LINK } from '../data/photographyData';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface AboutSectionProps {
  onOpenImageModal: (url: string, title: string) => void;
  onOpenContact: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenImageModal, onOpenContact }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useGSAP(() => {
    const root = sectionRef.current;
    if (!root) return;

    const title = root.querySelector<HTMLElement>('.editorial-about__copy h2');
    const portrait = root.querySelector<HTMLElement>('.editorial-about__portrait');
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (title) gsap.fromTo(title, { y: 20, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 78%', once: true },
      });
      if (portrait) gsap.fromTo(portrait, { y: 26, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: portrait, start: 'top 86%', once: true },
      });
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section className="editorial-about" id="about" ref={sectionRef} aria-labelledby="about-title">
      <div className="editorial-about__inner">
        <div className="editorial-about__copy">
          <h2 id="about-title">Histórias que ficam.</h2>
          <p>
            Layla Vitória fotografa retratos, celebrações e manifestações culturais. Seu olhar acompanha a energia dos encontros e a identidade de quem os vive.
          </p>
          {showFullBio && (
            <div className="editorial-about__extra">
              <p>
                Com base em Manaus, Layla trabalha entre a fotografia de pessoas e o registro de eventos. Em cada projeto, busca imagens que preservem a atmosfera e os detalhes daquele momento.
              </p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                Acompanhe o trabalho de {INSTAGRAM_HANDLE} <ArrowUpRight aria-hidden="true" size={17} />
              </a>
            </div>
          )}
          <div className="editorial-about__actions">
            <button className="editorial-button editorial-button--primary" onClick={() => setShowFullBio((visible) => !visible)}>
              {showFullBio ? 'Ler menos' : 'Conheça Layla'}
            </button>
            <button className="editorial-text-link" onClick={onOpenContact}>Solicitar um orçamento <ArrowUpRight aria-hidden="true" size={17} /></button>
          </div>
          <div className="editorial-about__socials">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><Instagram aria-hidden="true" size={17} /> Instagram</a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" size={17} /> WhatsApp</a>
          </div>
        </div>
        <figure className="editorial-about__portrait">
          <img src={ABOUT_PORTRAIT_URL} alt="Layla Vitória, fotógrafa em Manaus" loading="lazy" />
          <figcaption>Layla Vitória <span>Fotógrafa · Manaus, AM</span></figcaption>
          <button
            onClick={() => onOpenImageModal(ABOUT_PORTRAIT_URL, 'Layla Vitória, fotógrafa em Manaus')}
            aria-label="Abrir link direto do retrato de Layla Vitória"
          >
            <LinkIcon aria-hidden="true" size={17} />
          </button>
        </figure>
      </div>
    </section>
  );
};
