import React from 'react';
import LogoPng from '../assets/img/Logo.optimized.png';
import LogoWebp from '../assets/img/Logo.optimized.webp';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'badge' | 'banner';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  const logoAlt = 'Layla Vitória Logo';

  // Sizing definitions mapped to image height
  const sizes = {
    sm: 'h-8 sm:h-10',
    md: 'h-12 sm:h-16',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-32 md:h-40',
  };

  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-3 bg-neutral-950 p-2 px-3.5 rounded-full border border-emerald-400 shadow-md ${className}`}>
        <picture>
          <source srcSet={LogoWebp} type="image/webp" />
          <img src={LogoPng} alt={logoAlt} className="h-8 object-contain rounded-xl overflow-hidden" />
        </picture>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`relative bg-neutral-950 rounded-xl p-8 sm:p-12 shadow-xl text-center flex flex-col items-center justify-center ${className}`}>
        <picture>
          <source srcSet={LogoWebp} type="image/webp" />
          <img src={LogoPng} alt={logoAlt} className="h-32 sm:h-48 md:h-64 object-contain rounded-xl overflow-hidden drop-shadow-sm" />
        </picture>
        {showTagline && (
          <p className="mt-4 text-xs sm:text-sm font-bold tracking-[0.3em] text-emerald-300 uppercase bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40">
            Fotografia Autoral • Festivais • Casamentos • Manaus
          </p>
        )}
      </div>
    );
  }

  // Full default variant or icon
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <picture>
        <source srcSet={LogoWebp} type="image/webp" />
        <img src={LogoPng} alt={logoAlt} className={`${sizes[size]} object-contain rounded-xl overflow-hidden shadow-sm`} />
      </picture>
    </div>
  );
};


