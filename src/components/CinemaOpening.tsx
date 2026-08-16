import { ArrowRight } from 'lucide-react';
import React from 'react';
import { cinemaData } from '../data/cinemaData';
import { HERO_IMAGE_URL } from '../data/photographyData';

interface CinemaOpeningProps {
  onExplore: () => void;
}

export const CinemaOpening: React.FC<CinemaOpeningProps> = ({ onExplore }) => {
  return (
    <section className="cine-root" data-cine-fallback={HERO_IMAGE_URL}>
      <div className="cine-sticky">
        <canvas className="cine-canvas" aria-hidden="true" />

        <div className="cine-overlay max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16">
          <div className="max-w-2xl" data-motion="reveal">
            <p className="cine-kicker">{cinemaData.kicker}</p>
            <h1 className="cine-title">{cinemaData.title}</h1>
            <p className="cine-line">{cinemaData.l1}</p>
            <p className="cine-line">{cinemaData.l2}</p>
            <p className="cine-line">{cinemaData.l3}</p>

            <button
              onClick={onExplore}
              className="mt-6 inline-flex items-center gap-2.5 px-5 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-[0.18em] transition-all uppercase shadow-md"
            >
              Explorar Portfólio <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="cine-hud" aria-hidden="true">
            <span id="hudAto">ATO I</span>
            <span id="hudPct">0%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
