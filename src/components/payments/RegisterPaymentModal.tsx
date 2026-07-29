import React, { useState, useEffect } from 'react';
import {
  X,
  Euro,
  Calendar,
  CreditCard,
  FileText,
  User,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Hash,
  FileCheck,
  Building,
  UploadCloud,
  Clock,
} from 'lucide-react';
import { usePayments } from '../../context/PaymentsContext';
import { useAthletes } from '../../context/AthletesContext';
import { useSubscriptions } from '../../context/SubscriptionsContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod, PaymentStatus } from '../../types';

export const RegisterPaymentModal: React.FC = () => {
  const {
    isQuickRegisterOpen,
    quickRegisterData,
    closeQuickRegisterModal,
    savePaymentRecord,
    payments,
  } = usePayments();

  const { athletes } = useAthletes();
  const { subscriptions } = useSubscriptions();
  const { user } = useAuth();

  const [atletaId, setAtletaId] = useState('');
  const [abbonamentoId, setAbbonamentoId] = useState('');
  const [customPackageName, setCustomPackageName] = useState('');
  const [numeroDellaRata, setNumeroDellaRata] = useState('Quota Unica');
  const [importoPrevisto, setImportoPrevisto] = useState<number | ''>(300);
  const [importoPagato, setImportoPagato] = useState<number | ''>(200);
  const [dataDiScadenza, setDataDiScadenza] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dataDelPagamento, setDataDelPagamento] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [metodoDiPagamento, setMetodoDiPagamento] =
    useState<PaymentMethod>('contanti');
  const [stato, setStato] = useState<PaymentStatus>('pagato parzialmente');
  const [riferimentoTransazione, setRiferimentoTransazione] = useState('');
  const [numeroRicevuta, setNumeroRicevuta] = useState('');
  const [riferimentoFattura, setRiferimentoFattura] = useState('');
  const [note, setNote] = useState('');
  const [allegato, setAllegato] = useState('');
  const [utenteCheHaRegistrato, setUtenteCheHaRegistrato] = useState('');

  // Prepopulate if quickRegisterData or existing paymentId passed
  useEffect(() => {
    if (!isQuickRegisterOpen) return;

    const operatorName = user?.fullName
      ? `${user.fullName} (${user.role ? user.role.toUpperCase() : 'ADMIN'})`
      : 'Amministratore';
    setUtenteCheHaRegistrato(operatorName);

    if (quickRegisterData?.paymentId) {
      const existing = payments.find((p) => p.id === quickRegisterData.paymentId);
      if (existing) {
        setAtletaId(existing.atletaId);
        setAbbonamentoId(existing.abbonamentoId || '');
        setCustomPackageName(existing.abbonamentoNome || '');
        setNumeroDellaRata(existing.numeroDellaRata || 'Quota Unica');
        setImportoPrevisto(existing.importoPrevisto);
        setImportoPagato(existing.importoPagato);
        setDataDiScadenza(existing.dataDiScadenza);
        setDataDelPagamento(existing.dataDelPagamento || new Date().toISOString().split('T')[0]);
        setMetodoDiPagamento(existing.metodoDiPagamento || 'contanti');
        setStato(existing.stato);
        setRiferimentoTransazione(existing.riferimentoTransazione || '');
        setNumeroRicevuta(existing.numeroRicevuta || '');
        setRiferimentoFattura(existing.riferimentoFattura || '');
        setNote(existing.note || '');
        setAllegato(existing.allegato || '');
        setUtenteCheHaRegistrato(existing.utenteCheHaRegistrato || operatorName);
        return;
      }
    }

    if (quickRegisterData?.atletaId) {
      setAtletaId(quickRegisterData.atletaId);
    } else if (athletes.length > 0) {
      setAtletaId(athletes[0].id);
    }

    if (quickRegisterData?.abbonamentoId) {
      setAbbonamentoId(quickRegisterData.abbonamentoId);
      const sub = subscriptions.find((s) => s.id === quickRegisterData.abbonamentoId);
      if (sub) {
        setCustomPackageName(sub.packageName);
        setImportoPrevisto(sub.agreedPrice || 300);
        setImportoPagato(sub.agreedPrice || 300);
      }
    } else {
      setAbbonamentoId('');
      setCustomPackageName('Quota Abbonamento Mensile');
      setImportoPrevisto(300);
      setImportoPagato(200);
    }

    // Default receipt number generator if empty
    setNumeroRicevuta(`RIC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  }, [isQuickRegisterOpen, quickRegisterData, athletes, subscriptions, user, payments]);

  // When athlete changes, try to populate active subscription
  const handleAthleteChange = (id: string) => {
    setAtletaId(id);
    const athleteSubs = subscriptions.filter((s) => s.athleteId === id);
    if (athleteSubs.length > 0) {
      const activeSub = athleteSubs[0];
      setAbbonamentoId(activeSub.id);
      setCustomPackageName(activeSub.packageName);
      setImportoPrevisto(activeSub.agreedPrice);
      setImportoPagato(activeSub.agreedPrice);
    } else {
      setAbbonamentoId('');
    }
  };

  // When subscription dropdown changes
  const handleSubscriptionChange = (subId: string) => {
    setAbbonamentoId(subId);
    if (subId) {
      const sub = subscriptions.find((s) => s.id === subId);
      if (sub) {
        setCustomPackageName(sub.packageName);
        setImportoPrevisto(sub.agreedPrice);
        setImportoPagato(sub.agreedPrice);
        if (sub.installments && sub.installments.length > 0) {
          const unpaid = sub.installments.find((i) => i.status !== 'pagato');
          if (unpaid) {
            setNumeroDellaRata(unpaid.label);
            setImportoPrevisto(unpaid.amount);
            setImportoPagato(unpaid.amount);
            setDataDiScadenza(unpaid.dueDate);
          }
        }
      }
    }
  };

  // Auto calculate residuo and update default status
  const numPrevisto = Number(importoPrevisto) || 0;
  const numPagato = Number(importoPagato) || 0;
  const residuo = Math.max(0, numPrevisto - numPagato);

  const handlePaidAmountChange = (val: number | '') => {
    setImportoPagato(val);
    const p = Number(val) || 0;
    if (p >= numPrevisto && numPrevisto > 0) {
      setStato('pagato');
    } else if (p > 0 && p < numPrevisto) {
      setStato('pagato parzialmente');
    } else if (p === 0) {
      setStato('da pagare');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAllegato(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const athleteObj = athletes.find((a) => a.id === atletaId);
    const athleteName = athleteObj
      ? `${athleteObj.firstName} ${athleteObj.lastName}`
      : 'Atleta Generico';

    const subObj = subscriptions.find((s) => s.id === abbonamentoId);
    const packageName = subObj ? subObj.packageName : customPackageName || 'Quota Allenamento';

    savePaymentRecord({
      id: quickRegisterData?.paymentId,
      atletaId,
      atletaNome: athleteName,
      abbonamentoId: abbonamentoId || undefined,
      abbonamentoNome: packageName,
      importoPrevisto: numPrevisto,
      importoPagato: numPagato,
      dataDiScadenza,
      dataDelPagamento: numPagato > 0 ? dataDelPagamento : undefined,
      numeroDellaRata,
      metodoDiPagamento,
      stato,
      riferimentoTransazione,
      numeroRicevuta,
      riferimentoFattura,
      note,
      allegato,
      utenteCheHaRegistrato,
    });

    closeQuickRegisterModal();
  };

  if (!isQuickRegisterOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <Euro className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Registra Pagamento / Rata</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold">
                  Parziale & Totale
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Incasso, rateizzazione, versamenti parziali e tracciamento contabile.
              </p>
            </div>
          </div>

          <button
            onClick={closeQuickRegisterModal}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Athlete & Subscription Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Atleta *</span>
              </label>
              <select
                required
                value={atletaId}
                onChange={(e) => handleAthleteChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} ({a.fiscalCode || a.discipline || 'Atleta'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Abbonamento / Pacchetto</span>
              </label>
              <select
                value={abbonamentoId}
                onChange={(e) => handleSubscriptionChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">-- Nessun abbonamento associato / Personalizzato --</option>
                {subscriptions
                  .filter((s) => !atletaId || s.athleteId === atletaId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.packageName} (€{s.agreedPrice})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Package Name if custom & Installment Label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Descrizione Causale / Servizio
              </label>
              <input
                type="text"
                value={customPackageName}
                onChange={(e) => setCustomPackageName(e.target.value)}
                placeholder="es. Quota Abbonamento Gold, Carnet 10 Lezioni"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Numero della Rata / Causale</span>
              </label>
              <input
                type="text"
                value={numeroDellaRata}
                onChange={(e) => setNumeroDellaRata(e.target.value)}
                placeholder="es. Rata 1 di 3, Acconto Iniziale, Quota Unica"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Amounts Box: Importo Previsto, Importo Pagato, Importo Residuo */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Euro className="w-4 h-4" />
                <span>Calcolo Importi e Pagamento Parziale</span>
              </span>
              <span className="text-[11px] text-zinc-400">
                Residuo calcolato automaticamente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Importo Previsto (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={importoPrevisto}
                  onChange={(e) =>
                    setImportoPrevisto(
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Importo Pagato (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={importoPagato}
                  onChange={(e) =>
                    handlePaidAmountChange(
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  className="w-full bg-zinc-950 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Importo Residuo (€)
                </label>
                <div
                  className={`w-full px-3 py-2 text-sm font-black rounded-xl border flex items-center justify-between ${
                    residuo > 0
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  <span>€ {residuo.toFixed(2)}</span>
                  {residuo > 0 ? (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20">
                      Parziale
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20">
                      Saldato
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Example snippet callout if partial */}
            {residuo > 0 && numPagato > 0 && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Pagamento parziale:</strong> Previsto €{numPrevisto.toFixed(2)} — Pagato €
                  {numPagato.toFixed(2)} — <strong>Residuo da incassare: €{residuo.toFixed(2)}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Dates & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Data Scadenza *</span>
              </label>
              <input
                type="date"
                required
                value={dataDiScadenza}
                onChange={(e) => setDataDiScadenza(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Data Pagamento</span>
              </label>
              <input
                type="date"
                value={dataDelPagamento}
                onChange={(e) => setDataDelPagamento(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Metodo di Pagamento *</span>
              </label>
              <select
                value={metodoDiPagamento}
                onChange={(e) => setMetodoDiPagamento(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="contanti">contanti</option>
                <option value="bonifico">bonifico</option>
                <option value="carta">carta</option>
                <option value="PayPal">PayPal</option>
                <option value="Stripe">Stripe</option>
                <option value="addebito automatico">addebito automatico</option>
                <option value="assegno">assegno</option>
                <option value="altro">altro</option>
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Stato del Pagamento *
              </label>
              <select
                value={stato}
                onChange={(e) => setStato(e.target.value as PaymentStatus)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 capitalize"
              >
                <option value="programmato">programmato</option>
                <option value="in scadenza">in scadenza</option>
                <option value="da pagare">da pagare</option>
                <option value="pagato">pagato</option>
                <option value="pagato parzialmente">pagato parzialmente</option>
                <option value="scaduto">scaduto</option>
                <option value="sollecitato">sollecitato</option>
                <option value="fallito">fallito</option>
                <option value="annullato">annullato</option>
                <option value="rimborsato">rimborsato</option>
                <option value="parzialmente rimborsato">parzialmente rimborsato</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Utente / Operatore Registro</span>
              </label>
              <input
                type="text"
                value={utenteCheHaRegistrato}
                onChange={(e) => setUtenteCheHaRegistrato(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* References & Document Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Riferimento Transazione
              </label>
              <input
                type="text"
                value={riferimentoTransazione}
                onChange={(e) => setRiferimentoTransazione(e.target.value)}
                placeholder="es. TRX-982301, CRO, POS ID"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Numero Ricevuta
              </label>
              <input
                type="text"
                value={numeroRicevuta}
                onChange={(e) => setNumeroRicevuta(e.target.value)}
                placeholder="es. RIC-2026-089"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Riferimento Fattura
              </label>
              <input
                type="text"
                value={riferimentoFattura}
                onChange={(e) => setRiferimentoFattura(e.target.value)}
                placeholder="es. FAT-2026-042"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Notes & File Attachment */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Note Amministrative
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Annotazioni su acconti, accordi di rateizzazione o comunicazioni..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                <span>Allegato (Ricevuta, Contabile Bonifico, Scontrino)</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-semibold flex items-center gap-2 transition-colors">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  <span>Carica File</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                </label>

                <input
                  type="text"
                  value={allegato}
                  onChange={(e) => setAllegato(e.target.value)}
                  placeholder="Nome file o link dell'allegato"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              {allegato && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <FileCheck className="w-3.5 h-3.5" /> Allegato presente: {allegato}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeQuickRegisterModal}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
            >
              Annulla
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Salva e Registra Pagamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
