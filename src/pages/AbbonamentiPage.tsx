import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  ShieldAlert,
  Ban,
  RefreshCw,
  Calendar,
  DollarSign,
  User,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  List,
  History,
  TrendingUp,
  Receipt,
  Download,
  Trash2,
} from 'lucide-react';
import { AthleteSubscription, SubscriptionStatus } from '../types';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { useAthletes } from '../context/AthletesContext';
import { useToast } from '../context/ToastContext';
import { SubscriptionFormModal } from '../components/subscriptions/SubscriptionFormModal';
import { SubscriptionDetailModal } from '../components/subscriptions/SubscriptionDetailModal';

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  bozza: {
    label: 'Bozza',
    bg: 'bg-zinc-800',
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

export const AbbonamentiPage: React.FC = () => {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    toggleSubscriptionSuspension,
    cancelSubscription,
    renewSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const { athletes } = useAthletes();
  const { showSuccess, showInfo } = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('tutti');
  const [includeHistory, setIncludeHistory] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingSubscription, setEditingSubscription] = useState<AthleteSubscription | null>(null);
  const [detailSubscription, setDetailSubscription] = useState<AthleteSubscription | null>(null);
  const [renewingSubscription, setRenewingSubscription] = useState<AthleteSubscription | null>(null);

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        sub.packageName.toLowerCase().includes(search) ||
        (sub.athleteName && sub.athleteName.toLowerCase().includes(search)) ||
        (sub.notes && sub.notes.toLowerCase().includes(search));

      if (!matchesSearch) return false;

      // Status Filter
      if (statusFilter !== 'tutti' && sub.status !== statusFilter) {
        return false;
      }

      // History Filter
      if (!includeHistory && (sub.status === 'scaduto' || sub.status === 'annullato' || sub.status === 'rinnovato')) {
        return false;
      }

      return true;
    });
  }, [subscriptions, searchTerm, statusFilter, includeHistory]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = subscriptions.length;
    const activeCount = subscriptions.filter((s) => s.status === 'attivo').length;
    const expiringCount = subscriptions.filter((s) => s.status === 'in_scadenza').length;
    const suspendedCount = subscriptions.filter((s) => s.status === 'sospeso').length;

    const totalContractValue = subscriptions
      .filter((s) => s.status === 'attivo' || s.status === 'in_scadenza')
      .reduce((acc, s) => acc + s.agreedPrice, 0);

    const totalCollected = subscriptions.reduce((acc, s) => {
      const paidInSub = s.installments
        .filter((i) => i.status === 'pagato')
        .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);
      return acc + paidInSub;
    }, 0);

    return {
      totalCount,
      activeCount,
      expiringCount,
      suspendedCount,
      totalContractValue,
      totalCollected,
    };
  }, [subscriptions]);

  const handleCreateNew = () => {
    setEditingSubscription(null);
    setRenewingSubscription(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (sub: AthleteSubscription) => {
    setEditingSubscription(sub);
    setRenewingSubscription(null);
    setIsFormModalOpen(true);
  };

  const handleRenew = (sub: AthleteSubscription) => {
    setRenewingSubscription(sub);
    setEditingSubscription(null);
    setIsFormModalOpen(true);
  };

  const handleSaveSubscription = (
    data: Omit<AthleteSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingSubscription) {
      updateSubscription(editingSubscription.id, data);
      showSuccess('Abbonamento aggiornato con successo');
    } else if (renewingSubscription) {
      renewSubscription(renewingSubscription.id, data);
      showSuccess('Abbonamento rinnovato con successo. Vecchio contratto archiviato nello storico.');
    } else {
      addSubscription(data);
      showSuccess('Nuovo abbonamento assegnato ed attivato');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Gestione Abbonamenti & Rateizzazioni</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Assegnazione pacchetti, scadenziari rate, rinnovi e storico contratti atleti.
          </p>
        </div>

        <button
          id="btn-add-abbonamento"
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuovo Abbonamento Atleta</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Totale Contratti
          </span>
          <p className="text-xl font-black text-white">{stats.totalCount}</p>
          <span className="text-[10px] text-zinc-400">Incluso storico</span>
        </div>

        <div className="p-4 bg-zinc-900 border border-emerald-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            Attivi
          </span>
          <p className="text-xl font-black text-emerald-400">{stats.activeCount}</p>
          <span className="text-[10px] text-emerald-400/80">Regolari</span>
        </div>

        <div className="p-4 bg-zinc-900 border border-amber-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            In Scadenza
          </span>
          <p className="text-xl font-black text-amber-400">{stats.expiringCount}</p>
          <span className="text-[10px] text-amber-400/80">Entro 15 giorni</span>
        </div>

        <div className="p-4 bg-zinc-900 border border-purple-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
            Sospesi
          </span>
          <p className="text-xl font-black text-purple-400">{stats.suspendedCount}</p>
          <span className="text-[10px] text-purple-400/80">In pausa</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            Totale Incassato
          </span>
          <p className="text-xl font-black text-amber-400">€{stats.totalCollected.toFixed(2)}</p>
          <span className="text-[10px] text-zinc-400">Da tutte le rate</span>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Mode */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca atleta, pacchetto o note..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Status Filter Dropdown / Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Stato:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="tutti">Tutti gli Stati</option>
            <option value="attivo">Attivo</option>
            <option value="in_scadenza">In Scadenza</option>
            <option value="sospeso">Sospeso</option>
            <option value="scaduto">Scaduto</option>
            <option value="futuro">Futuro</option>
            <option value="bozza">Bozza</option>
            <option value="rinnovato">Rinnovato (Storico)</option>
            <option value="annullato">Annullato</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300 ml-2">
            <input
              type="checkbox"
              checked={includeHistory}
              onChange={(e) => setIncludeHistory(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-zinc-400" /> Storico Vecchi Abbonamenti
            </span>
          </label>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main List Display */}
      {filteredSubscriptions.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
          <CreditCard className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-base font-bold text-zinc-300">Nessun abbonamento trovato</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Non ci sono contratti abbonamento che corrispondono ai filtri selezionati. Prova a
            modificare la ricerca o crea un nuovo abbonamento.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Nuovo Abbonamento
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => {
            const badge = STATUS_CONFIG[sub.status] || STATUS_CONFIG.attivo;
            const BadgeIcon = badge.icon;

            const totalPaid = sub.installments
              .filter((i) => i.status === 'pagato')
              .reduce((acc, i) => acc + (i.paidAmount || i.amount), 0);
            const progress =
              sub.agreedPrice > 0 ? Math.min(100, Math.round((totalPaid / sub.agreedPrice) * 100)) : 0;

            const athleteObj = athletes.find((a) => a.id === sub.athleteId);

            return (
              <div
                key={sub.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all group"
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-amber-400 text-sm overflow-hidden">
                        {athleteObj?.avatarUrl ? (
                          <img
                            src={athleteObj.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          sub.athleteName?.slice(0, 2).toUpperCase() || 'AT'
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                          {sub.athleteName || 'Atleta'}
                        </h3>
                        <p className="text-[11px] font-bold text-amber-400/90 truncate max-w-[180px]">
                          {sub.packageName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-black flex items-center gap-1 shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Pricing & Rate Info */}
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block">Prezzo Concordato</span>
                      <strong className="text-emerald-400 font-black text-sm">
                        €{sub.agreedPrice.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block">Rateizzazione</span>
                      <span className="text-zinc-200 font-bold text-xs">
                        {sub.installmentCount} rate ({sub.paymentFrequency})
                      </span>
                    </div>
                  </div>

                  {/* Dates & Progress */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                      <span>Valido fino al: <strong className="text-white">{sub.endDate}</strong></span>
                      <span className="text-emerald-400 font-bold">{progress}% incassato</span>
                    </div>

                    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailSubscription(sub)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rate & Dettaglio</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRenew(sub)}
                      title="Rinnova Abbonamento"
                      className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        toggleSubscriptionSuspension(sub.id);
                        showSuccess(
                          sub.status === 'sospeso' ? 'Abbonamento riattivato' : 'Abbonamento sospeso'
                        );
                      }}
                      title={sub.status === 'sospeso' ? 'Riattiva' : 'Sospendi'}
                      className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Sei sicuro di voler eliminare questo contratto?')) {
                          deleteSubscription(sub.id);
                          showInfo('Contratto eliminato');
                        }
                      }}
                      title="Elimina"
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Atleta</th>
                <th className="p-3.5">Pacchetto / Contratto</th>
                <th className="p-3.5">Stato</th>
                <th className="p-3.5">Date (Inizio &rarr; Fine)</th>
                <th className="p-3.5">Prezzo Concordato</th>
                <th className="p-3.5">Rate & Incassi</th>
                <th className="p-3.5 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-200">
              {filteredSubscriptions.map((sub) => {
                const badge = STATUS_CONFIG[sub.status] || STATUS_CONFIG.attivo;
                const BadgeIcon = badge.icon;

                const totalPaid = sub.installments
                  .filter((i) => i.status === 'pagato')
                  .reduce((acc, i) => acc + (i.paidAmount || i.amount), 0);

                return (
                  <tr key={sub.id} className="hover:bg-zinc-950/50 transition-all">
                    <td className="p-3.5 font-bold text-white">
                      {sub.athleteName || 'Atleta'}
                    </td>
                    <td className="p-3.5 font-bold text-amber-400">
                      {sub.packageName}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold inline-flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-300 font-medium">
                      {sub.startDate} &rarr; <strong className="text-white">{sub.endDate}</strong>
                    </td>
                    <td className="p-3.5 font-black text-emerald-400">
                      €{sub.agreedPrice.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      <span className="text-zinc-300 font-bold">
                        €{totalPaid.toFixed(2)} / €{sub.agreedPrice.toFixed(2)}
                      </span>{' '}
                      <span className="text-[10px] text-zinc-500 block">
                        ({sub.installmentCount} rate {sub.paymentFrequency})
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailSubscription(sub)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold rounded-lg text-xs transition-all"
                        >
                          Dettaglio
                        </button>
                        <button
                          onClick={() => handleRenew(sub)}
                          className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg text-xs transition-all"
                        >
                          Rinnova
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscription Form Modal (Create / Edit / Renew) */}
      <SubscriptionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSubscription(null);
          setRenewingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        initialData={editingSubscription || renewingSubscription}
        title={
          renewingSubscription
            ? `Rinnova Abbonamento: ${renewingSubscription.packageName}`
            : editingSubscription
            ? 'Modifica Contratto Abbonamento'
            : 'Nuovo Abbonamento Atleta'
        }
      />

      {/* Subscription Detail Modal (View installments, pay rate, suspend, print) */}
      <SubscriptionDetailModal
        isOpen={!!detailSubscription}
        subscription={detailSubscription}
        onClose={() => setDetailSubscription(null)}
        onEdit={(sub) => handleEdit(sub)}
        onRenew={(sub) => handleRenew(sub)}
      />
    </div>
  );
};
