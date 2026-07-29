import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  CheckSquare,
  ChevronRight,
  Euro,
  PhoneCall,
} from 'lucide-react';
import {
  Athlete,
  AthleteSubscription,
  PaymentRecord,
  AthleteRenewal,
  Task,
  DocumentAlert,
  AthleteDocument,
} from '../../types';
import { isValidPayment } from '../../utils/dashboardCalculations';
import { isPaymentSuspended } from '../../lib/statusEngine';

export type QuickSectionKey =
  | 'scadenze_oggi'
  | 'prossimi_7gg'
  | 'prossimi_15gg'
  | 'prossimi_30gg'
  | 'insoluti'
  | 'rinnovi_da_gestire'
  | 'documenti_mancanti'
  | 'attivita_scadute';

interface QuickSectionsWidgetProps {
  athletes: Athlete[];
  subscriptions: AthleteSubscription[];
  payments: PaymentRecord[];
  renewals: AthleteRenewal[];
  tasks: Task[];
  documents: AthleteDocument[];
  alerts: DocumentAlert[];
  onNavigate: (tab: string, extra?: any) => void;
  openQuickRegisterModal: (data?: any) => void;
}

export const QuickSectionsWidget: React.FC<QuickSectionsWidgetProps> = ({
  subscriptions,
  payments,
  renewals,
  tasks,
  alerts,
  onNavigate,
  openQuickRegisterModal,
}) => {
  const [activeTab, setActiveTab] = useState<QuickSectionKey>('scadenze_oggi');

  const todayStr = new Date().toISOString().split('T')[0];

  const getFutureDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const day7Str = getFutureDateStr(7);
  const day15Str = getFutureDateStr(15);
  const day30Str = getFutureDateStr(30);

  const validPayments = payments.filter(
    (payment) => isValidPayment(payment) && !isPaymentSuspended(payment, todayStr)
  );

  // 1. Scadenze di oggi
  const paymentsOggi = validPayments.filter(
    (p) => p.dataDiScadenza === todayStr && p.stato !== 'pagato'
  );
  const subsOggi = subscriptions.filter(
    (s) => s.endDate === todayStr && s.status !== 'annullato'
  );

  // 2. Prossimi 7 giorni
  const payments7gg = validPayments.filter(
    (p) => p.dataDiScadenza > todayStr && p.dataDiScadenza <= day7Str && p.stato !== 'pagato'
  );
  const subs7gg = subscriptions.filter(
    (s) => s.endDate > todayStr && s.endDate <= day7Str && s.status !== 'annullato'
  );

  // 3. Prossimi 15 giorni
  const payments15gg = validPayments.filter(
    (p) => p.dataDiScadenza > todayStr && p.dataDiScadenza <= day15Str && p.stato !== 'pagato'
  );
  const subs15gg = subscriptions.filter(
    (s) => s.endDate > todayStr && s.endDate <= day15Str && s.status !== 'annullato'
  );

  // 4. Prossimi 30 giorni
  const payments30gg = validPayments.filter(
    (p) => p.dataDiScadenza > todayStr && p.dataDiScadenza <= day30Str && p.stato !== 'pagato'
  );
  const subs30gg = subscriptions.filter(
    (s) => s.endDate > todayStr && s.endDate <= day30Str && s.status !== 'annullato'
  );

  // 5. Insoluti
  const insolutiList = validPayments.filter(
    (p) =>
      (p.stato === 'scaduto' || (p.dataDiScadenza < todayStr && p.stato !== 'pagato')) &&
      (p.importoResiduo || 0) > 0
  );

  // 6. Rinnovi da gestire
  const rinnoviDaGestire = renewals.filter(
    (r) =>
      r.status === 'da contattare' ||
      r.status === 'contattato' ||
      r.status === 'interessato' ||
      r.status === 'in valutazione'
  );

  // 7. Documenti mancanti / alert
  const docsMancanti = alerts;

  // 8. Attività scadute
  const attivitaScadute = tasks.filter(
    (t) => t.dueDate < todayStr && t.status !== 'completata' && t.status !== 'annullata'
  );

  const tabs: { key: QuickSectionKey; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'scadenze_oggi',
      label: 'Scadenze Oggi',
      count: paymentsOggi.length + subsOggi.length,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      key: 'prossimi_7gg',
      label: '7 Giorni',
      count: payments7gg.length + subs7gg.length,
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      key: 'prossimi_15gg',
      label: '15 Giorni',
      count: payments15gg.length + subs15gg.length,
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      key: 'prossimi_30gg',
      label: '30 Giorni',
      count: payments30gg.length + subs30gg.length,
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      key: 'insoluti',
      label: 'Insoluti',
      count: insolutiList.length,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
    },
    {
      key: 'rinnovi_da_gestire',
      label: 'Rinnovi',
      count: rinnoviDaGestire.length,
      icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      key: 'documenti_mancanti',
      label: 'Doc. Mancanti',
      count: docsMancanti.length,
      icon: <FileText className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      key: 'attivita_scadute',
      label: 'Attività Scadute',
      count: attivitaScadute.length,
      icon: <CheckSquare className="w-3.5 h-3.5 text-rose-400" />,
    },
  ];

  return (
    <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Sezioni Rapide e Scadenze Operative</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitora priorità, insoluti e attività che richiedono azione immediata.
          </p>
        </div>
      </div>

      {/* Tabs list horizontal scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-950/70 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content List */}
      <div className="space-y-2 min-h-[220px] max-h-[380px] overflow-y-auto pr-1">
        {/* Render for Scadenze Oggi, 7, 15, 30 days */}
        {(activeTab === 'scadenze_oggi' ||
          activeTab === 'prossimi_7gg' ||
          activeTab === 'prossimi_15gg' ||
          activeTab === 'prossimi_30gg') && (() => {
          let payList = paymentsOggi;
          let subList = subsOggi;
          if (activeTab === 'prossimi_7gg') {
            payList = payments7gg;
            subList = subs7gg;
          } else if (activeTab === 'prossimi_15gg') {
            payList = payments15gg;
            subList = subs15gg;
          } else if (activeTab === 'prossimi_30gg') {
            payList = payments30gg;
            subList = subs30gg;
          }

          if (payList.length === 0 && subList.length === 0) {
            return (
              <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/80 my-4">
                <p className="text-xs font-semibold text-zinc-400">Nessuna scadenza trovata per questo intervallo</p>
                <p className="text-[11px] text-zinc-500 mt-1">Tutto regolare nei tempi selezionati.</p>
              </div>
            );
          }

          return (
            <div className="space-y-2">
              {payList.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <Euro className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100">{p.atletaNome}</p>
                      <p className="text-[11px] text-zinc-400">
                        Rata: <strong className="text-zinc-200">€{p.importoResiduo || p.importoPrevisto}</strong> • Scadenza: {p.dataDiScadenza}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openQuickRegisterModal({ paymentId: p.id, atletaId: p.atletaId })}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Incassa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {subList.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100">{s.athleteName || 'Atleta'}</p>
                      <p className="text-[11px] text-zinc-400">
                        {s.packageName} • Fine: <strong className="text-amber-400">{s.endDate}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('rinnovi')}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs rounded-lg transition-colors border border-zinc-700 shrink-0"
                  >
                    Gestisci Rinnovo
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Insoluti */}
        {activeTab === 'insoluti' && (
          <div>
            {insolutiList.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/80 my-4">
                <p className="text-xs font-semibold text-emerald-400">Ottimo! Nessun insolito pendente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {insolutiList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-center justify-between gap-3 hover:border-red-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{p.atletaNome}</p>
                        <p className="text-[11px] text-zinc-400">
                          Insoluto: <span className="text-red-400 font-bold">€{p.importoResiduo}</span> • Scaduto il {p.dataDiScadenza}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openQuickRegisterModal({ paymentId: p.id, atletaId: p.atletaId })}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors shrink-0"
                      >
                        Registra Incasso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rinnovi da gestire */}
        {activeTab === 'rinnovi_da_gestire' && (
          <div>
            {rinnoviDaGestire.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/80 my-4">
                <p className="text-xs font-semibold text-zinc-400">Nessun rinnovo in attesa di contatto</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rinnoviDaGestire.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{r.athleteName}</p>
                        <p className="text-[11px] text-zinc-400">
                          Pacchetto: {r.currentPackageName} • Stato: <span className="text-amber-400 uppercase font-semibold">{r.status}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('rinnovi')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-lg transition-colors border border-zinc-700 shrink-0"
                    >
                      Contatta / Gestisci
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documenti mancanti */}
        {activeTab === 'documenti_mancanti' && (
          <div>
            {docsMancanti.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/80 my-4">
                <p className="text-xs font-semibold text-emerald-400">Tutti i certificati e documenti sono in regola!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {docsMancanti.map((al) => (
                  <div
                    key={al.id}
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{al.athleteName}</p>
                        <p className="text-[11px] text-zinc-400">{al.title} - {al.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('documenti')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-lg transition-colors border border-zinc-700 shrink-0"
                    >
                      Carica Doc
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attività scadute */}
        {activeTab === 'attivita_scadute' && (
          <div>
            {attivitaScadute.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/80 my-4">
                <p className="text-xs font-semibold text-emerald-400">Nessuna attività o task in ritardo!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attivitaScadute.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{t.title}</p>
                        <p className="text-[11px] text-zinc-400">
                          Resp: {t.responsible} • Scaduto il: <span className="text-rose-400 font-bold">{t.dueDate}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('attivita')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-lg transition-colors border border-zinc-700 shrink-0"
                    >
                      Apri Task
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
