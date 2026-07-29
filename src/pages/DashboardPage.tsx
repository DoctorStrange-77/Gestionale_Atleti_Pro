import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentsContext';
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
  Plus,
  RefreshCw,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, organizationName } = useAuth();
  const { openQuickRegisterModal, payments, triggerSystemStatusRecalculation } = usePayments();

  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await triggerSystemStatusRecalculation(user?.fullName || 'Amministratore');
    } finally {
      setIsRecalculating(false);
    }
  };

  const totalIncassato = payments.reduce((acc, p) => acc + (p.importoPagato || 0), 0);
  const totalInscadenza = payments.filter((p) => p.stato === 'in scadenza' || p.stato === 'da pagare' || p.stato === 'pagato parzialmente').length;

  return (
    <div className="space-y-6">
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
              Benvenuto, {user?.fullName || 'Coach'}!
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Pannello di controllo gestionale di <strong className="text-zinc-200">{organizationName}</strong>. Monitora i tuoi atleti, le scadenze e la crescita economica.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-quick-recalculate-dashboard"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md hover:border-amber-500/50 disabled:opacity-50"
              title="Calcola e aggiorna automaticamente tutti gli stati"
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

      {/* KPI Overview Grid (Placeholder metrics ready for Supabase data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Atleti Attivi */}
        <div
          id="kpi-atleti-attivi"
          onClick={() => onNavigate('atleti')}
          className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Atleti Attivi
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-100">0</p>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Nessun atleta registrato</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Abbonamenti Attivi */}
        <div
          id="kpi-abbonamenti-attivi"
          onClick={() => onNavigate('abbonamenti')}
          className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Abbonamenti Attivi
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-100">0</p>
            <p className="text-[11px] text-zinc-500 mt-1">Pacchetti attivi in corso</p>
          </div>
        </div>

        {/* Metric 3: Scadenze Imminenti (Red badge for urgent attention) */}
        <div
          id="kpi-scadenze"
          onClick={() => onNavigate('scadenze')}
          className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Scadenze (30gg)
            </span>
            <div className="p-2.5 bg-red-950/60 border border-red-800/60 text-red-400 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-red-400">0</p>
            <p className="text-[11px] text-zinc-500 mt-1">Rinnovi e rate in scadenza</p>
          </div>
        </div>

        {/* Metric 4: Incasso Mese */}
        <div
          id="kpi-incasso-mese"
          onClick={() => onNavigate('pagamenti')}
          className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Incassi Mese
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-400">€ 0,00</p>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>Totale incassato questo mese</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area: Initially Empty / Structure placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prossime Attività & Scadenze */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Prossime Attività e Appuntamenti</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualizza le sessioni e le comunicazioni programmate.
                </p>
              </div>
              <button
                id="btn-goto-calendario"
                onClick={() => onNavigate('calendario')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Vedi Calendario →
              </button>
            </div>

            <div className="p-8 text-center bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-300">Nessuna attività in programma</p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                La dashboard si popolerà automaticamente man mano che aggiungerai atleti, abbonamenti e scadenze.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Actions */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              <span>Azioni Rapide</span>
            </h3>

            <div className="space-y-2">
              <button
                id="btn-quick-atleti"
                onClick={() => onNavigate('atleti')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-zinc-200 transition-colors"
              >
                <span>Gestisci Anagrafica Atleti</span>
                <span className="text-amber-400 font-bold">→</span>
              </button>

              <button
                id="btn-quick-pacchetti"
                onClick={() => onNavigate('pacchetti')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-zinc-200 transition-colors"
              >
                <span>Crea e Modifica Pacchetti</span>
                <span className="text-amber-400 font-bold">→</span>
              </button>

              <button
                id="btn-quick-pagamenti"
                onClick={() => openQuickRegisterModal()}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-400 font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  <span>Registra Pagamento o Rata</span>
                </span>
                <span className="text-amber-400 font-bold">+</span>
              </button>

              <button
                id="btn-quick-report"
                onClick={() => onNavigate('report')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-zinc-200 transition-colors"
              >
                <span>Visualizza Report KPI</span>
                <span className="text-amber-400 font-bold">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
