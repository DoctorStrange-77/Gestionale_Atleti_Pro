import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

export interface KpiCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorTheme?: 'amber' | 'emerald' | 'blue' | 'purple' | 'red' | 'zinc';
  formula: string;
  formulaDescription: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  colorTheme = 'amber',
  formula,
  formulaDescription,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const themeClasses = {
    amber: 'border-amber-500/20 hover:border-amber-500/50 text-amber-400 bg-amber-500/10',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
    blue: 'border-blue-500/20 hover:border-blue-500/50 text-blue-400 bg-blue-500/10',
    purple: 'border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/10',
    red: 'border-red-500/20 hover:border-red-500/50 text-red-400 bg-red-500/10',
    zinc: 'border-zinc-700/50 hover:border-zinc-500 text-zinc-300 bg-zinc-800/50',
  };

  const iconBg = themeClasses[colorTheme] || themeClasses.amber;

  return (
    <div
      id={id}
      onClick={onClick}
      className="relative group p-4 bg-zinc-900 border border-zinc-800/90 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-visible"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider leading-snug">
            {title}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Tooltip trigger icon */}
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
            >
              <button
                type="button"
                className="p-1 text-zinc-500 hover:text-amber-400 transition-colors rounded-full hover:bg-zinc-800"
                aria-label={`Formula per ${title}`}
                title="Visualizza formula utilizzata"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* Formula Tooltip Popover */}
              {showTooltip && (
                <div
                  className="absolute right-0 top-6 z-50 w-72 p-3.5 bg-zinc-950 border border-amber-500/40 rounded-xl shadow-2xl text-left pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border-b border-zinc-800 pb-1.5 mb-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Formula di Calcolo</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-mono text-[11px] text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 leading-normal">
                      {formula}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {formulaDescription}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-amber-500/80 italic border-t border-zinc-900 pt-1.5">
                    *Regola: Esclusi pagamenti annullati, rimborsi, duplicati e non incassati.
                  </div>
                </div>
              )}
            </div>

            <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${iconBg}`}>
              {icon}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-black tracking-tight text-zinc-100 font-mono">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
