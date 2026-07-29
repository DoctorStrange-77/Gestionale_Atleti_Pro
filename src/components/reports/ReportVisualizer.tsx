import React, { useState } from 'react';
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Euro,
  FileSpreadsheet,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ReportSummary, exportToCSV } from '../../utils/reportCalculations';

interface ReportVisualizerProps {
  summary: ReportSummary;
  onPrint: () => void;
}

const COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export const ReportVisualizer: React.FC<ReportVisualizerProps> = ({ summary, onPrint }) => {
  const [tableSearch, setTableSearch] = useState('');

  const handleCsvExport = () => {
    const headers = [
      'Data',
      'Titolo',
      'Categoria',
      'Atleta',
      'Coach',
      'Pacchetto',
      'Servizio',
      'Metodo Pagamento',
      'Stato',
      'Importo Previsto',
      'Importo Incassato',
      'Residuo / Insoluto',
    ];

    const rows = summary.items.map((i) => [
      i.date,
      i.title,
      i.category,
      i.athleteName,
      i.coachName,
      i.packageName,
      i.serviceType,
      i.paymentMethod,
      i.status,
      i.amountExpected,
      i.amountPaid,
      i.amountRemaining,
    ]);

    exportToCSV(`report_${summary.reportKey}`, headers, rows);
  };

  const filteredItems = summary.items.filter((item) => {
    const term = tableSearch.toLowerCase();
    return (
      item.athleteName.toLowerCase().includes(term) ||
      item.coachName.toLowerCase().includes(term) ||
      item.packageName.toLowerCase().includes(term) ||
      item.title.toLowerCase().includes(term) ||
      item.paymentMethod.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Report Header & Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md inline-block mb-1">
            Analisi Attiva
          </span>
          <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
            <span>{summary.reportName}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Elaborazione di {summary.totalItemsCount} elementi registrati nel periodo selezionato.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* CSV Export */}
          <button
            onClick={handleCsvExport}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            title="Scarica dati in formato CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Esporta CSV</span>
          </button>

          {/* Stampa / PDF Export */}
          <button
            onClick={onPrint}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            title="Stampa o Salva in formato PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Stampa / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Totale Incassato Effettivo</span>
            <Euro className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            € {summary.totalCollected.toLocaleString()}
          </p>
          {summary.growthPercentage !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs font-bold">
              {summary.growthPercentage >= 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{summary.growthPercentage}%
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {summary.growthPercentage}%
                </span>
              )}
              <span className="text-zinc-500 font-normal">vs periodo prec.</span>
            </div>
          )}
        </div>

        {/* Total Expected */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Entrate Previste / Contrattualizzate</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">
            € {summary.totalExpected.toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-500 mt-2 block">
            Fatturato stimato o programmato
          </span>
        </div>

        {/* Total Overdue */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Crediti Scaduti / Insoluti</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 mt-2 font-mono">
            € {summary.totalOverdue.toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-500 mt-2 block">
            Importi ancora da sollecitare
          </span>
        </div>

        {/* Item Count / Average Value */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Volume Voci / Valore Medio</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-zinc-100 mt-2">
            {summary.totalItemsCount} <span className="text-sm text-zinc-400 font-normal">voci</span>
          </p>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            Valore medio per voce: <strong className="text-zinc-200">€ {summary.averageItemValue}</strong>
          </span>
        </div>
      </div>

      {/* Chart Visualization Section */}
      {summary.groupedData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Bar Chart */}
          <div className="lg:col-span-2 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Distribuzione Valori per Categoria</span>
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.groupedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" stroke="#a1a1aa" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                    formatter={(val: any) => [`€ ${Number(val).toLocaleString()}`, 'Valore']}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Distribution */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <span>Proporzioni %</span>
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.groupedData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {summary.groupedData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                    formatter={(val: any) => [`€ ${Number(val).toLocaleString()}`, 'Valore']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Items Table */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Dettaglio Elementi ({filteredItems.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Cerca in tabella..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <th className="p-3">Data</th>
                <th className="p-3">Descrizione</th>
                <th className="p-3">Atleta</th>
                <th className="p-3">Coach</th>
                <th className="p-3">Pacchetto</th>
                <th className="p-3">Metodo</th>
                <th className="p-3">Stato</th>
                <th className="p-3 text-right">Incassato</th>
                <th className="p-3 text-right">Insoluto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-xs text-zinc-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-zinc-500">
                    Nessun dato corrispondente ai criteri selezionati.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-3 font-mono text-zinc-400">{item.date}</td>
                    <td className="p-3 font-semibold text-zinc-200">{item.title}</td>
                    <td className="p-3">{item.athleteName}</td>
                    <td className="p-3 text-zinc-400">{item.coachName}</td>
                    <td className="p-3">{item.packageName}</td>
                    <td className="p-3 capitalize text-zinc-400">{item.paymentMethod}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.status === 'pagato' || item.status === 'attivo' || item.status === 'confermato'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'scaduto' || item.status === 'non rinnovato'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      € {item.amountPaid.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-red-400">
                      {item.amountRemaining > 0 ? `€ ${item.amountRemaining.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
