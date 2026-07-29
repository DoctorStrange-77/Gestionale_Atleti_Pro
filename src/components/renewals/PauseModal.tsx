import React, { useState, useEffect } from 'react';
import {
  X,
  PauseCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  Clock,
  UserCheck,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { PauseExpiryOption, PauseInstallmentsOption } from '../../types';
import { useRenewals } from '../../context/RenewalsContext';
import { useSubscriptions } from '../../context/SubscriptionsContext';
import { useAuth } from '../../context/AuthContext';

interface PauseModalProps {
  subscriptionId?: string;
  athleteId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  subscriptionId,
  athleteId,
  isOpen,
  onClose,
}) => {
  const { addPause } = useRenewals();
  const { subscriptions } = useSubscriptions();
  const { user } = useAuth();

  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [expectedEndDate, setExpectedEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('Vacanze ed impegni personali');
  const [authorization, setAuthorization] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [expiryOption, setExpiryOption] = useState<PauseExpiryOption>('proroga');
  const [installmentsOption, setInstallmentsOption] =
    useState<PauseInstallmentsOption>('sospendi');

  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setAuthorization(`${user.fullName} (${user.role.toUpperCase()})`);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    setStartDate(todayStr);

    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    setExpectedEndDate(twoWeeks.toISOString().split('T')[0]);

    if (subscriptionId) {
      setSelectedSubId(subscriptionId);
    } else if (subscriptions.length > 0) {
      setSelectedSubId(subscriptions[0].id);
    }
  }, [subscriptionId, subscriptions, user]);

  if (!isOpen) return null;

  const currentSub = subscriptions.find((s) => s.id === selectedSubId);

  // Calculate pause duration in days
  const calculateDays = () => {
    if (!startDate || !expectedEndDate) return 0;
    const startObj = new Date(startDate);
    const endObj = new Date(expectedEndDate);
    const diff = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24));
    return Math.max(0, diff);
  };

  const pauseDays = calculateDays();

  const handleSubmit = async () => {
    if (!currentSub) return;
    setIsSubmitting(true);
    try {
      await addPause({
        subscriptionId: currentSub.id,
        athleteId: currentSub.athleteId,
        athleteName: currentSub.athleteName || 'Atleta',
        startDate,
        expectedEndDate,
        actualEndDate: expectedEndDate,
        reason,
        authorization: authorization || 'Amministratore',
        notes,
        expiryOption,
        installmentsOption,
      });

      onClose();
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Registrazione Pausa / Sospensione</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Sospendi temporaneamente l'abbonamento e gestisci le scadenze.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {step === 'form' ? (
            <>
              {/* Subscription Selector if not pre-selected */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Seleziona Abbonamento
                </label>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  {subscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.athleteName} — {sub.packageName} (Scadenza: {sub.endDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pause Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">Data Inizio Pausa</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">Data Fine Prevista</label>
                  <input
                    type="date"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Duration badge */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Giorni di Pausa Calcolati:
                </span>
                <span className="font-bold text-amber-400">{pauseDays} Giorni</span>
              </div>

              {/* Reason & Authorization */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">Motivazione</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Vacanze ed impegni personali">Vacanze ed impegni personali</option>
                    <option value="Infortunio / Problema medico">Infortunio / Problema medico</option>
                    <option value="Trasferta lavorativa">Trasferta lavorativa</option>
                    <option value="Motivi di studio / esami">Motivi di studio / esami</option>
                    <option value="Altro">Altro (specificare nelle note)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">Autorizzazione da</label>
                  <input
                    type="text"
                    value={authorization}
                    onChange={(e) => setAuthorization(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    placeholder="Nome responsabile o Direzione"
                  />
                </div>
              </div>

              {/* Options for Expiry and Installments */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Azione sulla Scadenza dell'Abbonamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpiryOption('proroga')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      expiryOption === 'proroga'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-zinc-100">Prorogare la Scadenza</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Sposta la data di fine abbonamento in avanti di {pauseDays} giorni.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpiryOption('invariata')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      expiryOption === 'invariata'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-zinc-100">Lasciare Invariata</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      La data di fine dell'abbonamento resta quella attuale ({currentSub?.endDate}).
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Azione sulle Rate del Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInstallmentsOption('sospendi')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      installmentsOption === 'sospendi'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-zinc-100">Sospendere Rate</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Congela le rate durante la pausa.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInstallmentsOption('riprogramma')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      installmentsOption === 'riprogramma'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-zinc-100">Riprogrammare Rate</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Sposta le scadenze future di +{pauseDays} giorni.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInstallmentsOption('attive')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      installmentsOption === 'attive'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-zinc-100">Lasciare Attive</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Nessuna modifica al piano rate.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Note / Specifiche Pausa</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Aggiungi dettagli aggiuntivi..."
                />
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4 py-2">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-300">Conferma Registrazione Pausa</p>
                  <p className="text-zinc-300">
                    Stai inserendo una pausa di <strong>{pauseDays} giorni</strong> per{' '}
                    <strong>{currentSub?.athleteName}</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs space-y-2 text-zinc-300">
                <p className="font-bold text-zinc-100 border-b border-zinc-800 pb-2">Riepilogo Scelte</p>
                <div>Abbonamento: <span className="font-semibold text-amber-400">{currentSub?.packageName}</span></div>
                <div>Inizio Pausa: <span className="font-semibold">{startDate}</span></div>
                <div>Fine Pausa Prevista: <span className="font-semibold">{expectedEndDate}</span></div>
                <div>Scadenza Abbonamento: <span className="font-semibold text-emerald-400">{expiryOption === 'proroga' ? `Prorogata di +${pauseDays} giorni` : 'Invariata'}</span></div>
                <div>Gestione Rate: <span className="font-semibold text-emerald-400">{installmentsOption.toUpperCase()}</span></div>
                <div>Autorizzato da: <span className="font-semibold">{authorization}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Annulla
          </button>

          {step === 'form' ? (
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>Verifica e Prosegui</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
              >
                Indietro
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Conferma e Salva Pausa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
