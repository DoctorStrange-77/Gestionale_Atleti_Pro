import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Code, Copy, Check, Database, Server, UserCheck, Key } from 'lucide-react';
import { DocumentVisibility } from '../../types';
import { useToast } from '../../context/ToastContext';

interface SupabaseSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'admin' | 'staff' | 'coach' | 'atleta_owner' | 'atleta_other';

const SQL_POLICIES = `-- =========================================================================
-- REGOLE DI SICUREZZA SUPABASE STORAGE & ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- 1. Attiva RLS sulla tabella documenti ed oggetti storage
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Solo Admin e Staff possono vedere documenti riservati
CREATE POLICY "Admins full access to documents"
ON documents FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('admin', 'owner')
);

-- 3. Policy: Accesso per Coach / Atleta
CREATE POLICY "Coach or Athlete document access"
ON documents FOR SELECT
TO authenticated
USING (
  (visibility = 'pubblico') OR
  (visibility = 'atleta_coach' AND (athlete_id = auth.uid() OR coach_id = auth.uid())) OR
  (visibility = 'solo_staff' AND auth.jwt() ->> 'role' IN ('admin', 'staff', 'coach'))
);

-- 4. Policy Supabase Storage per download file cifrati
CREATE POLICY "Strict Storage Object Access"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('documents', 'consents', 'medical') AND (
    (storage.foldername(name))[1] = 'public' OR
    (storage.foldername(name))[2] = auth.uid()::text OR
    auth.jwt() ->> 'role' IN ('admin', 'owner')
  )
);`;

export const SupabaseSecurityModal: React.FC<SupabaseSecurityModalProps> = ({ isOpen, onClose }) => {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  // Simulator State
  const [simRole, setSimRole] = useState<UserRole>('coach');
  const [simVisibility, setSimVisibility] = useState<DocumentVisibility>('atleta_coach');
  const [simIsAssignedCoach, setSimIsAssignedCoach] = useState(true);

  if (!isOpen) return null;

  // Simulate evaluation
  const evaluateAccess = (): { allowed: boolean; reason: string } => {
    if (simRole === 'admin') {
      return { allowed: true, reason: 'Ruolo Administrator: accesso completo a tutti i bucket ed al sistema RLS.' };
    }

    if (simVisibility === 'riservato') {
      return { allowed: false, reason: 'Documento RISERVATO: accessibile solo all\'Amministratore o Titolare.' };
    }

    if (simVisibility === 'pubblico') {
      return { allowed: true, reason: 'Documento PUBBLICO STAFF: accessibile a tutti i membri dello staff autenticati.' };
    }

    if (simVisibility === 'solo_staff') {
      if (simRole === 'staff' || simRole === 'coach') {
        return { allowed: true, reason: 'Documento SOLO STAFF: il ruolo appartiene allo staff accreditato.' };
      }
      return { allowed: false, reason: 'Documento SOLO STAFF: l\'atleta non possiede permessi per consultare file interni.' };
    }

    if (simVisibility === 'atleta_coach') {
      if (simRole === 'atleta_owner') {
        return { allowed: true, reason: 'Documento ATLETA + COACH: l\'atleta sta accedendo al proprio file personale.' };
      }
      if (simRole === 'coach' && simIsAssignedCoach) {
        return { allowed: true, reason: 'Documento ATLETA + COACH: il coach è assegnato direttamente a questo atleta.' };
      }
      if (simRole === 'coach' && !simIsAssignedCoach) {
        return { allowed: false, reason: 'Documento ATLETA + COACH: il coach NON è assegnato a questo specifico atleta.' };
      }
      return { allowed: false, reason: 'Accesso negato: utente non autorizzato ad accedere a questo file.' };
    }

    return { allowed: false, reason: 'Regola di default: Accesso negato (403 Forbidden).' };
  };

  const simResult = evaluateAccess();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_POLICIES);
    setCopied(true);
    showSuccess('Copiato', 'Codice SQL per Supabase RLS copiato negli appunti.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Sicurezza Supabase Storage & RLS</h3>
              <p className="text-xs text-zinc-400">
                Regole di protezione e simulatore di autorizzazioni per i file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Storage Buckets Summary */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Struttura Bucket Supabase Storage</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <p className="text-xs font-bold text-emerald-400 font-mono">📁 documents</p>
                <p className="text-[11px] text-zinc-400">Contratti, Fatture, Ricevute, Questionari ed Allegati.</p>
              </div>
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <p className="text-xs font-bold text-amber-400 font-mono">🩺 medical</p>
                <p className="text-[11px] text-zinc-400">Certificati Medici, Esami Clinici e Foto Posturali.</p>
              </div>
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <p className="text-xs font-bold text-sky-400 font-mono">🔒 consents</p>
                <p className="text-[11px] text-zinc-400">Informativa GDPR Privacy e Liberatorie Firmate.</p>
              </div>
            </div>
          </div>

          {/* Interactive RLS Policy Simulator */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Simulatore Autorizzazioni RLS (Row Level Security)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Ruolo Utente</label>
                <select
                  value={simRole}
                  onChange={(e) => setSimRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 outline-none"
                >
                  <option value="admin">Admin / Titolare</option>
                  <option value="staff">Staff Medico</option>
                  <option value="coach">Coach</option>
                  <option value="atleta_owner">Atleta Proprietario File</option>
                  <option value="atleta_other">Atleta Terzo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Visibilità Documento</label>
                <select
                  value={simVisibility}
                  onChange={(e) => setSimVisibility(e.target.value as DocumentVisibility)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 outline-none"
                >
                  <option value="pubblico">Pubblico Staff</option>
                  <option value="solo_staff">Solo Staff</option>
                  <option value="atleta_coach">Atleta + Coach</option>
                  <option value="riservato">Riservato Titolare</option>
                </select>
              </div>

              {simRole === 'coach' && simVisibility === 'atleta_coach' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Relazione Coach</label>
                  <select
                    value={simIsAssignedCoach ? 'yes' : 'no'}
                    onChange={(e) => setSimIsAssignedCoach(e.target.value === 'yes')}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 outline-none"
                  >
                    <option value="yes">Coach Assegnato All'Atleta</option>
                    <option value="no">Coach Non Assegnato</option>
                  </select>
                </div>
              )}
            </div>

            {/* Simulation Result Badge */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                simResult.allowed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    simResult.allowed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {simResult.allowed ? '200 OK' : '403 ERR'}
                </div>
                <div>
                  <p className="text-xs font-bold">
                    {simResult.allowed ? 'Accesso Consentito (Supabase RLS Allow)' : 'Accesso Negato (403 Forbidden)'}
                  </p>
                  <p className="text-[11px] opacity-80">{simResult.reason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code SQL Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                <span>Script PostgreSQL / Supabase Security Rules</span>
              </h4>
              <button
                onClick={handleCopySQL}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia Codice SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 leading-relaxed">
              {SQL_POLICIES}
            </pre>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors"
            >
              Ho Capito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
