import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Euro,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AthleteRenewal } from '../../types';
import { useRenewals } from '../../context/RenewalsContext';
import { usePackages } from '../../context/PackagesContext';

interface ConfirmRenewalModalProps {
  renewal: AthleteRenewal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmRenewalModal: React.FC<ConfirmRenewalModalProps> = ({
  renewal,
  isOpen,
  onClose,
}) => {
  const { confirmRenewalWorkflow } = useRenewals();
  const { packages } = usePackages();

  const [actionType, setActionType] = useState<'nuovo' | 'proroga'>('nuovo');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [packageName, setPackageName] = useState<string>('');
  const [listPrice, setListPrice] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [agreedPrice, setAgreedPrice] = useState<number>(0);

  const [startDate, setStartDate] = useState<string>('');
  const [durationValue, setDurationValue] = useState<number>(12);
  const [durationUnit, setDurationUnit] = useState<
    'giorni' | 'settimane' | 'mensile' | 'annuale' | 'numero_ingressi' | 'numero_consulenze'
  >('mensile');
  const [endDate, setEndDate] = useState<string>('');

  const [paymentFrequency, setPaymentFrequency] = useState<
    'unica_soluzione' | 'mensile' | 'bimestrale' | 'trimestrale' | 'semestrale' | 'personalizzato'
  >('mensile');
  const [installmentCount, setInstallmentCount] = useState<number>(12);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [firstInstallmentDate, setFirstInstallmentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (renewal) {
      setPackageName(renewal.currentPackageName);
      setListPrice(renewal.price || 0);
      setAgreedPrice(renewal.price || 0);
      setDiscountFixed(0);
      setDiscountPercent(0);

      const todayStr = new Date().toISOString().split('T')[0];
      const start = renewal.endDate > todayStr ? renewal.endDate : todayStr;
      setStartDate(start);
      setFirstInstallmentDate(start);

      // Default 12 months forward for end date
      const endObj = new Date(start);
      endObj.setFullYear(endObj.getFullYear() + 1);
      setEndDate(endObj.toISOString().split('T')[0]);
      setNotes(`Rinnovo abbonamento per ${renewal.athleteName}`);
    }
  }, [renewal]);

  useEffect(() => {
    // Recalculate agreed price when listPrice or discounts change
    let calc = listPrice;
    if (discountFixed > 0) {
      calc -= discountFixed;
    }
    if (discountPercent > 0) {
      calc -= (calc * discountPercent) / 100;
    }
    setAgreedPrice(Math.max(0, Math.round(calc * 100) / 100));
  }, [listPrice, discountFixed, discountPercent]);

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setPackageName(pkg.title);
      setListPrice(pkg.price);
      setAgreedPrice(pkg.price);
      setDurationValue(pkg.durationValue);
      setDurationUnit(pkg.durationUnit as any);

      // calculate end date
      if (startDate) {
        const startObj = new Date(startDate);
        if (pkg.durationUnit === 'annuale') {
          startObj.setFullYear(startObj.getFullYear() + pkg.durationValue);
        } else if (pkg.durationUnit === 'mensile') {
          startObj.setMonth(startObj.getMonth() + pkg.durationValue);
        } else {
          startObj.setMonth(startObj.getMonth() + 1);
        }
        setEndDate(startObj.toISOString().split('T')[0]);
      }
    }
  };

  if (!isOpen || !renewal) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ok = await confirmRenewalWorkflow({
        renewalId: renewal.id,
        actionType,
        packageId: selectedPackageId || undefined,
        packageName,
        listPrice,
        discountFixed,
        discountPercent,
        agreedPrice,
        startDate,
        durationValue,
        durationUnit,
        endDate,
        paymentFrequency,
        installmentCount,
        downPayment,
        firstInstallmentDate,
        notes,
      });

      if (ok) {
        onClose();
        setStep('form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Conferma e Attivazione Rinnovo</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Sicuro
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Atleta: <strong className="text-zinc-200">{renewal.athleteName}</strong>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {step === 'form' ? (
            <>
              {/* Action Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  1. Modalità di Rinnovo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('nuovo')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      actionType === 'nuovo'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Crea Nuovo Abbonamento
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      Genera un nuovo contratto attivo e mantiene intatto lo storico precedente.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('proroga')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      actionType === 'proroga'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      Proroga Abbonamento Corrente
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      Estende la data di scadenza e aggiorna le condizioni dell'abbonamento in corso.
                    </span>
                  </button>
                </div>
              </div>

              {/* Package Selection */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  2. Selezione Pacchetto & Prezzo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Seleziona Pacchetto Standard</label>
                    <select
                      value={selectedPackageId}
                      onChange={(e) => handlePackageSelect(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Mantieni / Personalizzato --</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} (€{pkg.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Nome Pacchetto</label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Prezzo di Listino (€)</label>
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Sconto Fisso (€)</label>
                    <input
                      type="number"
                      value={discountFixed}
                      onChange={(e) => setDiscountFixed(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Sconto Percentuale (%)</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Prezzo Finale Concordato:</span>
                  <span className="text-lg font-black text-amber-400">€{agreedPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  3. Date e Validità
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Data Inizio</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Nuova Scadenza</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rate & Payment Schedule (only if nuovo) */}
              {actionType === 'nuovo' && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    4. Generazione Rate e Scadenze
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 mb-1 block">Frequenza Pagamento</label>
                      <select
                        value={paymentFrequency}
                        onChange={(e) => setPaymentFrequency(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="unica_soluzione">Unica Soluzione</option>
                        <option value="mensile">Mensile</option>
                        <option value="bimestrale">Bimestrale</option>
                        <option value="trimestrale">Trimestrale</option>
                        <option value="semestrale">Semestrale</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 mb-1 block">Numero Rate</label>
                      <input
                        type="number"
                        min={1}
                        max={36}
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 mb-1 block">Acconto / Iscrizione (€)</label>
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Data Prima Rata</label>
                    <input
                      type="date"
                      value={firstInstallmentDate}
                      onChange={(e) => setFirstInstallmentDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4 py-2">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-300">Conferma Operazione Irreversibile</p>
                  <p className="text-zinc-300">
                    Stai per confermare il rinnovo per <strong>{renewal.athleteName}</strong>. Lo storico dei
                    pagamenti e degli abbonamenti precedenti verrà <strong>conservato al 100%</strong> senza alcuna
                    cancellazione.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs space-y-2">
                <p className="font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center justify-between">
                  <span>Riepilogo Rinnovo</span>
                  <span className="text-amber-400 font-black">€{agreedPrice}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-zinc-400 pt-1">
                  <div>Pacchetto: <span className="text-zinc-200 font-semibold">{packageName}</span></div>
                  <div>Modalità: <span className="text-zinc-200 font-semibold">{actionType === 'nuovo' ? 'Nuovo Abbonamento' : 'Proroga'}</span></div>
                  <div>Data Inizio: <span className="text-zinc-200 font-semibold">{startDate}</span></div>
                  <div>Scadenza: <span className="text-zinc-200 font-semibold">{endDate}</span></div>
                  {actionType === 'nuovo' && (
                    <>
                      <div>Rate Previste: <span className="text-zinc-200 font-semibold">{installmentCount} rate</span></div>
                      <div>Acconto: <span className="text-zinc-200 font-semibold">€{downPayment}</span></div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-zinc-800/60 rounded-xl flex items-center gap-2 text-xs text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auditing di sicurezza attivo: L'operazione verrà registrata nella timeline dell'atleta.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
                <span>Conferma Definitiva Rinnovo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
