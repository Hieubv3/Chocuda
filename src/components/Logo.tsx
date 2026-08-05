import React from 'react';
import logoImg from '../assets/images/chocudan24h_custom_logo_1785384117746.jpg';

interface LogoProps {
  variant?: 'header' | 'footer' | 'auth' | 'large' | 'mobile';
  className?: string;
  onClick?: () => void;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'header',
  className = '',
  onClick,
}) => {
  if (variant === 'header') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 select-none ${className}`}
        title="Chợ Cư Dân 24H Vinhomes - Trang chủ"
      >
        <div className="relative h-9 sm:h-10 w-auto flex items-center justify-center p-0.5 rounded-lg bg-white shadow-xs border border-slate-100 group-hover:scale-[1.02] transition-transform duration-200 overflow-hidden shrink-0">
          <img 
            src={logoImg} 
            alt="Logo Chợ Cư Dân 24H Vinhomes" 
            referrerPolicy="no-referrer"
            className="h-full w-auto object-contain"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm md:text-base uppercase tracking-tight leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            CHỢ CƯ DÂN <span className="text-emerald-600 dark:text-emerald-400">24H</span>
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
            BĐS VINHOMES
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-3 cursor-pointer group shrink-0 select-none ${className}`}
        title="Chợ Cư Dân 24H Vinhomes"
      >
        <div className="relative h-14 sm:h-16 w-auto flex items-center justify-center p-1.5 rounded-xl bg-white shadow-md group-hover:scale-[1.02] transition-transform overflow-hidden shrink-0">
          <img 
            src={logoImg} 
            alt="Logo Chợ Cư Dân 24H Vinhomes" 
            referrerPolicy="no-referrer"
            className="h-full w-auto object-contain"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-black text-white text-base sm:text-lg uppercase tracking-tight leading-none">
            CHỢ CƯ DÂN <span className="text-emerald-400">24H</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
            Bất Động Sản Vinhomes
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'auth') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative h-20 sm:h-24 md:h-28 w-auto p-2 rounded-2xl bg-white shadow-lg mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
          <img 
            src={logoImg} 
            alt="Logo Chợ Cư Dân 24H Vinhomes" 
            referrerPolicy="no-referrer"
            className="h-full w-auto object-contain"
          />
        </div>
      </div>
    );
  }

  // Large variant for Hero / Welcome Banner / Seeding
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-28 sm:h-36 md:h-40 w-auto p-2.5 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex items-center justify-center shrink-0">
        <img 
          src={logoImg} 
          alt="Logo Chợ Cư Dân 24H Vinhomes" 
          referrerPolicy="no-referrer"
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
};


