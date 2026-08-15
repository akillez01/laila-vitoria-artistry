import React, { useState } from 'react';
import { Sparkles, User, Menu, X, Lock, Sun, Moon, Instagram, MessageCircle, Compass } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { INSTAGRAM_URL, WHATSAPP_LINK } from '../data/photographyData';

interface NavbarProps {
  currentView: 'portfolio' | 'profile' | 'album';
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (view: 'portfolio' | 'profile' | 'album') => void;
  onOpenChat: () => void;
  onOpenContact: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  onOpenChat,
  onOpenContact,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#f9f9f9]/95 dark:bg-[#0f1012]/95 backdrop-blur-md w-full top-0 z-40 border-b border-[#c4c7c7]/30 dark:border-neutral-800 sticky transition-colors duration-300">
      <div className="flex justify-between items-center w-full px-4 sm:px-8 md:px-12 max-w-[1440px] mx-auto h-20">
        
        {/* Brand Logo & Name */}
        <button
          onClick={() => {
            onNavigate('portfolio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <BrandLogo variant="full" size="md" className="group-hover:scale-105 transition-transform" />
        </button>

        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <button
            onClick={() => {
              onNavigate('portfolio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`text-[10px] xl:text-xs font-bold uppercase tracking-widest pb-1 transition-all ${
              currentView === 'portfolio'
                ? 'text-neutral-900 dark:text-emerald-400 border-b-2 border-neutral-900 dark:border-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Início
          </button>

          <button
            onClick={() => {
              onNavigate('album');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`text-[10px] xl:text-xs font-bold uppercase tracking-widest pb-1 transition-all ${
              currentView === 'album'
                ? 'text-neutral-900 dark:text-emerald-400 border-b-2 border-neutral-900 dark:border-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Álbuns
          </button>

          <button
            onClick={() => {
              onNavigate('portfolio');
              onScrollToSection('about');
            }}
            className="text-[10px] xl:text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Sobre
          </button>

          <button
            onClick={() => {
              onNavigate('portfolio');
              onScrollToSection('client-access');
            }}
            className="text-[10px] xl:text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
            Clientes
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`text-[10px] xl:text-xs font-bold uppercase tracking-widest pb-1 transition-all flex items-center gap-1.5 ${
              currentView === 'profile'
                ? 'text-neutral-900 dark:text-emerald-400 border-b-2 border-neutral-900 dark:border-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
            Admin
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Instagram Link */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-700 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 bg-neutral-100 dark:bg-neutral-800/80 rounded-full border border-neutral-200 dark:border-neutral-700/80 transition-all hover:scale-105"
            title="Instagram @laylaavit"
          >
            <Instagram className="w-4 h-4 text-emerald-500" />
          </a>

          {/* WhatsApp Direct Link */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-full border border-emerald-200 dark:border-emerald-800/80 transition-all hover:scale-105"
            title="WhatsApp Direct (+55 92 8160-4462)"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-500/20 text-emerald-500" />
          </a>

          {/* Dark / Light Mode Switcher Button */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center justify-center p-2 sm:p-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-emerald-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
            title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar modo escuro"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* AI Consultant */}
          <button
            onClick={onOpenChat}
            className="hidden md:flex items-center gap-2 border border-neutral-300 dark:border-amber-500/40 hover:border-neutral-900 dark:hover:border-amber-400 text-neutral-900 dark:text-neutral-100 bg-white/50 dark:bg-neutral-900/60 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-md shadow-xs"
            title="Assistente de Curadoria Virtual"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Assistente IA</span>
          </button>

          {/* Contact CTA */}
          <button
            onClick={onOpenContact}
            className="bg-neutral-900 dark:bg-amber-500 hover:bg-neutral-800 dark:hover:bg-amber-400 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-md shadow-sm"
          >
            Contato
          </button>
        </div>

        {/* Mobile Menu & Quick Controls */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Quick Dark Mode Toggle on Mobile */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-700 dark:text-amber-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenChat}
            className="p-2 text-neutral-900 dark:text-amber-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full"
            title="Assistente IA"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#f9f9f9] dark:bg-[#121315] border-b border-neutral-300 dark:border-neutral-800 px-6 py-6 flex flex-col gap-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Navegação Principal
            </span>
            <button
              onClick={onToggleDarkMode}
              aria-label="Alternar tema"
              className="flex items-center justify-center p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-amber-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => {
              onNavigate('album');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left text-sm font-semibold uppercase tracking-wider py-2.5 text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800/60"
          >
            Álbuns Históricos
          </button>



          <button
            onClick={() => {
              onNavigate('portfolio');
              setMobileMenuOpen(false);
              onScrollToSection('portfolio');
            }}
            className="text-left text-sm font-semibold uppercase tracking-wider py-2.5 text-amber-600 dark:text-amber-400 border-b border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between"
          >
            <span>Festivais & Cultura da Amazônia</span>
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onNavigate('portfolio');
              setMobileMenuOpen(false);
              onScrollToSection('about');
            }}
            className="text-left text-sm font-semibold uppercase tracking-wider py-2.5 text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800/60"
          >
            Sobre a Fotógrafa Laila
          </button>

          <button
            onClick={() => {
              onNavigate('portfolio');
              setMobileMenuOpen(false);
              onScrollToSection('client-access');
            }}
            className="text-left text-sm font-semibold uppercase tracking-wider py-2.5 text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between"
          >
            <span>Área do Cliente (Seleção)</span>
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onNavigate('profile');
              setMobileMenuOpen(false);
            }}
            className="text-left text-sm font-semibold uppercase tracking-wider py-2.5 text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between"
          >
            <span>Perfil Admin / Configurações</span>
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onOpenChat();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 py-3 text-xs font-semibold uppercase tracking-wider rounded-md mt-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Consultora de Estilo Virtual</span>
          </button>

          <button
            onClick={() => {
              onOpenContact();
              setMobileMenuOpen(false);
            }}
            className="bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 py-3 text-xs font-bold uppercase tracking-wider rounded-md text-center shadow-md"
          >
            Entrar em Contato
          </button>
        </div>
      )}
    </nav>
  );
};

