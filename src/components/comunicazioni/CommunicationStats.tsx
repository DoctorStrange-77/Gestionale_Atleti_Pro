import React from 'react';
import { CommunicationLog } from '../../types';
import {
  MessageSquare,
  PhoneCall,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
} from 'lucide-react';

interface CommunicationStatsProps {
  communications: CommunicationLog[];
}

export const CommunicationStats: React.FC<CommunicationStatsProps> = ({ communications }) => {
  const totalLogs = communications.length;

  const todayStr = new Date().toISOString().split('T')[0];

  const pendingCount = communications.filter(
    (c) => c.outcome === 'in_attesa' || c.outcome === 'da_ricontattare'
  ).length;

  const upcomingContacts = communications.filter(
    (c) => c.nextContactDate && c.nextContactDate >= todayStr
  ).length;

  // Channel breakdown
  const whatsappCount = communications.filter((c) => c.channel === 'WhatsApp').length;
  const emailCount = communications.filter((c) => c.channel === 'email').length;
  const phoneCount = communications.filter((c) => c.channel === 'telefonata').length;
  const inPersonCount = communications.filter(
    (c) => c.channel === 'incontro' || c.channel === 'videochiamata'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat 1 */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Totale Comunicazioni
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-zinc-100">{totalLogs}</span>
            <span className="text-[10px] text-zinc-500 font-medium">registrate</span>
          </div>
        </div>
      </div>

      {/* Stat 2 */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Canali Principali
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-300 font-medium">
            <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 rounded border border-emerald-800/40">
              WA: {whatsappCount}
            </span>
            <span className="px-1.5 py-0.5 bg-sky-950/60 text-sky-400 rounded border border-sky-800/40">
              Mail: {emailCount}
            </span>
            <span className="px-1.5 py-0.5 bg-amber-950/60 text-amber-400 rounded border border-amber-800/40">
              Tel: {phoneCount}
            </span>
          </div>
        </div>
      </div>

      {/* Stat 3 */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Da Ricontattare
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
            <span className="text-[10px] text-zinc-500 font-medium">in attesa esito</span>
          </div>
        </div>
      </div>

      {/* Stat 4 */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Prossimi Contatti
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-zinc-100">{upcomingContacts}</span>
            <span className="text-[10px] text-zinc-500 font-medium">pianificati</span>
          </div>
        </div>
      </div>
    </div>
  );
};
