import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  Filter,
  User,
  Package,
  Calendar,
  Euro,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  PhoneCall,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { AthleteRenewal, RenewalStatus, SubscriptionPause } from '../types';
import { useRenewals } from '../context/RenewalsContext';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmRenewalModal } from '../components/renewals/ConfirmRenewalModal';
import { PauseModal } from '../components/renewals/PauseModal';
import { NewRenewalModal } from '../components/renewals/NewRenewalModal';
import { PAYMENT_STATUS_MAP } from '../lib/athleteHelpers';

export const RinnoviPage: React.FC = () => {
  const { renewals, pauses, updateRenewalStatus, deleteRenewal, deletePause } = useRenewals();
  const { athletes } = useAthletes();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'rinnovi' | 'pause'>('rinnovi');
  const [statusFilter, setStatusFilter] = useState<string>('tutti');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [confirmModalRenewal, setConfirmModalRenewal] = useState<AthleteRenewal | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const [isPauseModalOpen, setIsPauseModalOpen] = useState<boolean>(false);
  const [isNewRenewalModalOpen, setIsNewRenewalModalOpen] = useState<boolean>(false);

  // Filter renewals
  const filteredRenewals = renewals.filter((r) => {
    const matchesSearch =
      r.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.currentPackageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.coachName && r.coachName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.responsibleName && r.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'tutti') return true;
    if (statusFilter === 'da_contattare') return r.status === 'da contattare';
    if (statusFilter === 'in_trattativa')
      return ['contattato', 'interessato', 'in valutazione'].includes(r.status);
    if (statusFilter === 'confermati')
      return ['confermato', 'rinnovato'].includes(r.status);
    if (statusFilter === 'persi_rinviati')
      return ['non rinnovato', 'irraggiungibile', 'rinviato'].includes(r.status);

    return true;
  });

  // Badge colors for renewal status
  const getRenewalStatusBadge = (status: RenewalStatus) => {
    switch (status) {
      case 'da contattare':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'contattato':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'interessato':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-semibold';
      case 'in valutazione':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold';
      case 'confermato':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold';
      case 'rinnovato':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold';
      case 'non rinnovato':
        return 'bg-red-500/15 text-red-400 border-red-500/30 font-semibold';
      case 'irraggiungibile':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case 'rinviato':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  // Badge for days remaining
  const renderDaysBadge = (days: number) => {
    if (days < 0) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
          Scaduto da {Math.abs(days)} gg
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Scade Oggi!
        </span>
      );
    }
    if (days <= 14) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          {days} gg rimasti
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
        {days} gg rimasti
      </span>
    );
  };

  const handleStatusChange = (renewal: AthleteRenewal, newStatus: RenewalStatus) => {
    updateRenewalStatus(renewal.id, newStatus);
    if (newStatus === 'confermato' || newStatus === 'rinnovato') {
      setConfirmModalRenewal(renewal);
      setIsConfirmModalOpen(true);
    }
  };

  const openConfirmModal = (renewal: AthleteRenewal) => {
    setConfirmModalRenewal(renewal);
    setIsConfirmModalOpen(true);
  };

  // KPIs
  const totalCount = renewals.length;
  const inNegotiationCount = renewals.filter((r) =>
    ['contattato', 'interessato', 'in valutazione'].includes(r.status)
  ).length;
  const renewedCount = renewals.filter((r) =>
    ['confermato', 'rinnovato'].includes(r.status)
  ).length;
  const retentionRate =
    totalCount > 0 ? Math.round((renewedCount / totalCount) * 100) : 0;
  const activePausesCount = pauses.length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span>Modulo Rinnovi e Retention</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Automation Live
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pianificazione proposte di rinnovo, monitoraggio trattative e gestione pause abbonamenti.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-registra-pausa-main"
            onClick={() => setIsPauseModalOpen(true)}
            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md hover:border-amber-500/50"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>Gestisci Pausa</span>
          </button>

          <button
            id="btn-nuovo-rinnovo-main"
            onClick={() => setIsNewRenewalModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuovo Rinnovo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Rinnovi In Gestione
            </p>
            <p className="text-2xl font-black text-zinc-100 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-300">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Tasso di Retention
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{retentionRate}%</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              In Trattativa
            </p>
            <p className="text-2xl font-black text-amber-400 mt-1">{inNegotiationCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Pause Registrate
            </p>
            <p className="text-2xl font-black text-sky-400 mt-1">{activePausesCount}</p>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <PauseCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Module Tabs (Rinnovi vs Pause) */}
      <div className="flex border-b border-zinc-800 gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('rinnovi')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'rinnovi'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Proposte e Rinnovi ({renewals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pause')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'pause'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PauseCircle className="w-4 h-4" />
          <span>Gestione Pause e Sospensioni ({pauses.length})</span>
        </button>
      </div>

      {activeTab === 'rinnovi' ? (
        <>
          {/* Controls: Sub-filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('tutti')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'tutti'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Tutti ({renewals.length})
              </button>
              <button
                onClick={() => setStatusFilter('da_contattare')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'da_contattare'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Da Contattare
              </button>
              <button
                onClick={() => setStatusFilter('in_trattativa')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'in_trattativa'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                In Trattativa
              </button>
              <button
                onClick={() => setStatusFilter('confermati')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'confermati'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Confermati / Rinnovati
              </button>
              <button
                onClick={() => setStatusFilter('persi_rinviati')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'persi_rinviati'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Persi / Rinviati
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca atleta, pacchetto, coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Table View */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Atleta</th>
                    <th className="p-3.5">Pacchetto Attuale</th>
                    <th className="p-3.5">Prezzo</th>
                    <th className="p-3.5">Coach</th>
                    <th className="p-3.5">Scadenza & Giorni</th>
                    <th className="p-3.5">Situazione Pagamenti</th>
                    <th className="p-3.5">Ultima Comunicazione</th>
                    <th className="p-3.5">Prossima Azione</th>
                    <th className="p-3.5">Responsabile</th>
                    <th className="p-3.5">Stato Rinnovo</th>
                    <th className="p-3.5 text-right pr-4">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {filteredRenewals.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-zinc-500">
                        Nessun rinnovo trovato con i filtri selezionati.
                      </td>
                    </tr>
                  ) : (
                    filteredRenewals.map((r) => {
                      const payMeta =
                        PAYMENT_STATUS_MAP[r.paymentStatus] || {
                          label: r.paymentStatus,
                          badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                        };

                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-zinc-800/40 transition-colors group"
                        >
                          {/* Atleta */}
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                                {r.athleteName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-100">{r.athleteName}</p>
                                <p className="text-[10px] text-zinc-500">ID: {r.athleteId}</p>
                              </div>
                            </div>
                          </td>

                          {/* Pacchetto attuale */}
                          <td className="p-3.5 font-medium text-zinc-300">
                            {r.currentPackageName}
                          </td>

                          {/* Prezzo */}
                          <td className="p-3.5 font-bold text-amber-400">
                            €{r.price}
                          </td>

                          {/* Coach */}
                          <td className="p-3.5 text-zinc-400">
                            {r.coachName || 'Non Assegnato'}
                          </td>

                          {/* Scadenza & Giorni Mancanti */}
                          <td className="p-3.5 space-y-1">
                            <p className="font-semibold text-zinc-200">{r.endDate}</p>
                            <div>{renderDaysBadge(r.daysRemaining)}</div>
                          </td>

                          {/* Situazione pagamenti */}
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${payMeta.badgeClass}`}
                            >
                              {payMeta.label}
                            </span>
                          </td>

                          {/* Ultima comunicazione */}
                          <td className="p-3.5 max-w-[180px]">
                            <p className="text-zinc-400 text-[11px] line-clamp-2">
                              {r.lastCommunicationNote || 'Nessuna nota'}
                            </p>
                            {r.lastCommunicationDate && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {r.lastCommunicationDate}
                              </span>
                            )}
                          </td>

                          {/* Prossima azione */}
                          <td className="p-3.5 max-w-[180px]">
                            <p className="font-semibold text-amber-300 text-[11px] line-clamp-2">
                              {r.nextAction || 'Pianificare contatto'}
                            </p>
                            {r.nextActionDate && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                Entro: {r.nextActionDate}
                              </span>
                            )}
                          </td>

                          {/* Responsabile */}
                          <td className="p-3.5 font-medium text-zinc-300">
                            {r.responsibleName || 'Non Assegnato'}
                          </td>

                          {/* Stato del Rinnovo (Interactive Dropdown) */}
                          <td className="p-3.5">
                            <select
                              value={r.status}
                              onChange={(e) =>
                                handleStatusChange(r, e.target.value as RenewalStatus)
                              }
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border focus:outline-none cursor-pointer ${getRenewalStatusBadge(
                                r.status
                              )}`}
                            >
                              <option value="da contattare">da contattare</option>
                              <option value="contattato">contattato</option>
                              <option value="interessato">interessato</option>
                              <option value="in valutazione">in valutazione</option>
                              <option value="confermato">confermato</option>
                              <option value="rinnovato">rinnovato</option>
                              <option value="non rinnovato">non rinnovato</option>
                              <option value="irraggiungibile">irraggiungibile</option>
                              <option value="rinviato">rinviato</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openConfirmModal(r)}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                                title="Conferma e Attiva Rinnovo"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Conferma</span>
                              </button>

                              <button
                                onClick={() => deleteRenewal(r.id)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Elimina Scheda Rinnovo"
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
        </>
      ) : (
        /* Pause Tab View */
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <PauseCircle className="w-5 h-5 text-amber-400" />
                  <span>Elenco Pause e Sospensioni Registrate</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Storico completo delle pause concesse con dettaglio proroghe e gestione rate.
                </p>
              </div>

              <button
                onClick={() => setIsPauseModalOpen(true)}
                className="px-3.5 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nuova Pausa</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="p-3">Atleta</th>
                    <th className="p-3">Periodo Pausa</th>
                    <th className="p-3">Giorni</th>
                    <th className="p-3">Motivazione</th>
                    <th className="p-3">Azione Scadenza</th>
                    <th className="p-3">Azione Rate</th>
                    <th className="p-3">Autorizzato da</th>
                    <th className="p-3 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {pauses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-500">
                        Nessuna pausa registrata al momento.
                      </td>
                    </tr>
                  ) : (
                    pauses.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3 font-bold text-zinc-200">{p.athleteName}</td>
                        <td className="p-3 font-mono text-zinc-300">
                          {p.startDate} → {p.expectedEndDate}
                        </td>
                        <td className="p-3 font-bold text-amber-400">{p.pauseDays} gg</td>
                        <td className="p-3 text-zinc-300">{p.reason}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {p.expiryOption === 'proroga'
                              ? `Prorogata (+${p.pauseDays}gg)`
                              : 'Invariata'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                            {p.installmentsOption}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">{p.authorization}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deletePause(p.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* Modals */}
      <ConfirmRenewalModal
        renewal={confirmModalRenewal}
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      />

      <PauseModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
      />

      <NewRenewalModal
        isOpen={isNewRenewalModalOpen}
        onClose={() => setIsNewRenewalModalOpen(false)}
      />
    </div>
  );
};
