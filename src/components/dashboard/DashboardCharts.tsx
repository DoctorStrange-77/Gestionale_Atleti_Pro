import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  UserX,
  PieChart as PieIcon,
  CreditCard,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  MonthlyRevenueData,
  PackageDistributionData,
  CoachDistributionData,
  RenewalStatusData,
  PaymentPunctualityData,
} from '../../utils/dashboardChartData';

interface DashboardChartsProps {
  monthlyTrends: MonthlyRevenueData[];
  packageDistribution: PackageDistributionData[];
  coachDistribution: CoachDistributionData[];
  renewalDistribution: RenewalStatusData[];
  paymentPunctuality: PaymentPunctualityData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyTrends,
  packageDistribution,
  coachDistribution,
  renewalDistribution,
  paymentPunctuality,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'athletes' | 'packages_coaches'>('financial');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-amber-400 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-zinc-400">{entry.name}:</span>
              <span className="font-mono font-bold text-zinc-100">
                {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('incasso') || entry.name?.toLowerCase().includes('entrat')
                  ? `€${entry.value.toLocaleString()}`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category selector tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'financial'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Grafici Finanziari e Incassi</span>
          </button>

          <button
            onClick={() => setActiveTab('athletes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'athletes'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Andamento Atleti & Retention</span>
          </button>

          <button
            onClick={() => setActiveTab('packages_coaches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'packages_coaches'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span>Distribuzione Pacchetti & Coach</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 px-3 hidden md:inline">
          9 Grafici Analitici Interattivi
        </span>
      </div>

      {/* Tab 1: Financial Charts */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Incassi Mensili */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>1. Incassi Mensili (€)</span>
              </h4>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Effettivo
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `€${val}`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="reali" name="Incasso Reale" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Entrate Previste vs Reali */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>2. Entrate Previste vs Reali</span>
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Confronto
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `€${val}`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="previste" name="Entrate Previste" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reali" name="Incassato Effettivo" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 9: Pagamenti Puntuali e in Ritardo */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>9. Pagamenti Puntuali e in Ritardo</span>
              </h4>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                Puntualità Solleciti
              </span>
            </div>
            <div className="h-64 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPunctuality}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {paymentPunctuality.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Athletes & Growth Charts */}
      {activeTab === 'athletes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Nuovi Atleti */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>3. Nuovi Atleti Iscritti</span>
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Acquisizione
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="nuoviAtleti" name="Nuovi Atleti" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Atleti Persi */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-400" />
                <span>4. Atleti Persi / Churn</span>
              </h4>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                Tasso Disdetta
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="atletiPersi" name="Atleti Persi" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Andamento degli Atleti Attivi */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>5. Andamento degli Atleti Attivi nel Tempo</span>
              </h4>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Trend Crescita
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorAttivi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="atletiAttivi"
                    name="Totale Atleti Attivi"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAttivi)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Packages, Coaches & Renewals Distribution */}
      {activeTab === 'packages_coaches' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 6: Distribuzione per Pacchetto */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>6. Distribuzione per Pacchetto</span>
              </h4>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Mix Prodotti
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 15)}... (${(percent * 100).toFixed(0)}%)`}
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-pkg-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 7: Distribuzione per Coach */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>7. Distribuzione per Coach</span>
              </h4>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Assegnazioni
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coachDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={11} />
                  <YAxis dataKey="coachName" type="category" stroke="#71717a" fontSize={11} width={110} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Atleti Assegnati" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 8: Rinnovi */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>8. Esito e Stato dei Rinnovi</span>
              </h4>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Conversioni
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={renewalDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="status" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Numero Rinnovi" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
