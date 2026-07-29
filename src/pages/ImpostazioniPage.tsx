import React, { useState } from 'react';
import { Settings, Building2, Key, Database, Globe, Shield, Code, Crown, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { ROLE_DEFINITIONS } from '../lib/permissions';
import { SqlScriptModal } from '../components/sql/SqlScriptModal';
import { UserRole } from '../types';

export const ImpostazioniPage: React.FC = () => {
  const { user, organizationName, toggleCoachFinancials } = useAuth();
  const [showSqlModal, setShowSqlModal] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Impostazioni Organizzazione & Multi-Tenant</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Parametri dell'organizzazione, ruoli, permessi e script SQL Supabase.
          </p>
        </div>

        <button
          onClick={() => setShowSqlModal(true)}
          className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <Code className="w-4 h-4" />
          <span>Visualizza Query SQL & RLS</span>
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Organization Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Dettagli Organizzazione Attiva</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400">Nome Attività / Centro</label>
              <input
                type="text"
                readOnly
                value={organizationName}
                className="w-full mt-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">ID Organizzazione (Multi-Tenant ID)</label>
              <input
                type="text"
                readOnly
                value={user?.organizationId || 'org-doctor-strength'}
                className="w-full mt-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Roles & Permissions Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Matrice Ruoli & Permessi Predefiniti</span>
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
              const rDef = ROLE_DEFINITIONS[rKey];
              return (
                <div
                  key={rKey}
                  className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md border font-bold text-[11px] ${rDef.badgeColor}`}>
                        {rDef.name}
                      </span>
                      {rKey === 'proprietario' && (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Accesso Totale & Trasferimento Proprietario
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-300 text-[11px]">{rDef.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coach Financial Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Impostazione Dati Economici per il Ruolo Coach</span>
          </h3>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-zinc-200">Visibilità Dati Economici per Coach</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Se abilitato, i Coach potranno visualizzare gli importi dei pagamenti, pacchetti e il fatturato relativo ai propri atleti.
              </p>
            </div>
            <button
              onClick={() => toggleCoachFinancials()}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs shrink-0 transition-all ${
                user?.canViewFinancials
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {user?.canViewFinancials ? 'Abilitato' : 'Disabilitato'}
            </button>
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Database PostgreSQL & Supabase Status</span>
          </h3>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">Stato Connessione Supabase</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {isSupabaseConfigured ? 'Connesso' : 'Modalità Demo Attiva'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Per isolare le organizzazioni in produzione con Row Level Security (RLS), esegui lo script SQL disponibile dal pulsante "Visualizza Query SQL & RLS" nell'Editor SQL di Supabase.
            </p>
          </div>
        </div>
      </div>

      {showSqlModal && <SqlScriptModal onClose={() => setShowSqlModal(false)} />}
    </div>
  );
};
