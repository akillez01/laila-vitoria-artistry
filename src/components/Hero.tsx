import { ArrowRight, ExternalLink, Instagram, Link as LinkIcon, MessageCircle, Sparkles } from 'lucide-react';
import React from 'react';
import { HERO_IMAGE_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_LINK } from '../data/photographyData';
import { BrandLogo } from './BrandLogo';

interface HeroProps {
  onExplore: () => void;
  onOpenImageModal: (url: string, title: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onOpenImageModal }) => {
  return (
    <section className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16 py-10 md:py-20 transition-colors duration-300" data-motion="reveal">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Heading & Introduction */}
        <div className="lg:col-span-5 flex flex-col gap-5 z-10" data-motion="reveal">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-600 dark:text-emerald-400">
                Manaus • Amazônia
              </span>
            </div>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium hover:border-emerald-400 transition-all shadow-xs"
            >
              <Instagram className="w-3.5 h-3.5 text-emerald-400" />
              <span>{INSTAGRAM_HANDLE}</span>
            </a>
          </div>

          <div className="py-2">
            <BrandLogo variant="full" size="xl" />
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-emerald-700 dark:text-emerald-400 mt-2">
              Fotografia Autoral & Cultura Amazônica
            </p>
          </div>

          <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 font-normal max-w-md leading-relaxed">
            Fotografia autoral que eterniza o amor, a elegância e a vivacidade das tradições e festivais culturais da Amazônia com sensibilidade e arte refinada.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 text-xs font-bold tracking-[0.18em] transition-all uppercase shadow-md"
            >
              Explorar Portfolio <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-md border border-neutral-800 bg-neutral-900 text-emerald-300 text-xs font-bold tracking-wider hover:bg-neutral-800 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/30" />
              <span>WhatsApp Direct</span>
            </a>

            <button
              onClick={() => onOpenImageModal(HERO_IMAGE_URL, 'Obra Editorial Destaque - Raiane em São João da Gente')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors ml-auto sm:ml-0"
              title="Copiar Link Direto da Imagem Hero"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Link
            </button>
          </div>
        </div>

        {/* Right Column: Featured Image - Raiane Editorial Highlight */}
        <div className="lg:col-span-7 relative group" data-motion="mask">
          <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[3/2] w-full overflow-hidden bg-neutral-900 rounded-xl relative shadow-2xl border-2 border-emerald-500/50 transition-colors">
            <img
              className="js-parallax w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out cursor-pointer"
              src={HERO_IMAGE_URL}
              alt="Obra Editorial Destaque - Raiane em São João da Gente por Layla Vitória"
              onClick={() => onOpenImageModal(HERO_IMAGE_URL, 'Obra Editorial Destaque - Raiane em São João da Gente')}
              data-motion="zoom"
            />

            {/* Direct Link Hover Overlay */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenImageModal(HERO_IMAGE_URL, 'Obra Editorial Destaque - Raiane em São João da Gente');
                }}
                className="bg-neutral-950/90 hover:bg-black text-emerald-300 border border-emerald-500/50 px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link Direto</span>
              </button>
            </div>

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-neutral-950/90 backdrop-blur-md text-white p-3.5 rounded-lg border border-emerald-500/40 flex items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-extrabold tracking-wide text-white">Obra Editorial Destaque — Raiane</p>
                  <p className="text-[10px] text-emerald-300 font-medium">Espetáculo São João da Gente • Fotografia Autoral por Layla Vitória</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Glow */}
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/20 -z-10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

