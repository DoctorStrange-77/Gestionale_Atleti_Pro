import React, { useState } from 'react';
import {
  X,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Ban,
  FileText,
  Receipt,
  Printer,
  ChevronRight,
  ShieldAlert,
  Edit,
  Tag,
  ArrowRight,
  Send,
} from 'lucide-react';
import { AthleteSubscription, PreferredPaymentMethod, SubscriptionStatus } from '../../types';
import { useSubscriptions } from '../../context/SubscriptionsContext';
import { useToast } from '../../context/ToastContext';

interface SubscriptionDetailModalProps {
  subscription: AthleteSubscription | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (sub: AthleteSubscription) => void;
  onRenew?: (sub: AthleteSubscription) => void;
}

const STATUS_BADGES: Record<
  SubscriptionStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  bozza: {
    label: 'Bozza',
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
    icon: Clock,
  },
  futuro: {
    label: 'Futuro',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: Calendar,
  },
  attivo: {
    label: 'Attivo',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  in_scadenza: {
    label: 'In Scadenza',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertCircle,
  },
  sospeso: {
    label: 'Sospeso',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: PauseCircle,
  },
  scaduto: {
    label: 'Scaduto',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: ShieldAlert,
  },
  annullato: {
    label: 'Annullato',
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    border: 'border-red-800/50',
    icon: Ban,
  },
  rinnovato: {
    label: 'Rinnovato',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: RefreshCw,
  },
};

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onEdit,
  onRenew,
}) => {
  const { markInstallmentPaid, toggleSubscriptionSuspension, cancelSubscription } =
    useSubscriptions();
  const { showSuccess, showError } = useToast();

  // State for recording installment payment modal
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<PreferredPaymentMethod>('bonifico');
  const [payReceipt, setPayReceipt] = useState<string>('');

  if (!isOpen || !subscription) return null;

  const badge = STATUS_BADGES[subscription.status] || STATUS_BADGES.attivo;
  const BadgeIcon = badge.icon;

  const totalPaid = subscription.installments
    .filter((i) => i.status === 'pagato')
    .reduce((acc, i) => acc + (i.paidAmount || i.amount), 0);

  const totalPending = subscription.agreedPrice - totalPaid;
  const progressPct =
    subscription.agreedPrice > 0
      ? Math.min(100, Math.round((totalPaid / subscription.agreedPrice) * 100))
      : 0;

  const handleConfirmPayInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallmentId) return;

    const targetInst = subscription.installments.find((i) => i.id === selectedInstallmentId);
    if (!targetInst) return;

    markInstallmentPaid(subscription.id, selectedInstallmentId, {
      paidDate: payDate,
      paidAmount: targetInst.amount,
      paymentMethod: payMethod,
      receiptNumber: payReceipt || `REC-${Date.now().toString().slice(-6)}`,
    });

    showSuccess(`Incasata con successo la rata "${targetInst.label}" (€${targetInst.amount.toFixed(2)})`);
    setSelectedInstallmentId(null);
  };

  const handlePrintContract = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {subscription.packageName}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Atleta:{' '}
                <strong className="text-white font-bold">{subscription.athleteName || 'Atleta'}</strong>{' '}
                &bull; ID Contratto: <span className="font-mono text-zinc-400">{subscription.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Valore Concordato
              </span>
              <p className="text-lg font-black text-white">€{subscription.agreedPrice.toFixed(2)}</p>
              {subscription.listPrice > subscription.agreedPrice && (
                <span className="text-[10px] text-emerald-400 font-semibold line-through">
                  Listino €{subscription.listPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Incassato Effettivo
              </span>
              <p className="text-lg font-black text-emerald-400">€{totalPaid.toFixed(2)}</p>
              <span className="text-[10px] text-zinc-400 font-semibold">({progressPct}% saldato)</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Residuo da Incassare
              </span>
              <p className="text-lg font-black text-amber-400">€{totalPending.toFixed(2)}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Periodo Contratto
              </span>
              <p className="text-xs font-bold text-zinc-200 mt-1">
                {subscription.startDate} &rarr; {subscription.endDate}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400">Avanzamento Incassi Rate</span>
              <span className="text-emerald-400">{progressPct}% completato</span>
            </div>
            <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                Rateizzazione
              </span>
              <div className="space-y-1 text-zinc-300">
                <p>
                  <strong>Frequenza:</strong> {subscription.paymentFrequency}
                </p>
                <p>
                  <strong>Numero Rate:</strong> {subscription.installmentCount}
                </p>
                <p>
                  <strong>Acconto Iniziale:</strong> €{subscription.downPayment.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">
                Condizioni & Rinnovo
              </span>
              <div className="space-y-1 text-zinc-300">
                <p>
                  <strong>Metodo Preferito:</strong> {subscription.preferredPaymentMethod}
                </p>
                <p>
                  <strong>Modalità Rinnovo:</strong> {subscription.renewalType}
                </p>
                <p>
                  <strong>Tolleranza Scadenza:</strong> {subscription.gracePeriodDays} giorni
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
                Sconti Applicati
              </span>
              <div className="space-y-1 text-zinc-300">
                <p>
                  <strong>Sconto Fisso:</strong> €{subscription.discountFixed.toFixed(2)}
                </p>
                <p>
                  <strong>Sconto %:</strong> {subscription.discountPercent}%
                </p>
                <p>
                  <strong>Risparmio Atleta:</strong> €
                  {(subscription.listPrice - subscription.agreedPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {subscription.notes && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Note e Note di Segreteria:
              </span>
              <p className="text-zinc-300 italic">{subscription.notes}</p>
            </div>
          )}

          {/* Piano Rate Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Piano Rate & Storico Pagamenti ({subscription.installments.length})</span>
            </h3>

            <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rata</th>
                    <th className="p-3">Data Scadenza</th>
                    <th className="p-3">Importo</th>
                    <th className="p-3">Stato Pagamento</th>
                    <th className="p-3">Data Incasso</th>
                    <th className="p-3 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-200">
                  {subscription.installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-zinc-900/50 transition-all">
                      <td className="p-3 font-bold text-white">{inst.label}</td>
                      <td className="p-3 font-semibold text-amber-400">{inst.dueDate}</td>
                      <td className="p-3 font-black text-emerald-400">€{inst.amount.toFixed(2)}</td>
                      <td className="p-3">
                        {inst.status === 'pagato' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pagato
                          </span>
                        ) : inst.status === 'scaduto' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Scaduto
                          </span>
                        ) : inst.status === 'in_scadenza' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> In Scadenza
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold inline-flex items-center gap-1">
                            In Attesa
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-zinc-400">
                        {inst.paidDate ? (
                          <span>
                            {inst.paidDate} ({inst.paymentMethod || 'Pagato'})
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {inst.status !== 'pagato' ? (
                          <button
                            onClick={() => setSelectedInstallmentId(inst.id)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-[11px] transition-all shadow-sm"
                          >
                            Registra Incasso
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <Receipt className="w-3.5 h-3.5" /> Ricevuta #{inst.receiptNumber || '001'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintContract}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa Contratto</span>
            </button>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(subscription);
                }}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifica</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleSubscriptionSuspension(subscription.id);
                showSuccess(
                  subscription.status === 'sospeso'
                    ? 'Abbonamento riattivato'
                    : 'Abbonamento sospeso temporaneamente'
                );
              }}
              className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              {subscription.status === 'sospeso' ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Riattiva</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>Sospendi</span>
                </>
              )}
            </button>

            {onRenew && (
              <button
                onClick={() => {
                  onClose();
                  onRenew(subscription);
                }}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rinnova Abbonamento</span>
              </button>
            )}

            <button
              onClick={() => {
                cancelSubscription(subscription.id);
                showSuccess('Abbonamento annullato');
              }}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              <span>Annulla Contratto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Modal for Registering Installment Payment */}
      {selectedInstallmentId && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmPayInstallment}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-scaleUp"
          >
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              Registra Incasso Rata
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Data Effettiva Incasso
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Metodo di Pagamento
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PreferredPaymentMethod)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="bonifico">Bonifico Bancario</option>
                  <option value="carta">Carta di Credito</option>
                  <option value="contanti">Contanti</option>
                  <option value="pos">POS</option>
                  <option value="rid_sepa">RID / SDD</option>
                  <option value="paypal">PayPal</option>
                  <option value="altro">Altro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Numero Ricevuta / Transazione (Opzionale)
                </label>
                <input
                  type="text"
                  value={payReceipt}
                  onChange={(e) => setPayReceipt(e.target.value)}
                  placeholder="Es. REC-2026-089"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInstallmentId(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
              >
                Conferma Incasso
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
