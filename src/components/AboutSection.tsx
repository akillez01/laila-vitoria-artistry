import { Award, Instagram, Link as LinkIcon, MapPin, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { ABOUT_PORTRAIT_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_LINK } from '../data/photographyData';
import { BrandLogo } from './BrandLogo';

interface AboutSectionProps {
  onOpenImageModal: (url: string, title: string) => void;
  onOpenContact: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenImageModal, onOpenContact }) => {
  const [showFullBio, setShowFullBio] = useState(false);

  return (
    <section className="bg-white dark:bg-[#121315] py-16 md:py-24 border-y border-neutral-200 dark:border-neutral-800 transition-colors duration-300" id="about" data-motion="reveal">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Biography */}
          <div className="order-2 lg:order-1 flex flex-col justify-center" data-motion="reveal">
            <div className="mb-4">
              <BrandLogo variant="full" size="lg" />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
              Fotógrafa & Diretora Artística • Manaus, AM
            </span>

            <div className="space-y-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed">
              <p>
                Especialista em retratos autorais, casamentos de alto padrão e cobertura artística dos maiores festivais culturais do Amazonas e do Brasil.
              </p>
              <p>
                Com olhar refinado e paixão pela essência humana, Layla combina estética contemporânea e técnica apurada para capturar momentos repletos de verdade, espontaneidade e cores marcantes.
              </p>

              {showFullBio && (
                <div className="pt-4 space-y-4 text-sm text-neutral-700 dark:text-neutral-300 border-t border-neutral-200 dark:border-neutral-800 animate-fadeIn">
                  <p>
                    Com base em Manaus, atua em todo o Brasil e no exterior. Sua carreira traz ampla bagagem na documentação de tradições populares como o Festival Folclórico de Parintins, cirandas, danças folclóricas e eventos corporativos de grande porte.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2.5 p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <Award className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-neutral-900 dark:text-white">Premiações FineArt</p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Reconhecida nacionalmente</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-neutral-900 dark:text-white">Atendimento Global</p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Destination Wedding & Eventos</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="border-2 border-neutral-900 dark:border-emerald-400 text-neutral-900 dark:text-emerald-300 px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-900 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-neutral-950 transition-all rounded-md"
              >
                {showFullBio ? 'Recolher Biografia' : 'Ler Biografia Completa'}
              </button>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 hover:bg-neutral-800 text-white border border-emerald-500/50 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md shadow-md flex items-center gap-2"
              >
                <Instagram className="w-4 h-4 text-emerald-400" />
                <span>Instagram {INSTAGRAM_HANDLE}</span>
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md shadow-md flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>WhatsApp Direct</span>
              </a>
            </div>
          </div>

          {/* Right Column: Photographer Profile Image */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-6" data-motion="mask">
            <div className="w-full max-w-md aspect-[4/5] bg-neutral-950 rounded-xl overflow-hidden shadow-2xl relative group border-2 border-emerald-500/60">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                src={ABOUT_PORTRAIT_URL}
                alt="Fotógrafa Layla Vitória com sua Câmera Canon"
                referrerPolicy="no-referrer"
              />
              {/* Gradient & Badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div>
                  <p className="text-white font-serif italic font-bold text-xl drop-shadow-sm">Layla Vitória</p>
                  <p className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">Fotógrafa Oficial & Diretora</p>
                </div>

                <button
                  onClick={() => onOpenImageModal(ABOUT_PORTRAIT_URL, 'Retrato Oficial - Fotógrafa Layla Vitória')}
                  className="bg-neutral-950/90 hover:bg-black text-emerald-300 text-[11px] font-bold px-3 py-2 rounded-md flex items-center gap-1.5 backdrop-blur-md transition-colors border border-emerald-500/50 shadow-sm"
                  title="Copiar Link Direto da Foto de Perfil"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Direct Link
                </button>
              </div>
            </div>

            {/* Prominent Logo Badge showcase underneath profile photo */}
            <div className="w-full max-w-md bg-neutral-950 border-2 border-emerald-500/60 rounded-xl p-4 shadow-lg text-center flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-400 mb-2">
                Marca Registrada • Fotografia Autoral
              </span>
              <BrandLogo variant="full" size="md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

