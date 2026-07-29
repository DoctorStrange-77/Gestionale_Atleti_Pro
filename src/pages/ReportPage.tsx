import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Euro,
  TrendingUp,
  Calendar,
  CreditCard,
  UserPlus,
  UserMinus,
  RefreshCw,
  Users,
  Package,
  Layers,
  Clock,
  DollarSign,
  Activity,
  FileText,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { useAthletes } from '../context/AthletesContext';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { usePayments } from '../context/PaymentsContext';
import { useRenewals } from '../context/RenewalsContext';
import { usePackages } from '../context/PackagesContext';
import {
  ReportFilterState,
  generateSpecificReport,
} from '../utils/reportCalculations';
import { ReportFiltersBar } from '../components/reports/ReportFiltersBar';
import { ReportVisualizer } from '../components/reports/ReportVisualizer';
import { ExternalInvoicesRegistry } from '../components/reports/ExternalInvoicesRegistry';

export const ReportPage: React.FC = () => {
  const { athletes } = useAthletes();
  const { subscriptions } = useSubscriptions();
  const { payments } = usePayments();
  const { renewals } = useRenewals();
  const { packages } = usePackages();

  // Active Main View Tab: 'reports' | 'external_invoices'
  const [activeMainTab, setActiveMainTab] = useState<'reports' | 'external_invoices'>('reports');

  // Active Selected Report Key (one of 18)
  const [selectedReportKey, setSelectedReportKey] = useState<string>('incassi_mensili');

  // Report Search / Category Filter state
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<'tutti' | 'finanziari' | 'fidelizzazione' | 'operativi'>('tutti');

  // Report Filter State
  const [filters, setFilters] = useState<ReportFilterState>({
    dateFilter: 'anno_corrente',
    customStartDate: `${new Date().getFullYear()}-01-01`,
    customEndDate: new Date().toISOString().split('T')[0],
    athleteId: 'tutti',
    coachName: 'tutti',
    packageName: 'tutti',
    paymentMethod: 'tutti',
    status: 'tutti',
    serviceType: 'tutti',
    comparePeriod: false,
  });

  const handleFilterChange = (updates: Partial<ReportFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // List of distinct coach names from athletes
  const coachList = useMemo(() => {
    const set = new Set<string>();
    athletes.forEach((a) => {
      if (a.assignedCoachName) set.add(a.assignedCoachName);
    });
    return Array.from(set);
  }, [athletes]);

  // List of 18 requested reports definitions
  const REPORT_DEFINITIONS = [
    {
      key: 'incassi_giornalieri',
      title: 'Incassi Giornalieri',
      category: 'finanziari',
      description: 'Dettaglio dell\'incassato giorno per giorno con scomposizione per canale',
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'incassi_mensili',
      title: 'Incassi Mensili',
      category: 'finanziari',
      description: 'Andamento del fatturato mensile confrontato con le previsioni',
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'incassi_annuali',
      title: 'Incassi Annuali',
      category: 'finanziari',
      description: 'Riepilogo e confronto del volume di incassi anno per anno',
      icon: <Euro className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'pagamenti_insoluti',
      title: 'Pagamenti Insoluti',
      category: 'finanziari',
      description: 'Rate e contratti scaduti non saldati con giorni di ritardo',
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
    },
    {
      key: 'pagamenti_futuri',
      title: 'Pagamenti Futuri',
      category: 'finanziari',
      description: 'Proiezione dei flussi di cassa in entrata per i prossimi mesi',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'abbonamenti_in_scadenza',
      title: 'Abbonamenti in Scadenza',
      category: 'operativi',
      description: 'Contratti di iscrizione prossimi alla data di scadenza',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'rinnovi',
      title: 'Rinnovi Confezionati',
      category: 'fidelizzazione',
      description: 'Tasso di conversione e contratti rinnovati con successo',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'mancati_rinnovi',
      title: 'Mancati Rinnovi',
      category: 'fidelizzazione',
      description: 'Iscrizioni terminate e motivi del mancato rinnovo',
      icon: <UserMinus className="w-4 h-4 text-red-400" />,
    },
    {
      key: 'nuovi_atleti',
      title: 'Nuovi Atleti',
      category: 'fidelizzazione',
      description: 'Acquisizione nuovi clienti e canale di provenienza',
      icon: <UserPlus className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'atleti_persi',
      title: 'Atleti Persi / Churn',
      category: 'fidelizzazione',
      description: 'Analisi degli abbandoni e del tasso di churn rate',
      icon: <UserMinus className="w-4 h-4 text-red-400" />,
    },
    {
      key: 'fatturato_coach',
      title: 'Fatturato per Coach',
      category: 'finanziari',
      description: 'Ripartizione dei ricavi in base al coach assegnato',
      icon: <Users className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'fatturato_pacchetto',
      title: 'Fatturato per Pacchetto',
      category: 'finanziari',
      description: 'Rendita economica generata da ciascuna offerta o pacchetto',
      icon: <Package className="w-4 h-4 text-purple-400" />,
    },
    {
      key: 'fatturato_servizio',
      title: 'Fatturato per Servizio',
      category: 'finanziari',
      description: 'Fatturato suddiviso per tipologia (PT, Sala, Nutrizione, Consulenza)',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
    },
    {
      key: 'metodi_pagamento',
      title: 'Metodi di Pagamento',
      category: 'finanziari',
      description: 'Distribuzione incassi per canale (Contanti, Bonifico, POS, Stripe, PayPal)',
      icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'mrr',
      title: 'MRR (Ricavo Mensile Ricorrente)',
      category: 'finanziari',
      description: 'Monthly Recurring Revenue derivante dai contratti attivi',
      icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'arr',
      title: 'ARR (Ricavo Annualizzato)',
      category: 'finanziari',
      description: 'Annual Recurring Revenue: proiezione del fatturato su 12 mesi',
      icon: <DollarSign className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'durata_media_rapporto',
      title: 'Durata Media del Rapporto',
      category: 'fidelizzazione',
      description: 'Permanenza media in mesi (tenure) degli atleti nel centro',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'valore_medio_atleta',
      title: 'Valore Medio dell\'Atleta (LTV / ARPU)',
      category: 'finanziari',
      description: 'Ricavo medio generato da ciascun iscritto nel suo ciclo di vita',
      icon: <Euro className="w-4 h-4 text-purple-400" />,
    },
  ];

  // Filter report list based on search and category
  const filteredReportDefinitions = useMemo(() => {
    return REPORT_DEFINITIONS.filter((r) => {
      const matchCat = reportCategoryFilter === 'tutti' || r.category === reportCategoryFilter;
      const matchSearch =
        r.title.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(reportSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [reportSearchQuery, reportCategoryFilter]);

  // Compute calculated data for active report
  const activeReportData = useMemo(() => {
    return generateSpecificReport(
      selectedReportKey,
      athletes,
      subscriptions,
      payments,
      renewals,
      filters
    );
  }, [selectedReportKey, athletes, subscriptions, payments, renewals, filters]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Main View Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <span>Centro Reportistica & Business Intelligence</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Analisi avanzata dei 18 report operativi e finanziari di Doctor Strength System.
          </p>
        </div>

        {/* Main Tab Switcher */}
        <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveMainTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'reports'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>18 Report Analitici</span>
          </button>

          <button
            onClick={() => setActiveMainTab('external_invoices')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'external_invoices'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registro Fatture Esterne</span>
          </button>
        </div>
      </div>

      {activeMainTab === 'external_invoices' ? (
        <ExternalInvoicesRegistry athletes={athletes} />
      ) : (
        <div className="space-y-6">
          {/* 18 Reports Selection Matrix */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Seleziona Report ({REPORT_DEFINITIONS.length} Disponibili):
                </span>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reportSearchQuery}
                    onChange={(e) => setReportSearchQuery(e.target.value)}
                    placeholder="Cerca report..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    onClick={() => setReportCategoryFilter('tutti')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reportCategoryFilter === 'tutti'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Tutti
                  </button>
                  <button
                    onClick={() => setReportCategoryFilter('finanziari')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reportCategoryFilter === 'finanziari'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Finanziari
                  </button>
                  <button
                    onClick={() => setReportCategoryFilter('fidelizzazione')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reportCategoryFilter === 'fidelizzazione'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Fidelizzazione
                  </button>
                  <button
                    onClick={() => setReportCategoryFilter('operativi')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reportCategoryFilter === 'operativi'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Operativi
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of 18 Report Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
              {filteredReportDefinitions.map((rep) => {
                const isSelected = selectedReportKey === rep.key;
                return (
                  <button
                    key={rep.key}
                    onClick={() => setSelectedReportKey(rep.key)}
                    className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:scale-105 transition-transform">
                          {rep.icon}
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold line-clamp-1 leading-snug">
                        {rep.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-tight">
                        {rep.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Filters Controls Bar */}
          <ReportFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            athletes={athletes}
            packages={packages}
            coaches={coachList}
          />

          {/* Report Visualizer & Interactive Analytics */}
          <ReportVisualizer
            summary={activeReportData}
            onPrint={handlePrint}
          />
        </div>
      )}
    </div>
  );
};
