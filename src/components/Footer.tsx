import React from 'react';
import { Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_LINK, WHATSAPP_PHONE } from '../data/photographyData';

interface FooterProps {
  onNavigate: (view: 'portfolio' | 'profile') => void;
  onOpenContact: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenContact, onScrollToSection }) => {
  return (
    <footer className="bg-white dark:bg-[#121315] w-full border-t border-neutral-200 dark:border-neutral-800 mt-auto transition-colors duration-300">
      <div className="w-full py-12 px-5 sm:px-8 md:px-16 flex flex-col lg:flex-row justify-between items-start lg:items-center max-w-[1440px] mx-auto gap-8">
        {/* Left: Address & Contact */}
        <div className="text-sm text-neutral-600 dark:text-neutral-400 order-3 lg:order-1 flex flex-col gap-2 max-w-md">
          <p className="font-bold text-neutral-900 dark:text-white">© 2024 Layla Vitória Artistry • Fotografia Autoral</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-1.5 leading-relaxed">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
            Rua Francisco Nobre Pontes, 04, Quadra 26 - Planalto, CEP: 69044-110, Manaus - AM
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 font-medium">
            <a href="mailto:laaylalopezz@gmail.com" className="hover:text-neutral-900 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" /> laaylalopezz@gmail.com
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Phone className="w-3.5 h-3.5" /> {WHATSAPP_PHONE}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Instagram className="w-3.5 h-3.5" /> {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>

        {/* Center: Brand Logo / Name */}
        <div className="order-1 lg:order-2 flex flex-col items-start lg:items-center gap-1">
          <button
            onClick={() => {
              onNavigate('portfolio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:scale-105 transition-transform group text-left"
          >
            <BrandLogo variant="full" size="lg" />
          </button>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-amber-600 dark:text-amber-400">
            Fotografia Autoral • Manaus, AM
          </span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 order-2 lg:order-3 text-xs uppercase font-bold tracking-widest text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => {
              onNavigate('portfolio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-neutral-900 dark:hover:text-amber-400 transition-colors"
          >
            Início
          </button>
          <button
            onClick={onOpenContact}
            className="hover:text-neutral-900 dark:hover:text-amber-400 transition-colors"
          >
            Contato
          </button>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            Instagram
          </a>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            WhatsApp
          </a>
          <button
            onClick={() => onNavigate('profile')}
            className="hover:text-neutral-900 dark:hover:text-amber-400 transition-colors text-amber-600 dark:text-amber-400"
          >
            Painel Admin
          </button>
        </div>
      </div>
    </footer>
  );
};

