import React, { useState, useEffect } from 'react';
import {
  Filter,
  Calendar,
  Users,
  User,
  Package,
  CreditCard,
  CheckCircle2,
  Bookmark,
  Plus,
  Trash2,
  X,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { Athlete, PackageItem, SavedReportFilter } from '../../types';
import { ReportFilterState } from '../../utils/reportCalculations';

interface ReportFiltersBarProps {
  filters: ReportFilterState;
  onFilterChange: (updates: Partial<ReportFilterState>) => void;
  athletes: Athlete[];
  packages: PackageItem[];
  coaches: string[];
}

const LOCAL_STORAGE_KEY = 'doctor_strength_saved_report_filters';

export const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({
  filters,
  onFilterChange,
  athletes,
  packages,
  coaches,
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedReportFilter[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // Load saved filters on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved report filters:', e);
    }
  }, []);

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;

    const newSaved: SavedReportFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName.trim(),
      dateFilter: filters.dateFilter,
      customStartDate: filters.customStartDate,
      customEndDate: filters.customEndDate,
      athleteId: filters.athleteId,
      coachName: filters.coachName,
      packageName: filters.packageName,
      paymentMethod: filters.paymentMethod,
      status: filters.status,
      serviceType: filters.serviceType,
      comparePeriod: filters.comparePeriod,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSaved, ...savedFilters];
    setSavedFilters(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save filter:', e);
    }

    setNewFilterName('');
    setIsSaveModalOpen(false);
  };

  const handleApplySavedFilter = (saved: SavedReportFilter) => {
    onFilterChange({
      dateFilter: saved.dateFilter,
      customStartDate: saved.customStartDate || filters.customStartDate,
      customEndDate: saved.customEndDate || filters.customEndDate,
      athleteId: saved.athleteId || 'tutti',
      coachName: saved.coachName || 'tutti',
      packageName: saved.packageName || 'tutti',
      paymentMethod: saved.paymentMethod || 'tutti',
      status: saved.status || 'tutti',
      serviceType: saved.serviceType || 'tutti',
      comparePeriod: saved.comparePeriod ?? false,
    });
  };

  const handleDeleteSavedFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete saved filter:', err);
    }
  };

  const resetFilters = () => {
    onFilterChange({
      dateFilter: 'anno_corrente',
      athleteId: 'tutti',
      coachName: 'tutti',
      packageName: 'tutti',
      paymentMethod: 'tutti',
      status: 'tutti',
      serviceType: 'tutti',
      comparePeriod: false,
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Top Header & Preset Filters Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Filtri Avanzati di Analisi
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Saved Filters Dropdown */}
          {savedFilters.length > 0 && (
            <div className="relative group">
              <button className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-all">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Filtri Salvati ({savedFilters.length})</span>
              </button>

              <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 hidden group-hover:block space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
                  Seleziona Preset
                </div>
                {savedFilters.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleApplySavedFilter(s)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-200 cursor-pointer flex items-center justify-between group/item"
                  >
                    <span className="truncate">{s.name}</span>
                    <button
                      onClick={(e) => handleDeleteSavedFilter(s.id, e)}
                      className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Filter Button */}
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Salva Filtro</span>
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-medium transition-all"
          >
            Azzera
          </button>
        </div>
      </div>

      {/* Grid of Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Periodo */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>Periodo Analizzato</span>
          </label>
          <select
            value={filters.dateFilter}
            onChange={(e) => onFilterChange({ dateFilter: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="30_giorni">Ultimi 30 Giorni</option>
            <option value="3_mesi">Ultimi 3 Mesi</option>
            <option value="6_mesi">Ultimi 6 Mesi</option>
            <option value="anno_corrente">Anno Corrente ({new Date().getFullYear()})</option>
            <option value="anno_precedente">Anno Precedente ({new Date().getFullYear() - 1})</option>
            <option value="personalizzato">Intervallo Personalizzato</option>
          </select>
        </div>

        {/* 2. Atleta */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <User className="w-3 h-3 text-amber-400" />
            <span>Filtra per Atleta</span>
          </label>
          <select
            value={filters.athleteId}
            onChange={(e) => onFilterChange({ athleteId: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="tutti">Tutti gli Atleti</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Coach Assegnato */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <Users className="w-3 h-3 text-amber-400" />
            <span>Filtra per Coach</span>
          </label>
          <select
            value={filters.coachName}
            onChange={(e) => onFilterChange({ coachName: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="tutti">Tutti i Coach</option>
            {coaches.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Pacchetto */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <Package className="w-3 h-3 text-amber-400" />
            <span>Filtra per Pacchetto</span>
          </label>
          <select
            value={filters.packageName}
            onChange={(e) => onFilterChange({ packageName: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="tutti">Tutti i Pacchetti</option>
            {packages.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Metodo di Pagamento */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <CreditCard className="w-3 h-3 text-amber-400" />
            <span>Metodo di Pagamento</span>
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange({ paymentMethod: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="tutti">Tutti i Metodi</option>
            <option value="contanti">Contanti</option>
            <option value="bonifico">Bonifico Bancario</option>
            <option value="carta">Carta di Credito / POS</option>
            <option value="PayPal">PayPal</option>
            <option value="Stripe">Stripe</option>
            <option value="addebito automatico">RID / SDD SEPA</option>
            <option value="assegno">Assegno</option>
            <option value="altro">Altro</option>
          </select>
        </div>

        {/* 6. Stato */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            <span>Stato Pagamento / Sub</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="tutti">Tutti gli Stati</option>
            <option value="pagato">Saldato / Pagato</option>
            <option value="in scadenza">In Scadenza</option>
            <option value="da pagare">Da Pagare</option>
            <option value="scaduto">Scaduto / Insoluto</option>
            <option value="attivo">Attivo</option>
            <option value="sospeso">Sospeso</option>
            <option value="inattivo">Inattivo / Disdetto</option>
          </select>
        </div>

        {/* 7. Tipologia di Servizio */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Tipologia di Servizio</span>
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => onFilterChange({ serviceType: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="tutti">Tutte le Tipologie</option>
            <option value="personal training">Personal Training</option>
            <option value="sala pesi">Abbonamento Sala Pesi</option>
            <option value="consulenza">Consulenza / Check-in</option>
            <option value="nutrizione">Piano Nutrizionale</option>
            <option value="powerlifting">Powerlifting & Strength</option>
            <option value="online coaching">Coaching Online</option>
          </select>
        </div>

        {/* 8. Confronto tra Periodi Toggle */}
        <div className="flex flex-col justify-end">
          <button
            onClick={() => onFilterChange({ comparePeriod: !filters.comparePeriod })}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              filters.comparePeriod
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>
              {filters.comparePeriod ? 'Confronto Attivo vs Prec.' : 'Attiva Confronto Periodi'}
            </span>
          </button>
        </div>
      </div>

      {/* Custom Start / End Date inputs if custom filter */}
      {filters.dateFilter === 'personalizzato' && (
        <div className="pt-2 flex flex-wrap items-center gap-3 bg-zinc-950 p-3 border border-amber-500/30 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-semibold">Dal:</span>
            <input
              type="date"
              value={filters.customStartDate}
              onChange={(e) => onFilterChange({ customStartDate: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-semibold">Al:</span>
            <input
              type="date"
              value={filters.customEndDate}
              onChange={(e) => onFilterChange({ customEndDate: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Save Filter Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-zinc-100">Salva Configurazione Filtri</h4>
            </div>

            <p className="text-xs text-zinc-400">
              Assegna un nome al set di filtri corrente per poterlo riapplicare rapidamente in futuro.
            </p>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Nome Filtro Salvato:
              </label>
              <input
                type="text"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                placeholder="es. Analisi Coach Roberto Mese Corrente"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!newFilterName.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs disabled:opacity-50"
              >
                Salva Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
