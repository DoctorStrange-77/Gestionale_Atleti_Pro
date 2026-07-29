import React, { useState } from 'react';
import { X, AlertTriangle, ShieldX } from 'lucide-react';
import { AthleteConsent } from '../../types';
import { useDocuments } from '../../context/DocumentsContext';

interface RevokeConsentModalProps {
  consent: AthleteConsent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RevokeConsentModal: React.FC<RevokeConsentModalProps> = ({
  consent,
  isOpen,
  onClose,
}) => {
  const { revokeConsent } = useDocuments();
  const [revocationDate, setRevocationDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  if (!isOpen || !consent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    revokeConsent(consent.id, reason, revocationDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldX className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Registra Revoca Consenso</h3>
              <p className="text-xs text-red-300 font-medium">
                Atleta: {consent.athleteName}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">
              Stai registrando la revoca del consenso <span className="font-bold text-red-300">"{consent.consentType}"</span>.
              A far data dalla revoca, l'organizzazione non potrà più trattare i dati relativi a questa specifica finalità.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Data della Revoca <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={revocationDate}
              onChange={(e) => setRevocationDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-red-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Motivazione o Note di Revoca <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="es. Comunicazione via PEC in data odierna / Richiesta cancellazione foto dai canali social..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:border-red-400 outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              <ShieldX className="w-4 h-4" />
              <span>Conferma Revoca</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
