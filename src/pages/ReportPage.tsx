import React from 'react';
import { BarChart3, TrendingUp, Users, Euro } from 'lucide-react';

export const ReportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Report e KPI Economici</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Analisi performance economiche, retention atleti, crescita abbonamenti e fatturato.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Fatturato Annuo</span>
            <Euro className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">€ 0,00</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Tasso di Retention</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-zinc-100 mt-2">0%</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Valore Medio Atleta (LTV)</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-zinc-100 mt-2">€ 0,00</p>
        </div>
      </div>

      <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-2">
        <BarChart3 className="w-10 h-10 text-zinc-600 mx-auto" />
        <p className="text-sm font-bold text-zinc-300">I grafici Recharts si genereranno automaticamente</p>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Con l'inserimento dei pagamenti e dei rinnovi, il sistema mostrerà report interattivi e trend di crescita.
        </p>
      </div>
    </div>
  );
};
