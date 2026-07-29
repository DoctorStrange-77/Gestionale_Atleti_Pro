import React, { useState } from 'react';
import { Info, X, Database, ShieldAlert, Sparkles, HardDrive, AlertTriangle } from 'lucide-react';

interface DemoBannerProps {
  variant?: 'app' | 'login';
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ variant = 'app' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Banner / Bar */}
      {variant === 'app' ? (
        <div className="bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-b border-amber-500/20 px-3 py-1.5 sm:px-4 text-xs font-medium text-amber-300 flex items-center justify-between gap-2 z-30 shrink-0">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold tracking-wide uppercase text-[10px] sm:text-xs text-amber-400 shrink-0">
              MODALITÀ DEMO
            </span>
            <span className="hidden sm:inline text-zinc-500">—</span>
            <span className="truncate text-[11px] sm:text-xs text-zinc-300">
              DATI SALVATI LOCALMENTE NEL BROWSER
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            title="Maggiori informazioni sulla modalità demo"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Info Demo</span>
          </button>
        </div>
      ) : (
        /* Login page variant */
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-amber-300 text-xs flex items-start gap-3 relative overflow-hidden">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold uppercase tracking-wider text-[11px] text-amber-400">
              MODALITÀ DEMO — DATI SALVATI LOCALMENTE NEL BROWSER
            </p>
            <p className="text-zinc-300 text-[11px] mt-1 leading-relaxed">
              Applicazione didattica vibe coding. I dati sono memorizzati nel browser.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
            >
              <span>Leggi tutti i dettagli sulla modalità demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-zinc-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Informazioni sulla Modalità Demo
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium">
                    Gestionale Atleti Pro • Vibe Coding Demo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Points */}
            <div className="space-y-3.5 text-xs leading-relaxed text-zinc-300 my-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
                <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Nessun database reale in questa versione</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    L’applicazione non richiede e non utilizza un database cloud server attivo in questo ambiente demo.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
                <HardDrive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Salvataggio locale nel browser</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Tutti i dati inseriti o modificati sono salvati direttamente nel <code className="text-amber-300 bg-amber-950/40 px-1 rounded">localStorage</code> del tuo browser web.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Resettaggio dei dati</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    I dati possono essere cancellati o ripristinati in qualsiasi momento svuotando i dati di navigazione del sito o usando il reset nelle impostazioni.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Protezione e privacy dati</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Trattandosi di una demo, non devono essere inseriti dati personali, medici o finanziari reali di atleti.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Integrazioni Supabase e API predisposte</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Le funzioni Supabase e le API esterne sono simulate o predisposte per l’integrazione completa in produzione.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">Finalità Didattica Vibe Coding</p>
                  <p className="text-amber-200/80 text-[11px] mt-0.5">
                    L’applicazione è stata creata per dimostrare l’architettura, la logica gestionale e l’esperienza d’uso avanzata sviluppata tramite vibe coding.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                Ho Capito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
