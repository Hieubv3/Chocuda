import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  right?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, badge, right }) => (
  <section className="px-3 sm:px-6 lg:px-8 pt-3">
    <div className="max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-[#16284e] border border-ink-700/50 shadow-xl px-5 py-4 sm:px-7 sm:py-5">
        <div className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            {badge && (
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/30 rounded-full px-2.5 py-0.5 mb-1.5">
                {badge}
              </span>
            )}
            <h1 className="text-white font-black text-lg sm:text-2xl tracking-tight uppercase">{title}</h1>
            {subtitle && <p className="text-ink-300 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>
    </div>
  </section>
);
