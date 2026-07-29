import React, { useState } from 'react';
import {
  Clock,
  Euro,
  Plus,
  User,
  Calendar,
  FileCheck,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { usePayments } from '../context/PaymentsContext';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { calculatePaymentStatus, isPaymentSuspended } from '../lib/statusEngine';

export const ScadenzePage: React.FC = () => {
  const { payments, openQuickRegisterModal, triggerSystemStatusRecalculation } = usePayments();
  const { athletes } = useAthletes();
  const { user } = useAuth();

  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await triggerSystemStatusRecalculation(user?.fullName || 'Amministratore');
    } finally {
      setIsRecalculating(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'rate' | 'certificati'>('rate');

  // Filter payments that are due or overdue or pending
  const today = new Date().toISOString().split('T')[0];
  const duePayments = payments
    .filter((payment) => !isPaymentSuspended(payment, today))
    .map((payment) => ({ ...payment, stato: calculatePaymentStatus(payment, today) }))
    .filter(
      (payment) =>
        payment.stato === 'scaduto' ||
        payment.stato === 'in scadenza' ||
        payment.stato === 'da pagare' ||
        payment.stato === 'pagato parzialmente' ||
        payment.stato === 'sollecitato'
    );

  // Filter athletes with expiring or expired medical certificates
  const expiringMedical = athletes.filter((a) => {
    if (!a.medicalCertificateExpiry) return true; // missing
    return a.medicalCertificateExpiry <= '2026-12-31';
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Scadenziario e Solleciti</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold">
              Amministrazione
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitoraggio in tempo reale di rate in scadenza, pagamenti parziali da saldare e idoneità mediche.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-ricalcola-stati-scadenze"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md hover:border-amber-500/50 disabled:opacity-50"
            title="Esegui ricalcolo automatico di pagamenti, abbonamenti e atleti"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Ricalcolo...' : 'Ricalcola Stati'}</span>
          </button>

          <button
            id="btn-registra-pagamento-scadenze"
            onClick={() => openQuickRegisterModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registra Pagamento</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('rate')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'rate'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Euro className="w-3.5 h-3.5" />
          <span>Rate & Incassi in Scadenza ({duePayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificati')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'certificati'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Certificati Medici ({expiringMedical.length})</span>
        </button>
      </div>

      {/* Tab 1: Rate & Incassi in Scadenza */}
      {activeTab === 'rate' ? (
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Atleta</th>
                    <th className="px-4 py-3">Causale / Rata</th>
                    <th className="px-4 py-3">Scadenza</th>
                    <th className="px-4 py-3">Importo Previsto</th>
                    <th className="px-4 py-3">Residuo da Saldare</th>
                    <th className="px-4 py-3">Stato</th>
                    <th className="px-4 py-3 text-right">Azione Rapida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {duePayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        Nessuna rata o pagamento in scadenza.
                      </td>
                    </tr>
                  ) : (
                    duePayments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>{p.atletaNome}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-300">
                          {p.abbonamentoNome || 'Quota Abbonamento'} —{' '}
                          <span className="text-zinc-400">{p.numeroDellaRata || 'Rata'}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{p.dataDiScadenza}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-zinc-200">
                          € {p.importoPrevisto.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-black text-amber-400">
                          € {p.importoResiduo.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.stato === 'scaduto' || p.stato === 'sollecitato'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {p.stato}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              openQuickRegisterModal({
                                atletaId: p.atletaId,
                                abbonamentoId: p.abbonamentoId,
                                paymentId: p.id,
                              })
                            }
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 ml-auto"
                          >
                            <Euro className="w-3.5 h-3.5" />
                            <span>Registra Pagamento</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Certificati Medici */
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Stato Certificati Idoneità Sportiva</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Scadenza documentale medica obbligatoria per la pratica atletica.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiringMedical.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-amber-400 text-sm">
                    {a.firstName[0]}
                    {a.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {a.firstName} {a.lastName}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Scadenza certificato: <strong className="text-amber-400">{a.medicalCertificateExpiry || 'Mancante'}</strong>
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">
                  In Rinnovo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
