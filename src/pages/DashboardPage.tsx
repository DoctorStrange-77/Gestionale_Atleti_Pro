import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAthletes } from '../context/AthletesContext';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { usePayments } from '../context/PaymentsContext';
import { useRenewals } from '../context/RenewalsContext';
import { useTasks } from '../context/TasksContext';
import { useDocuments } from '../context/DocumentsContext';
import {
  Users,
  CreditCard,
  Euro,
  Clock,
  TrendingUp,
  PlusCircle,
  Dumbbell,
  AlertCircle,
  Activity,
  Calendar,
  RefreshCw,
  Filter,
  UserPlus,
  UserMinus,
  PauseCircle,
  DollarSign,
  TrendingDown,
  CheckSquare,
  ShieldCheck,
  CalendarRange,
  HelpCircle,
} from 'lucide-react';
import {
  TimeFilterOption,
  getDateRangeFromFilter,
  computeDashboardMetrics,
} from '../utils/dashboardCalculations';
import {
  buildMonthlyTrends,
  buildPackageDistribution,
  buildCoachDistribution,
  buildRenewalStatusDistribution,
  buildPaymentPunctuality,
} from '../utils/dashboardChartData';
import { KpiCard } from '../components/dashboard/KpiCard';
import { QuickSectionsWidget } from '../components/dashboard/QuickSectionsWidget';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';

interface DashboardPageProps {
  onNavigate: (tab: any, extra?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, organizationName } = useAuth();
  const { athletes } = useAthletes();
  const { subscriptions } = useSubscriptions();
  const { payments, openQuickRegisterModal, triggerSystemStatusRecalculation } = usePayments();
  const { renewals } = useRenewals();
  const { tasks } = useTasks();
  const { documents, alerts } = useDocuments();

  const [isRecalculating, setIsRecalculating] = useState(false);

  // Time Filter State
  const [selectedFilter, setSelectedFilter] = useState<TimeFilterOption>('anno_corrente');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await triggerSystemStatusRecalculation(user?.fullName || 'Amministratore');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Compute active date range
  const dateRange = useMemo(() => {
    return getDateRangeFromFilter(selectedFilter, {
      startDate: customStartDate,
      endDate: customEndDate,
    });
  }, [selectedFilter, customStartDate, customEndDate]);

  // Compute all 20 KPI metrics
  const metrics = useMemo(() => {
    return computeDashboardMetrics(
      athletes,
      subscriptions,
      payments,
      renewals,
      tasks,
      documents,
      alerts,
      dateRange
    );
  }, [athletes, subscriptions, payments, renewals, tasks, documents, alerts, dateRange]);

  // Compute chart datasets
  const monthlyTrendsData = useMemo(() => {
    return buildMonthlyTrends(athletes, subscriptions, payments);
  }, [athletes, subscriptions, payments]);

  const packageDistributionData = useMemo(() => {
    return buildPackageDistribution(subscriptions);
  }, [subscriptions]);

  const coachDistributionData = useMemo(() => {
    return buildCoachDistribution(athletes);
  }, [athletes]);

  const renewalDistributionData = useMemo(() => {
    return buildRenewalStatusDistribution(renewals);
  }, [renewals]);

  const paymentPunctualityData = useMemo(() => {
    return buildPaymentPunctuality(payments);
  }, [payments]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Doctor Strength System</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-100">
              Pannello di Controllo Completo, {user?.fullName || 'Coach'}!
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Analisi finanziaria, fidelizzazione, scadenze operative e performance di <strong className="text-zinc-200">{organizationName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-quick-recalculate-dashboard"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md hover:border-amber-500/50 disabled:opacity-50"
              title="Calcola e aggiorna automaticamente tutti gli stati di atleti e scadenze"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Ricalcolo...' : 'Ricalcola Stati'}</span>
            </button>

            <button
              id="btn-quick-register-payment"
              onClick={() => openQuickRegisterModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Euro className="w-4 h-4 stroke-[2.5]" />
              <span>Registra Pagamento</span>
            </button>

            <button
              id="btn-quick-new-athlete"
              onClick={() => onNavigate('atleti')}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-zinc-700"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Nuovo Atleta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Exclusion Rules Disclaimer */}
      <div className="p-3.5 bg-zinc-900/90 border border-amber-500/20 rounded-xl flex items-center gap-3 text-xs text-zinc-300">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="leading-snug">
          <strong className="text-amber-400">Trasparenza Contabile:</strong> I calcoli finanziari escludono automaticamente pagamenti annullati, importi non accreditati, rimborsi ed eventuali voci duplicate.
        </p>
      </div>

      {/* Time Filter Controls */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>Filtro Temporale Analisi:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <button
            onClick={() => setSelectedFilter('30_giorni')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedFilter === '30_giorni'
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            30 Giorni
          </button>

          <button
            onClick={() => setSelectedFilter('3_mesi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedFilter === '3_mesi'
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            3 Mesi
          </button>

          <button
            onClick={() => setSelectedFilter('6_mesi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedFilter === '6_mesi'
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            6 Mesi
          </button>

          <button
            onClick={() => setSelectedFilter('anno_corrente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedFilter === 'anno_corrente'
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Anno Corrente
          </button>

          <button
            onClick={() => setSelectedFilter('anno_precedente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedFilter === 'anno_precedente'
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Anno Precedente
          </button>

          <button
            onClick={() => setSelectedFilter('personalizzato')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedFilter === 'personalizzato'
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Personalizzato</span>
          </button>
        </div>

        {/* Custom Range Picker Inputs */}
        {selectedFilter === 'personalizzato' && (
          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 border border-amber-500/30 rounded-xl text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
            />
            <span className="text-zinc-500">fino a</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Date Range Badge */}
        <div className="text-xs text-zinc-400 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800 font-mono">
          Dal <strong className="text-amber-400">{dateRange.startDate}</strong> al <strong className="text-amber-400">{dateRange.endDate}</strong>
        </div>
      </div>

      {/* 20 KPI INDICATORS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Indicatori di Performance (20 KPI)</span>
          </h3>
          <span className="text-xs text-zinc-400 italic">
            Passa il mouse o clicca su <HelpCircle className="w-3 h-3 inline text-amber-400" /> per vedere la formula di ogni KPI
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* 1. Atleti Attivi */}
          <KpiCard
            id="kpi-1-atleti-attivi"
            title="Atleti Attivi"
            value={metrics.atletiAttivi}
            subtitle="Iscritti attivi in palestra"
            icon={<Users className="w-5 h-5" />}
            colorTheme="emerald"
            formula="Conteggio atleti con stato = 'attivo'"
            formulaDescription="Misura il totale degli atleti attualmente attivi e autorizzati ad allenarsi nel sistema."
            onClick={() => onNavigate('atleti')}
          />

          {/* 2. Atleti in Prova */}
          <KpiCard
            id="kpi-2-atleti-in-prova"
            title="Atleti in Prova"
            value={metrics.atletiInProva}
            subtitle="Iscrizioni di prova temporanee"
            icon={<UserPlus className="w-5 h-5" />}
            colorTheme="amber"
            formula="Conteggio atleti con stato = 'in_prova'"
            formulaDescription="Identifica i nuovi utenti in fase di valutazione iniziale o periodo di prova."
            onClick={() => onNavigate('atleti')}
          />

          {/* 3. Atleti Sospesi */}
          <KpiCard
            id="kpi-3-atleti-sospesi"
            title="Atleti Sospesi"
            value={metrics.atletiSospesi}
            subtitle="Abbonamenti temporaneamente in pausa"
            icon={<PauseCircle className="w-5 h-5" />}
            colorTheme="purple"
            formula="Conteggio atleti con stato = 'sospeso'"
            formulaDescription="Indica gli atleti con abbonamento congelato per infortunio, vacanza o pausa concordata."
            onClick={() => onNavigate('atleti')}
          />

          {/* 4. Nuovi Atleti del Mese */}
          <KpiCard
            id="kpi-4-nuovi-atleti"
            title="Nuovi Atleti (Mese)"
            value={metrics.nuoviAtletiMese}
            subtitle="Registrati nel periodo selezionato"
            icon={<TrendingUp className="w-5 h-5" />}
            colorTheme="blue"
            formula="Conteggio atleti registrati (joinDate) nel periodo selezionato"
            formulaDescription="Rappresenta l'acquisizione di nuovi clienti all'interno della finestra temporale."
            onClick={() => onNavigate('atleti')}
          />

          {/* 5. Atleti Persi */}
          <KpiCard
            id="kpi-5-atleti-persi"
            title="Atleti Persi"
            value={metrics.atletiPersi}
            subtitle="Inattivi o disdetti"
            icon={<UserMinus className="w-5 h-5" />}
            colorTheme="red"
            formula="Conteggio atleti inattivi, scaduti o disdetti nel periodo"
            formulaDescription="Rileva i clienti usciti dal centro o che non hanno rinnovato l'iscrizione."
            onClick={() => onNavigate('atleti')}
          />

          {/* 6. Abbonamenti in Scadenza */}
          <KpiCard
            id="kpi-6-abbonamenti-in-scadenza"
            title="Abbonamenti in Scadenza"
            value={metrics.abbonamentiInScadenza}
            subtitle="Scadono nei prossimi 30 giorni"
            icon={<Clock className="w-5 h-5" />}
            colorTheme="amber"
            formula="Conteggio abbonamenti attivi con endDate nei prossimi 30 giorni"
            formulaDescription="Opportunità di rinnovo da contattare preventivamente."
            onClick={() => onNavigate('scadenze')}
          />

          {/* 7. Pagamenti in Scadenza */}
          <KpiCard
            id="kpi-7-pagamenti-in-scadenza"
            title="Pagamenti in Scadenza"
            value={metrics.pagamentiInScadenza}
            subtitle="Rate imminenti nei prossimi 30gg"
            icon={<CreditCard className="w-5 h-5" />}
            colorTheme="blue"
            formula="Conteggio rate con stato 'da pagare' / 'in scadenza' nei prossimi 30gg"
            formulaDescription="Monitora le rate che andranno a incasso a breve."
            onClick={() => onNavigate('pagamenti')}
          />

          {/* 8. Pagamenti Scaduti */}
          <KpiCard
            id="kpi-8-pagamenti-scaduti"
            title="Pagamenti Scaduti"
            value={metrics.pagamentiScaduti}
            subtitle="Rate superate non incassate"
            icon={<AlertCircle className="w-5 h-5" />}
            colorTheme="red"
            formula="Conteggio rate con dataScadenza < oggi e importoResiduo > 0"
            formulaDescription="Mostra il numero di transazioni o rate in ritardo rispetto alla scadenza pattuita."
            onClick={() => onNavigate('pagamenti')}
          />

          {/* 9. Totale da Incassare */}
          <KpiCard
            id="kpi-9-totale-da-incassare"
            title="Totale da Incassare"
            value={`€ ${metrics.totaleDaIncassare.toLocaleString()}`}
            subtitle="Somma di tutti i residui attivi"
            icon={<Euro className="w-5 h-5" />}
            colorTheme="amber"
            formula="Σ (Importo Previsto - Importo Pagato) per pagamenti validi non annullati"
            formulaDescription="Totale del credito residuo da riscuotere nei confronti degli atleti."
            onClick={() => onNavigate('pagamenti')}
          />

          {/* 10. Incassato nel Mese */}
          <KpiCard
            id="kpi-10-incassato-mese"
            title="Incassato nel Mese"
            value={`€ ${metrics.incassatoNelMese.toLocaleString()}`}
            subtitle="Accreditato nel mese solare"
            icon={<DollarSign className="w-5 h-5" />}
            colorTheme="emerald"
            formula="Σ (Importo Pagato) accreditato nel mese corrente (esclusi annullati/rimborsi)"
            formulaDescription="Rappresenta la liquidità reale effettivamente entrata nel mese in corso."
            onClick={() => onNavigate('pagamenti')}
          />

          {/* 11. Incassato nell'Anno */}
          <KpiCard
            id="kpi-11-incassato-anno"
            title="Incassato nell'Anno"
            value={`€ ${metrics.incassatoNellAnno.toLocaleString()}`}
            subtitle="Totale accreditato nell'anno"
            icon={<TrendingUp className="w-5 h-5" />}
            colorTheme="emerald"
            formula="Σ (Importo Pagato) accreditato nell'anno solare corrente"
            formulaDescription="Volume di incassi reali conseguiti dall'inizio dell'anno."
            onClick={() => onNavigate('pagamenti')}
          />

          {/* 12. Entrate Previste */}
          <KpiCard
            id="kpi-12-entrate-previste"
            title="Entrate Previste"
            value={`€ ${metrics.entratePreviste.toLocaleString()}`}
            subtitle="Contratti e rate nel periodo"
            icon={<Calendar className="w-5 h-5" />}
            colorTheme="blue"
            formula="Σ (Importo Previsto) di contratti/rate nel periodo selezionato"
            formulaDescription="Valore finanziario teorico stimato dai contratti sottoscritti."
            onClick={() => onNavigate('report')}
          />

          {/* 13. Insoluti */}
          <KpiCard
            id="kpi-13-insoluti"
            title="Insoluti Totali"
            value={`€ ${metrics.insoluti.toLocaleString()}`}
            subtitle="Crediti scaduti e da sollecitar"
            icon={<TrendingDown className="w-5 h-5" />}
            colorTheme="red"
            formula="Σ (Importo Residuo) delle rate scadute e non pagate"
            formulaDescription="Ammontare economico dei pagamenti in ritardo rispetto alla scadenza."
            onClick={() => onNavigate('pagamenti')}
          />

          {/* 14. Tasso di Incasso */}
          <KpiCard
            id="kpi-14-tasso-incasso"
            title="Tasso di Incasso"
            value={`${metrics.tassoDiIncasso}%`}
            subtitle="Efficienza riscossione stimata"
            icon={<ShieldCheck className="w-5 h-5" />}
            colorTheme="emerald"
            formula="(Totale Incassato Effettivo / Totale Entrate Previste) × 100"
            formulaDescription="Misura la capacità del centro di trasformare i contratti previsti in incassi reali."
            onClick={() => onNavigate('report')}
          />

          {/* 15. Tasso di Rinnovo */}
          <KpiCard
            id="kpi-15-tasso-rinnovo"
            title="Tasso di Rinnovo"
            value={`${metrics.tassoDiRinnovo}%`}
            subtitle="Conversioni contratti arrivati a fine"
            icon={<RefreshCw className="w-5 h-5" />}
            colorTheme="amber"
            formula="(Rinnovi confermati o rinnovati nel periodo / Totale rinnovi nel periodo) × 100"
            formulaDescription="Stima dimostrativa calcolata sui rinnovi aggiornati nel periodo selezionato."
            onClick={() => onNavigate('rinnovi')}
          />

          {/* 16. Churn Rate */}
          <KpiCard
            id="kpi-16-churn-rate"
            title="Churn Rate"
            value={`${metrics.churnRate}%`}
            subtitle="Tasso di abbandono atleti"
            icon={<UserMinus className="w-5 h-5" />}
            colorTheme="red"
            formula="Uscite nel periodo / (Atleti attivi o sospesi + Uscite nel periodo) × 100"
            formulaDescription="Valore dimostrativo stimato usando updatedAt come riferimento temporale per le uscite."
            onClick={() => onNavigate('report')}
          />

          {/* 17. Valore Medio per Atleta */}
          <KpiCard
            id="kpi-17-arpu"
            title="Valore Medio (ARPU)"
            value={`€ ${metrics.valoreMedioPerAtleta.toLocaleString()}`}
            subtitle="Incasso medio per atleta attivo"
            icon={<Euro className="w-5 h-5" />}
            colorTheme="purple"
            formula="Incassato nell'Anno / Numero Atleti Attivi"
            formulaDescription="Rendimento medio generato da ciascun atleta attivo su base annua."
            onClick={() => onNavigate('report')}
          />

          {/* 18. MRR */}
          <KpiCard
            id="kpi-18-mrr"
            title="MRR (Ricavo Ricorrente)"
            value={`€ ${Math.round(metrics.mrr).toLocaleString()}`}
            subtitle="Ricavo mensile medio garantito"
            icon={<TrendingUp className="w-5 h-5" />}
            colorTheme="amber"
            formula="Σ (Valore Contratto / Mesi Durata) per abbonamenti attivi"
            formulaDescription="Monthly Recurring Revenue: fatturato mensile ricavato dalla normalizzazione dei contratti."
            onClick={() => onNavigate('report')}
          />

          {/* 19. ARR */}
          <KpiCard
            id="kpi-19-arr"
            title="ARR (Ricavo Annualizzato)"
            value={`€ ${Math.round(metrics.arr).toLocaleString()}`}
            subtitle="Ricavo ricorrente su base annua"
            icon={<DollarSign className="w-5 h-5" />}
            colorTheme="amber"
            formula="MRR × 12 (Proiezione su 12 mesi)"
            formulaDescription="Annual Recurring Revenue: stima del fatturato ricorrente annuo."
            onClick={() => onNavigate('report')}
          />

          {/* 20. Attività da Completare */}
          <KpiCard
            id="kpi-20-attivita"
            title="Attività da Completare"
            value={metrics.attivitaDaCompletare}
            subtitle="Task e appuntamenti aperti"
            icon={<CheckSquare className="w-5 h-5" />}
            colorTheme="zinc"
            formula="Conteggio dei task e attività con stato diverso da 'completata'"
            formulaDescription="Rileva le mansioni gestionali, amministrative e tecniche ancora da svolgere."
            onClick={() => onNavigate('attivita')}
          />
        </div>
      </div>

      {/* SEZZIONI RAPIDE & SCADENZE OPERATIVE */}
      <QuickSectionsWidget
        athletes={athletes}
        subscriptions={subscriptions}
        payments={payments}
        renewals={renewals}
        tasks={tasks}
        documents={documents}
        alerts={alerts}
        onNavigate={onNavigate}
        openQuickRegisterModal={openQuickRegisterModal}
      />

      {/* GRAFICI ANALITICI COMPLETI (9 GRAFICI) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Analisi Grafica ed Elaborazione Dati (9 Grafici)</span>
        </h3>

        <DashboardCharts
          monthlyTrends={monthlyTrendsData}
          packageDistribution={packageDistributionData}
          coachDistribution={coachDistributionData}
          renewalDistribution={renewalDistributionData}
          paymentPunctuality={paymentPunctualityData}
        />
      </div>
    </div>
  );
};
