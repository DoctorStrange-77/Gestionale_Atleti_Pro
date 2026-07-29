import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Sparkles,
  Tag,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  Users,
  Info,
  ChevronRight,
  X,
  Award,
} from 'lucide-react';
import { usePackages } from '../context/PackagesContext';
import { useToast } from '../context/ToastContext';
import { PackageItem, PackageDurationUnit, PaymentFrequency } from '../types';
import { PackageFormModal } from '../components/packages/PackageFormModal';

export const PacchettiPage: React.FC = () => {
  const {
    packages,
    addPackage,
    updatePackage,
    duplicatePackage,
    togglePackageStatus,
    deletePackage,
    checkPackageUsage,
  } = usePackages();

  const { showSuccess, showError, showInfo } = useToast();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'tutti' | 'attivo' | 'disattivato'>('tutti');
  const [durationUnitFilter, setDurationUnitFilter] = useState<string>('tutti');
  const [paymentFreqFilter, setPaymentFreqFilter] = useState<string>('tutti');
  const [suspensionFilter, setSuspensionFilter] = useState<'tutti' | 'sospendibile' | 'non_sospendibile'>('tutti');
  const [sortBy, setSortBy] = useState<'nome' | 'prezzo_asc' | 'prezzo_desc' | 'durata'>('nome');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);

  // Protection Modal State (when delete is blocked due to athlete usage)
  const [blockedDeletePkg, setBlockedDeletePkg] = useState<{
    pkg: PackageItem;
    athleteNames: string[];
    count: number;
  } | null>(null);

  // Standard Delete Confirmation Modal State
  const [confirmDeletePkg, setConfirmDeletePkg] = useState<PackageItem | null>(null);

  // Filtered & Sorted Packages
  const filteredPackages = useMemo(() => {
    return packages
      .filter((pkg) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = pkg.name.toLowerCase().includes(q);
          const matchesDesc = pkg.description.toLowerCase().includes(q);
          const matchesServices = pkg.includedServices.some((s) => s.toLowerCase().includes(q));
          const matchesNotes = pkg.notes?.toLowerCase().includes(q) || false;

          if (!matchesName && !matchesDesc && !matchesServices && !matchesNotes) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter !== 'tutti' && pkg.status !== statusFilter) {
          return false;
        }

        // Duration Unit Filter
        if (durationUnitFilter !== 'tutti' && pkg.durationUnit !== durationUnitFilter) {
          return false;
        }

        // Payment Frequency Filter
        if (paymentFreqFilter !== 'tutti' && pkg.paymentFrequency !== paymentFreqFilter) {
          return false;
        }

        // Suspension Filter
        if (suspensionFilter === 'sospendibile' && !pkg.canBeSuspended) return false;
        if (suspensionFilter === 'non_sospendibile' && pkg.canBeSuspended) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nome') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'prezzo_asc') {
          return a.price - b.price;
        } else if (sortBy === 'prezzo_desc') {
          return b.price - a.price;
        } else if (sortBy === 'durata') {
          return b.durationValue - a.durationValue;
        }
        return 0;
      });
  }, [packages, searchQuery, statusFilter, durationUnitFilter, paymentFreqFilter, suspensionFilter, sortBy]);

  // Handlers
  const handleCreatePackage = () => {
    setEditingPackage(null);
    setIsFormModalOpen(true);
  };

  const handleEditPackage = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setIsFormModalOpen(true);
  };

  const handleDuplicatePackage = (pkg: PackageItem) => {
    const duplicated = duplicatePackage(pkg.id);
    if (duplicated) {
      showSuccess('Pacchetto Duplicato', `Creato "${duplicated.name}" con successo.`);
    }
  };

  const handleToggleStatus = (pkg: PackageItem) => {
    togglePackageStatus(pkg.id);
    const newStatus = pkg.status === 'attivo' ? 'disattivato' : 'attivo';
    showInfo(
      'Stato Aggiornato',
      `Il pacchetto "${pkg.name}" è ora ${newStatus.toUpperCase()}.`
    );
  };

  const handleDeleteClick = (pkg: PackageItem) => {
    const usage = checkPackageUsage(pkg);
    if (usage.isUsed) {
      setBlockedDeletePkg({
        pkg,
        athleteNames: usage.athleteNames,
        count: usage.count,
      });
    } else {
      setConfirmDeletePkg(pkg);
    }
  };

  const handleConfirmDelete = () => {
    if (!confirmDeletePkg) return;
    const res = deletePackage(confirmDeletePkg.id);
    if (res.success) {
      showSuccess('Pacchetto Eliminato', `Il pacchetto "${confirmDeletePkg.name}" è stato rimosso.`);
    } else if (res.isUsed) {
      showError('Azione Bloccata', 'Il pacchetto risulta utilizzato da atleti attivi.');
    }
    setConfirmDeletePkg(null);
  };

  const handleSavePackage = (data: Omit<PackageItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPackage) {
      updatePackage(editingPackage.id, data);
      showSuccess('Modifiche Salvate', `Aggiornato pacchetto "${data.name}".`);
    } else {
      addPackage(data);
      showSuccess('Pacchetto Creato', `Creato nuovo pacchetto "${data.name}".`);
    }
  };

  // Stats calculation
  const totalCount = packages.length;
  const activeCount = packages.filter((p) => p.status === 'attivo').length;
  const deactivatedCount = packages.filter((p) => p.status === 'disattivato').length;
  const avgPrice = totalCount > 0 ? (packages.reduce((acc, p) => acc + p.price, 0) / totalCount).toFixed(0) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 p-5 rounded-3xl border border-zinc-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Listino Pacchetti e Servizi
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestione contratti, formule di abbonamento, carnet lezioni e percorsi di preparazione.
          </p>
        </div>

        <button
          id="btn-add-pacchetto"
          onClick={handleCreatePackage}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuovo Pacchetto</span>
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-zinc-800 text-zinc-300 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Totale Pacchetti</p>
            <p className="text-xl font-black text-white">{totalCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Attivi in Listino</p>
            <p className="text-xl font-black text-emerald-400">{activeCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-zinc-800/80 text-zinc-500 rounded-xl">
            <Power className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Disattivati</p>
            <p className="text-xl font-black text-zinc-400">{deactivatedCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Prezzo Medio</p>
            <p className="text-xl font-black text-amber-400">€{avgPrice}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Field */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, servizio, descrizione..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="tutti">Stato: Tutti</option>
              <option value="attivo">Solamente Attivi</option>
              <option value="disattivato">Solamente Disattivati</option>
            </select>
          </div>

          {/* Duration Unit Filter */}
          <div className="md:col-span-2">
            <select
              value={durationUnitFilter}
              onChange={(e) => setDurationUnitFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="tutti">Durata: Tutte</option>
              <option value="mensile">Mensile</option>
              <option value="bimestrale">Bimestrale</option>
              <option value="trimestrale">Trimestrale</option>
              <option value="semestrale">Semestrale</option>
              <option value="annuale">Annuale</option>
              <option value="personalizzata">Personalizzata</option>
              <option value="servizio_singolo">Servizio Singolo</option>
              <option value="numero_consulenze">Numero Consulenze</option>
              <option value="numero_checkin">Numero Check-in</option>
            </select>
          </div>

          {/* Payment Frequency Filter */}
          <div className="md:col-span-2">
            <select
              value={paymentFreqFilter}
              onChange={(e) => setPaymentFreqFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="tutti">Frequenza: Tutte</option>
              <option value="unica_soluzione">Unica Soluzione</option>
              <option value="mensile">Pagamento Mensile</option>
              <option value="trimestrale">Pagamento Trimestrale</option>
              <option value="semestrale">Pagamento Semestrale</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="nome">Ordina: Nome (A-Z)</option>
              <option value="prezzo_asc">Ordina: Prezzo (Crescente)</option>
              <option value="prezzo_desc">Ordina: Prezzo (Decrescente)</option>
              <option value="durata">Ordina: Durata Maggiore</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Reset if active */}
        {(statusFilter !== 'tutti' ||
          durationUnitFilter !== 'tutti' ||
          paymentFreqFilter !== 'tutti' ||
          searchQuery.trim() !== '') && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-500 font-bold">Filtri Attivi:</span>
            <button
              onClick={() => {
                setStatusFilter('tutti');
                setDurationUnitFilter('tutti');
                setPaymentFreqFilter('tutti');
                setSearchQuery('');
              }}
              className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Azzera Filtri
            </button>
          </div>
        )}
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3">
          <Package className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-base font-bold text-zinc-300">Nessun pacchetto trovato</p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Nessun pacchetto corrisponde ai criteri di ricerca o ai filtri selezionati. Prova ad azzerare i filtri o a crearne uno nuovo.
          </p>
          <button
            onClick={handleCreatePackage}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Crea Pacchetto Ora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const isDeactivated = pkg.status === 'disattivato';
            const pricePerInstallment = (
              pkg.price / Math.max(1, pkg.installmentCount)
            ).toFixed(2);

            return (
              <div
                key={pkg.id}
                className={`bg-zinc-900/90 border rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all hover:border-zinc-700 relative overflow-hidden group ${
                  isDeactivated
                    ? 'border-zinc-800/60 opacity-70 bg-zinc-950/60'
                    : 'border-zinc-800 shadow-xl'
                }`}
              >
                {/* Top Badge Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                        pkg.status === 'attivo'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}
                    >
                      {pkg.status === 'attivo' ? 'Attivo' : 'Disattivato'}
                    </span>

                    {/* Duration badge */}
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pkg.durationValue}{' '}
                      {pkg.durationUnit === 'personalizzata'
                        ? pkg.durationCustomText || 'Personalizzata'
                        : pkg.durationUnit.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {pkg.description || 'Nessuna descrizione specificata.'}
                    </p>
                  </div>

                  {/* Price Banner */}
                  <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white">€{pkg.price.toFixed(2)}</span>
                        {pkg.discountType !== 'nessuno' && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                            Sconto {pkg.discountType === 'percentuale' ? `${pkg.discountValue}%` : `-€${pkg.discountValue}`}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                        {pkg.installmentCount > 1
                          ? `${pkg.installmentCount} rate da €${pricePerInstallment} (${pkg.paymentFrequency.replace('_', ' ')})`
                          : 'Unica Soluzione'}
                      </p>
                    </div>

                    {pkg.initialFee > 0 && (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                        +€{pkg.initialFee} Q.A.
                      </span>
                    )}
                  </div>

                  {/* Conditions & Renewal */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/60">
                      <span className="text-zinc-500 font-medium block">Rinnovo:</span>
                      <strong className="text-zinc-300 font-bold uppercase">
                        {pkg.renewalType}
                      </strong>
                    </div>

                    <div className="p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/60">
                      <span className="text-zinc-500 font-medium block">Sospensione:</span>
                      <strong className={pkg.canBeSuspended ? 'text-emerald-400' : 'text-rose-400'}>
                        {pkg.canBeSuspended ? pkg.maxSuspensionPeriod || 'Consentita' : 'Non consentita'}
                      </strong>
                    </div>
                  </div>

                  {/* Included Services Tags */}
                  {pkg.includedServices.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                        Servizi Inclusi:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.includedServices.map((srv, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 rounded-lg text-[11px] font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{srv}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pkg.notes && (
                    <p className="text-[11px] text-zinc-500 italic bg-zinc-950 p-2 rounded-xl border border-zinc-800/40">
                      Note: {pkg.notes}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons Bar */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      title="Modifica Pacchetto"
                      className="p-2 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicatePackage(pkg)}
                      title="Duplica Pacchetto"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(pkg)}
                      title={isDeactivated ? 'Riattiva Pacchetto' : 'Disattiva Pacchetto'}
                      className={`p-2 rounded-xl transition-all ${
                        isDeactivated
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteClick(pkg)}
                    title="Elimina Pacchetto"
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Form Modal (Create / Edit) */}
      <PackageFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePackage}
        initialData={editingPackage}
      />

      {/* PROTECTION ALERT MODAL (When delete is blocked because athletes use this package) */}
      {blockedDeletePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl w-fit">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">
                Impossibile Eliminare Pacchetto
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Il pacchetto <strong className="text-amber-400">"{blockedDeletePkg.pkg.name}"</strong> risulta attualmente utilizzato o acquistato da{' '}
                <strong className="text-white font-bold">{blockedDeletePkg.count} atleti</strong>:
              </p>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 max-h-32 overflow-y-auto">
                {blockedDeletePkg.athleteNames.map((name, idx) => (
                  <p key={idx} className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> {name}
                  </p>
                ))}
              </div>

              <p className="text-xs text-zinc-400 pt-1">
                Per salvaguardare la validità dello storico contabile e la trasparenza amministrativa dei contratti stipulati, i pacchetti già utilizzati non possono essere eliminati definitivamente.
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                💡 <strong>Soluzione:</strong> Puoi disattivarlo per nasconderlo dalle nuove vendite senza intaccare lo storico degli atleti attivi.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  togglePackageStatus(blockedDeletePkg.pkg.id);
                  showInfo('Pacchetto Disattivato', `Il pacchetto "${blockedDeletePkg.pkg.name}" è stato disattivato.`);
                  setBlockedDeletePkg(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all"
              >
                Disattiva Pacchetto Ora
              </button>
              <button
                onClick={() => setBlockedDeletePkg(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STANDARD DELETE CONFIRMATION MODAL */}
      {confirmDeletePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl w-fit">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Conferma Eliminazione</h3>
              <p className="text-xs text-zinc-300 mt-1">
                Confermi di voler eliminare definitivamente il pacchetto <strong className="text-amber-400">"{confirmDeletePkg.name}"</strong>? Questa azione è irreversibile.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/20"
              >
                Elimina Definitivamente
              </button>
              <button
                onClick={() => setConfirmDeletePkg(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
