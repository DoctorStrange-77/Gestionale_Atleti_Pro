import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  MoreVertical,
  CheckSquare,
  Square,
  MessageSquare,
  Phone,
  ArrowUpDown,
  UserCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  Shield,
  Tag,
} from 'lucide-react';
import { Athlete, AthleteStatus, PaymentStatus } from '../types';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { ATHLETE_STATUS_MAP, PAYMENT_STATUS_MAP } from '../lib/athleteHelpers';
import { AthleteFormModal } from '../components/athletes/AthleteFormModal';
import { AthleteDetailModal } from '../components/athletes/AthleteDetailModal';
import { AthleteDetailPage } from './AthleteDetailPage';

export const AtletiPage: React.FC = () => {
  const {
    athletes,
    addAthlete,
    updateAthlete,
    deleteAthlete,
    archiveAthlete,
    bulkArchiveAthletes,
    bulkDeleteAthletes,
    bulkUpdateCoach,
    updateAthleteStatus,
    exportToCSV,
  } = useAthletes();

  const { members } = useAuth();

  // Search, Filters, Sorting, Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCoach, setSelectedCoach] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedExpiration, setSelectedExpiration] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'join_recent' | 'expiry_nearest'>('name_asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [viewingAthlete, setViewingAthlete] = useState<Athlete | null>(null);
  const [quickStatusModalAthlete, setQuickStatusModalAthlete] = useState<Athlete | null>(null);

  // Available coaches for filter dropdown
  const coachesList = useMemo(() => {
    const set = new Set<string>();
    athletes.forEach((a) => {
      if (a.assignedCoachName) set.add(a.assignedCoachName);
    });
    return Array.from(set);
  }, [athletes]);

  // Available active packages for filter dropdown
  const packagesList = useMemo(() => {
    const set = new Set<string>();
    athletes.forEach((a) => {
      if (a.activePackage) set.add(a.activePackage);
    });
    return Array.from(set);
  }, [athletes]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = athletes.length;
    const attivi = athletes.filter((a) => a.status === 'attivo').length;
    const inScadenza = athletes.filter((a) => a.status === 'in_scadenza' || a.paymentStatus === 'in_scadenza').length;
    const morosi = athletes.filter((a) => a.status === 'moroso' || a.paymentStatus === 'moroso').length;
    const potenziali = athletes.filter((a) => a.status === 'potenziale_cliente' || a.status === 'prova').length;
    return { total, attivi, inScadenza, morosi, potenziali };
  }, [athletes]);

  // Filter & Search Logic
  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
        const matchesName = fullName.includes(query);
        const matchesEmail = athlete.email.toLowerCase().includes(query);
        const matchesPhone = athlete.phone.toLowerCase().includes(query);
        const matchesTags = athlete.labels.some((lbl) => lbl.toLowerCase().includes(query));
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesTags) {
          return false;
        }
      }

      // Filter Status
      if (selectedStatus !== 'all' && athlete.status !== selectedStatus) {
        return false;
      }

      // Filter Coach
      if (selectedCoach !== 'all' && athlete.assignedCoachName !== selectedCoach) {
        return false;
      }

      // Filter Package
      if (selectedPackage !== 'all' && athlete.activePackage !== selectedPackage) {
        return false;
      }

      // Filter Payment Status
      if (selectedPaymentStatus !== 'all' && athlete.paymentStatus !== selectedPaymentStatus) {
        return false;
      }

      // Filter Expiration
      if (selectedExpiration !== 'all' && athlete.expirationDate) {
        const today = new Date();
        const expDate = new Date(athlete.expirationDate);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (selectedExpiration === 'scaduti' && diffDays >= 0) return false;
        if (selectedExpiration === '7gg' && (diffDays < 0 || diffDays > 7)) return false;
        if (selectedExpiration === '30gg' && (diffDays < 0 || diffDays > 30)) return false;
      }

      return true;
    });
  }, [
    athletes,
    searchQuery,
    selectedStatus,
    selectedCoach,
    selectedPackage,
    selectedPaymentStatus,
    selectedExpiration,
  ]);

  // Sort Logic
  const sortedAthletes = useMemo(() => {
    return [...filteredAthletes].sort((a, b) => {
      if (sortBy === 'name_asc') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
      if (sortBy === 'name_desc') {
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      }
      if (sortBy === 'join_recent') {
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      }
      if (sortBy === 'expiry_nearest') {
        const expA = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
        const expB = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
        return expA - expB;
      }
      return 0;
    });
  }, [filteredAthletes, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedAthletes.length / itemsPerPage) || 1;
  const paginatedAthletes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAthletes.slice(start, start + itemsPerPage);
  }, [sortedAthletes, currentPage]);

  // Selection Handler
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedAthletes.length && paginatedAthletes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAthletes.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Quick WhatsApp Trigger
  const handleWhatsApp = (phone: string, firstName: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${clean}?text=Ciao%20${encodeURIComponent(firstName)},%20ti%20contatto%20da%20Doctor%20Strength`, '_blank');
  };

  // If viewing detailed full page view for an athlete
  if (viewingAthlete) {
    return (
      <AthleteDetailPage
        athleteId={viewingAthlete.id}
        onBack={() => setViewingAthlete(null)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Gestione Atleti</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Anagrafica completa, situazione pagamenti, stato contrattuale e assegnazione coach.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportToCSV(selectedIds)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Esporta CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingAthlete(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuovo Atleta</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Totale Atleti</span>
            <span className="text-lg font-black text-white">{kpis.total}</span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Attivi</span>
            <span className="text-lg font-black text-emerald-400">{kpis.attivi}</span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">In Scadenza</span>
            <span className="text-lg font-black text-rose-400">{kpis.inScadenza}</span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-xl font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Morosi</span>
            <span className="text-lg font-black text-red-400">{kpis.morosi}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Potenziali / Prova</span>
            <span className="text-lg font-black text-cyan-400">{kpis.potenziali}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Control Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca atleta per nome, cognome, email, telefono o etichetta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* Status Filter (11 statuses) */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Stato Atleta</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tutti gli Stati (11)</option>
              {(Object.keys(ATHLETE_STATUS_MAP) as AthleteStatus[]).map((st) => (
                <option key={st} value={st}>
                  {ATHLETE_STATUS_MAP[st].label}
                </option>
              ))}
            </select>
          </div>

          {/* Coach Filter */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Coach Assegnato</label>
            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tutti i Coach</option>
              {coachesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Package Filter */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Pacchetto Attivo</label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tutti i Pacchetti</option>
              {packagesList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Stato Pagamenti</label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tutti i Pagamenti</option>
              <option value="regolare">Regolare</option>
              <option value="in_scadenza">In Scadenza</option>
              <option value="scaduto">Scaduto</option>
              <option value="moroso">Moroso</option>
              <option value="in_attesa">In Attesa</option>
            </select>
          </div>

          {/* Expiration Filter */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Filtro Scadenza</label>
            <select
              value={selectedExpiration}
              onChange={(e) => setSelectedExpiration(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tutte le Scadenze</option>
              <option value="7gg">In Scadenza entro 7 giorni</option>
              <option value="30gg">In Scadenza entro 30 giorni</option>
              <option value="scaduti">Già Scaduti</option>
            </select>
          </div>
        </div>

        {/* Sorting & Active Filters reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">Ordina per:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-amber-400 font-bold text-[11px]"
            >
              <option value="name_asc">Nome (A - Z)</option>
              <option value="name_desc">Nome (Z - A)</option>
              <option value="join_recent">Data Ingresso (Più Recenti)</option>
              <option value="expiry_nearest">Scadenza Più Vicina</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">
              Risultati: <strong className="text-white">{sortedAthletes.length}</strong> atleti trovati
            </span>
            {(selectedStatus !== 'all' ||
              selectedCoach !== 'all' ||
              selectedPackage !== 'all' ||
              selectedPaymentStatus !== 'all' ||
              selectedExpiration !== 'all' ||
              searchQuery !== '') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedCoach('all');
                  setSelectedPackage('all');
                  setSelectedPaymentStatus('all');
                  setSelectedExpiration('all');
                }}
                className="text-amber-400 hover:underline text-[11px] font-bold"
              >
                Reset Filtri
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when selectedIds > 0) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 font-black flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span className="font-bold text-amber-300">Atleti Selezionati</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => bulkArchiveAthletes(selectedIds)}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>Archivia Selezionati</span>
            </button>

            <button
              onClick={() => exportToCSV(selectedIds)}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Esporta Selezionati CSV</span>
            </button>

            <button
              onClick={() => bulkDeleteAthletes(selectedIds)}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Elimina</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-zinc-400 hover:text-white"
            >
              Deseleziona
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 border-b border-zinc-800 uppercase text-[10px] font-bold text-zinc-400 tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-amber-400">
                    {selectedIds.length === paginatedAthletes.length && paginatedAthletes.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Atleta</th>
                <th className="p-3.5">Contatti</th>
                <th className="p-3.5">Coach</th>
                <th className="p-3.5">Ingresso</th>
                <th className="p-3.5">Stato (11)</th>
                <th className="p-3.5">Pacchetto & Scadenza</th>
                <th className="p-3.5">Pagamenti</th>
                <th className="p-3.5">Etichette</th>
                <th className="p-3.5 text-right">Azioni</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {paginatedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-zinc-500 space-y-3">
                    <Users className="w-10 h-10 mx-auto text-zinc-700" />
                    <p className="text-sm font-bold text-zinc-400">Nessun atleta trovato con i filtri attuali.</p>
                    <p className="text-xs text-zinc-600">
                      Prova a modificare la ricerca o seleziona "Tutti gli Stati" per visualizzare l'anagrafica completa.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAthletes.map((athlete) => {
                  const statusCfg = ATHLETE_STATUS_MAP[athlete.status] || ATHLETE_STATUS_MAP.attivo;
                  const payCfg = PAYMENT_STATUS_MAP[athlete.paymentStatus] || PAYMENT_STATUS_MAP.regolare;
                  const isSelected = selectedIds.includes(athlete.id);

                  return (
                    <tr
                      key={athlete.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button onClick={() => toggleSelectOne(athlete.id)} className="text-zinc-400 hover:text-amber-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Avatar e Nome */}
                      <td className="p-3.5">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => setViewingAthlete(athlete)}
                        >
                          <img
                            src={athlete.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={athlete.firstName}
                            className="w-9 h-9 rounded-xl object-cover border border-zinc-700 group-hover:border-amber-400 transition-colors shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors block text-xs">
                              {athlete.firstName} {athlete.lastName}
                            </span>
                            <span className="text-[10px] text-zinc-400">{athlete.city ? `${athlete.city} (${athlete.province})` : 'Italia'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contatti & Fast WhatsApp */}
                      <td className="p-3.5 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-zinc-300 text-[11px]">{athlete.phone}</span>
                          <button
                            onClick={() => handleWhatsApp(athlete.phone, athlete.firstName)}
                            title="Apri WhatsApp"
                            className="text-emerald-400 hover:text-emerald-300 p-0.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate block max-w-[140px]">{athlete.email}</span>
                      </td>

                      {/* Coach Assegnato */}
                      <td className="p-3.5">
                        <span className="font-semibold text-zinc-200 text-xs">
                          {athlete.assignedCoachName || 'Non Assegnato'}
                        </span>
                      </td>

                      {/* Data Ingresso */}
                      <td className="p-3.5 text-zinc-400 text-[11px] font-mono">
                        {athlete.joinDate}
                      </td>

                      {/* Stato Atleta (11 stati) */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-flex items-center gap-1.5 ${statusCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      {/* Pacchetto & Scadenza */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-200 block text-xs truncate max-w-[150px]">
                            {athlete.activePackage || 'Nessun Pacchetto'}
                          </span>
                          <span className="text-[10px] text-amber-400/90 font-mono block">
                            Scade: {athlete.expirationDate || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Pagamenti */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${payCfg.badgeClass}`}>
                          {payCfg.label}
                        </span>
                      </td>

                      {/* Etichette */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {athlete.labels && athlete.labels.length > 0 ? (
                            athlete.labels.slice(0, 2).map((lbl) => (
                              <span
                                key={lbl}
                                className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded text-[9px] font-bold"
                              >
                                {lbl}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-600 text-[10px]">-</span>
                          )}
                          {athlete.labels && athlete.labels.length > 2 && (
                            <span className="text-[9px] text-zinc-500 font-bold">+{athlete.labels.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Azioni Rapide */}
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setViewingAthlete(athlete)}
                          title="Vedi Scheda Completa"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingAthlete(athlete);
                            setIsAddModalOpen(true);
                          }}
                          title="Modifica Anagrafica"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => archiveAthlete(athlete.id)}
                          title="Archivia Atleta"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteAthlete(athlete.id)}
                          title="Elimina"
                          className="p-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div>
            Mostrando <strong className="text-white">{paginatedAthletes.length}</strong> di{' '}
            <strong className="text-white">{sortedAthletes.length}</strong> atleti (Pagina {currentPage} di {totalPages})
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pNum
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Athlete Modal */}
      <AthleteFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAthlete(null);
        }}
        initialData={editingAthlete}
        onSubmit={(data) => {
          if (editingAthlete) {
            updateAthlete(editingAthlete.id, data);
          } else {
            addAthlete(data);
          }
        }}
      />

      {/* Athlete Detail Modal */}
      <AthleteDetailModal
        athlete={viewingAthlete}
        onClose={() => setViewingAthlete(null)}
        onEdit={(a) => {
          setEditingAthlete(a);
          setIsAddModalOpen(true);
        }}
        onChangeStatus={(a, st) => updateAthleteStatus(a.id, st)}
      />
    </div>
  );
};
