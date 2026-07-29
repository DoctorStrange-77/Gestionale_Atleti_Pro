import React, { useState } from 'react';
import {
  Euro,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  FileText,
  User,
  Paperclip,
  ArrowUpRight,
  TrendingUp,
  History,
  ShieldCheck,
  Building,
  CreditCard,
  Hash,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentsContext';
import { RoleGuard } from '../components/auth/RoleGuard';
import { PaymentRecord, PaymentStatus, PaymentMethod } from '../types';

export const PagamentiPage: React.FC = () => {
  const { user } = useAuth();
  const {
    payments,
    auditLogs,
    openQuickRegisterModal,
    deletePaymentRecord,
    triggerSystemStatusRecalculation,
  } = usePayments();

  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await triggerSystemStatusRecalculation(user?.fullName || 'Amministratore');
    } finally {
      setIsRecalculating(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'tutti' | 'parziali' | 'audit'>('tutti');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tutti');
  const [methodFilter, setMethodFilter] = useState<string>('tutti');
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<PaymentRecord | null>(null);

  // Financial KPI calculations
  const totalIncassato = payments.reduce((acc, p) => acc + (p.importoPagato || 0), 0);
  const totalResiduoInAttesa = payments.reduce(
    (acc, p) =>
      p.stato !== 'annullato' && p.stato !== 'rimborsato' && p.stato !== 'fallito'
        ? acc + (p.importoResiduo || 0)
        : acc,
    0
  );
  const totalInsolutiScaduti = payments
    .filter((p) => p.stato === 'scaduto' || p.stato === 'sollecitato' || p.stato === 'fallito')
    .reduce((acc, p) => acc + (p.importoResiduo || p.importoPrevisto), 0);

  const totalParzialiCount = payments.filter((p) => p.stato === 'pagato parzialmente' || p.importoResiduo > 0 && p.importoPagato > 0).length;

  // Filtering
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.atletaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.abbonamentoNome && p.abbonamentoNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.numeroRicevuta && p.numeroRicevuta.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.riferimentoFattura && p.riferimentoFattura.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.riferimentoTransazione && p.riferimentoTransazione.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'tutti' || p.stato === statusFilter;
    const matchesMethod = methodFilter === 'tutti' || p.metodoDiPagamento === methodFilter;

    if (activeTab === 'parziali') {
      return (
        matchesSearch &&
        (p.stato === 'pagato parzialmente' || (p.importoPagato > 0 && p.importoResiduo > 0))
      );
    }

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'pagato':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Pagato
          </span>
        );
      case 'pagato parzialmente':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Pagato Parzialmente
          </span>
        );
      case 'scaduto':
      case 'fallito':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> {status}
          </span>
        );
      case 'sollecitato':
        return (
          <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> Sollecitato
          </span>
        );
      case 'in scadenza':
      case 'da pagare':
      case 'programmato':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case 'rimborsato':
      case 'parzialmente rimborsato':
      case 'annullato':
        return (
          <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <RoleGuard requireFinancials={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <Euro className="w-5 h-5 text-amber-400" />
                <span>Gestione Pagamenti, Rate e Incassi</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                Modulo Amministrativo
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Monitoraggio incassi, rateizzazioni, versamenti parziali e registro attività economiche per <strong className="text-white">{user?.organizationName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-ricalcola-stati-pagamenti"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md hover:border-amber-500/50 disabled:opacity-50"
              title="Calcola automaticamente e aggiorna gli stati di pagamenti, abbonamenti e atleti in modo sicuro"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Ricalcolo...' : 'Ricalcola Stati'}</span>
            </button>

            <button
              id="btn-registra-pagamento-main"
              onClick={() => openQuickRegisterModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registra Pagamento</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-semibold">Totale Incassato</p>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400">€ {totalIncassato.toFixed(2)}</p>
            <p className="text-[10px] text-zinc-500">{payments.filter((p) => p.importoPagato > 0).length} transazioni registrate</p>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-semibold">Residuo da Incassare</p>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-400">€ {totalResiduoInAttesa.toFixed(2)}</p>
            <p className="text-[10px] text-zinc-400">{totalParzialiCount} pagamenti parziali attivi</p>
          </div>

          <div className="p-5 bg-zinc-950 border border-red-900/50 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Insoluti / Scaduti
              </p>
              <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-red-400">€ {totalInsolutiScaduti.toFixed(2)}</p>
            <p className="text-[10px] text-red-400 font-semibold">Insoluti da solleticare</p>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-semibold">Registro Attività</p>
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                <History className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-zinc-100">{auditLogs.length}</p>
            <p className="text-[10px] text-zinc-400">Modifiche economiche tracciate</p>
          </div>
        </div>

        {/* View Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('tutti')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tutti'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Euro className="w-3.5 h-3.5" />
            <span>Tutti i Pagamenti ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parziali')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'parziali'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pagamenti Parziali ({totalParzialiCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Registro Attività Economiche ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1 & Tab 2: Payments Tables */}
        {activeTab !== 'audit' ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-4">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca per atleta, causale, ricevuta, fattura..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {activeTab === 'tutti' && (
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-zinc-500 font-semibold">Stato:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
                    >
                      <option value="tutti">Tutti gli stati</option>
                      <option value="pagato">pagato</option>
                      <option value="pagato parzialmente">pagato parzialmente</option>
                      <option value="da pagare">da pagare</option>
                      <option value="in scadenza">in scadenza</option>
                      <option value="scaduto">scaduto</option>
                      <option value="sollecitato">sollecitato</option>
                      <option value="fallito">fallito</option>
                      <option value="annullato">annullato</option>
                      <option value="rimborsato">rimborsato</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-zinc-500 font-semibold">Metodo:</span>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="tutti">Tutti i metodi</option>
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Atleta & Abbonamento</th>
                    <th className="px-4 py-3">Rata / Causale</th>
                    <th className="px-4 py-3">Previsto / Pagato</th>
                    <th className="px-4 py-3">Residuo</th>
                    <th className="px-4 py-3">Metodo & Date</th>
                    <th className="px-4 py-3">Stato</th>
                    <th className="px-4 py-3">Operatore</th>
                    <th className="px-4 py-3 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                        Nessun pagamento o rata trovata con i filtri correnti.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const percentPaid =
                        p.importoPrevisto > 0
                          ? Math.min(100, Math.round((p.importoPagato / p.importoPrevisto) * 100))
                          : 100;

                      return (
                        <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-amber-400" />
                              <span>{p.atletaNome}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <FileText className="w-3 h-3 text-zinc-500" />
                              <span>{p.abbonamentoNome || 'Pagamento Generico'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-semibold text-zinc-200">{p.numeroDellaRata || 'Quota Unica'}</span>
                            {p.numeroRicevuta && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {p.numeroRicevuta}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-black text-amber-400">€ {p.importoPagato.toFixed(2)}</div>
                            <div className="text-[10px] text-zinc-400">su € {p.importoPrevisto.toFixed(2)} previsti</div>
                          </td>

                          <td className="px-4 py-3">
                            <div
                              className={`font-black ${
                                p.importoResiduo > 0 ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              € {p.importoResiduo.toFixed(2)}
                            </div>
                            {p.importoPrevisto > 0 && (
                              <div className="w-20 bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    percentPaid === 100 ? 'bg-emerald-400' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${percentPaid}%` }}
                                />
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="capitalize text-zinc-300 font-medium">
                              {p.metodoDiPagamento || 'N/D'}
                            </div>
                            <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              <span>Scad: {p.dataDiScadenza}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">{getStatusBadge(p.stato)}</td>

                          <td className="px-4 py-3">
                            <span className="text-[11px] text-zinc-400">{p.utenteCheHaRegistrato || 'Amministratore'}</span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                title="Visualizza Dettagli Completi"
                                onClick={() => setSelectedPaymentDetail(p)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-800"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                title="Registra o Aggiorna Incasso"
                                onClick={() =>
                                  openQuickRegisterModal({
                                    atletaId: p.atletaId,
                                    abbonamentoId: p.abbonamentoId,
                                    paymentId: p.id,
                                  })
                                }
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                              >
                                <Euro className="w-3 h-3" />
                                <span>Salda / Edit</span>
                              </button>

                              <button
                                title="Elimina Registro"
                                onClick={() => {
                                  if (confirm('Sicuro di voler eliminare questo registro economico?')) {
                                    deletePaymentRecord(p.id);
                                  }
                                }}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg transition-colors border border-red-900/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Tab 3: Registro Attività Economiche (Audit Log) */
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Registro Audit Modifiche Economiche</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Ogni modifica economica è tracciata con valore precedente, nuovo valore, autore, data e ora.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                Tracciabilità Immutabile
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Nessuna modifica economica registrata nell'audit log.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase rounded">
                          {log.azione}
                        </span>
                        <strong className="text-xs text-white">{log.atletaNome}</strong>
                        {log.abbonamentoNome && (
                          <span className="text-[11px] text-zinc-400">({log.abbonamentoNome})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1 font-semibold text-zinc-300">
                          <User className="w-3 h-3 text-amber-400" />
                          {log.autore}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {log.data} alle {log.ora}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-lg">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-0.5">
                          Valore Precedente:
                        </span>
                        <p className="text-zinc-400 font-mono text-[11px]">{log.valorePrecedente}</p>
                      </div>

                      <div className="p-2.5 bg-zinc-950/80 border border-emerald-900/40 rounded-lg">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                          Nuovo Valore:
                        </span>
                        <p className="text-emerald-300 font-mono text-[11px]">{log.nuovoValore}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Detailed Slide-over Modal for Selected Payment */}
        {selectedPaymentDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-zinc-100">
                    Dettaglio Scheda Pagamento
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPaymentDetail(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                  <p className="text-zinc-400">Atleta: <strong className="text-white">{selectedPaymentDetail.atletaNome}</strong></p>
                  <p className="text-zinc-400">Abbonamento: <strong className="text-amber-400">{selectedPaymentDetail.abbonamentoNome || 'Generico'}</strong></p>
                  <p className="text-zinc-400">Rata / Causale: <strong className="text-zinc-200">{selectedPaymentDetail.numeroDellaRata || 'Quota Unica'}</strong></p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Previsto</span>
                    <p className="font-black text-zinc-200">€{selectedPaymentDetail.importoPrevisto.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 uppercase font-bold">Pagato</span>
                    <p className="font-black text-amber-400">€{selectedPaymentDetail.importoPagato.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-500 uppercase font-bold">Residuo</span>
                    <p className="font-black text-emerald-400">€{selectedPaymentDetail.importoResiduo.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-zinc-300">
                  <p><strong>Stato:</strong> {selectedPaymentDetail.stato}</p>
                  <p><strong>Metodo di Pagamento:</strong> {selectedPaymentDetail.metodoDiPagamento || 'N/D'}</p>
                  <p><strong>Data Scadenza:</strong> {selectedPaymentDetail.dataDiScadenza}</p>
                  {selectedPaymentDetail.dataDelPagamento && (
                    <p><strong>Data Pagamento:</strong> {selectedPaymentDetail.dataDelPagamento}</p>
                  )}
                  {selectedPaymentDetail.riferimentoTransazione && (
                    <p><strong>Rif. Transazione:</strong> {selectedPaymentDetail.riferimentoTransazione}</p>
                  )}
                  {selectedPaymentDetail.numeroRicevuta && (
                    <p><strong>N° Ricevuta:</strong> {selectedPaymentDetail.numeroRicevuta}</p>
                  )}
                  {selectedPaymentDetail.riferimentoFattura && (
                    <p><strong>Rif. Fattura:</strong> {selectedPaymentDetail.riferimentoFattura}</p>
                  )}
                  <p><strong>Operatore Registro:</strong> {selectedPaymentDetail.utenteCheHaRegistrato || 'Amministratore'}</p>
                  {selectedPaymentDetail.note && (
                    <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 mt-2">
                      <p className="text-[11px] text-zinc-400 italic">"{selectedPaymentDetail.note}"</p>
                    </div>
                  )}
                  {selectedPaymentDetail.allegato && (
                    <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center justify-between mt-2">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        {selectedPaymentDetail.allegato}
                      </span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Download allegato: ${selectedPaymentDetail.allegato}`);
                        }}
                        className="text-amber-400 hover:underline font-bold"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setSelectedPaymentDetail(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
