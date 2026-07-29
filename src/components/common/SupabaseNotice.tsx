import React, { useState } from 'react';
import { Database, ShieldCheck, AlertCircle, Key, CheckCircle, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Modal } from './Modal';

export const SupabaseNotice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        id="btn-supabase-status"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          isSupabaseConfigured
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/50'
            : 'bg-amber-950/40 text-amber-400 border-amber-800/50 hover:bg-amber-900/50'
        }`}
        title="Stato Database Supabase"
      >
        <Database className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {isSupabaseConfigured ? 'Supabase Connesso' : 'Database: Modalità Demo'}
        </span>
        <span className="inline sm:hidden">
          {isSupabaseConfigured ? 'Supabase' : 'Demo'}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Stato Configurazione Supabase"
        subtitle="Builder Athlete Manager • Doctor Strength"
      >
        <div className="space-y-4 text-zinc-300 text-sm">
          {isSupabaseConfigured ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Supabase Collegato Correttamente</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Le variabili d'ambiente <code className="text-amber-400 bg-zinc-950 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> e{' '}
                <code className="text-amber-400 bg-zinc-950 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> sono state rilevate e sono attive.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>In Esecuzione in Modalità Demo Locale</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                I dati attuali sono in modalità dimostrativa in memoria. Per collegare il tuo database PostgreSQL su Supabase reale, inserisci le credenziali nel file <code className="text-amber-400 bg-zinc-950 px-1 py-0.5 rounded">.env</code> o nelle variabili di ambiente del server.
              </p>
            </div>
          )}

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Variabili Richieste (.env)
            </h4>
            <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 font-mono text-xs space-y-1 text-zinc-300 overflow-x-auto">
              <p className="text-amber-400">VITE_SUPABASE_URL="https://tuo-progetto.supabase.co"</p>
              <p className="text-amber-400">VITE_SUPABASE_ANON_KEY="la-tua-anon-key-di-supabase"</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Servizi Integrabili su Supabase:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Database PostgreSQL (Atleti, Abbonamenti, Pagamenti)</li>
              <li>Autenticazione Supabase Auth (Email, Password, Ruoli)</li>
              <li>Supabase Storage (Certificati Medici, Contratti, Schede)</li>
              <li>Row Level Security (RLS per isolamento dati organizzazione)</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              <span>Apri Dashboard Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};
