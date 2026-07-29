import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, Lock, EyeOff } from 'lucide-react';
import { ROLE_DEFINITIONS } from '../../lib/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireFinancials?: boolean;
  requireTechnicalNotes?: boolean;
  fallbackMessage?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireFinancials = false,
  requireTechnicalNotes = false,
  fallbackMessage,
}) => {
  const { user } = useAuth();

  if (!user) return null;

  // Check role restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleInfo = ROLE_DEFINITIONS[user.role];
    return (
      <div className="p-8 my-6 bg-zinc-900/90 border border-red-500/30 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Accesso Riservato</h3>
          <p className="text-xs text-zinc-300">
            {fallbackMessage ||
              `La sezione richiesta non è accessibile con il ruolo attuale (${roleInfo.name}).`}
          </p>
        </div>
        <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
          Ruoli autorizzati: <span className="font-semibold text-amber-400">{allowedRoles.map((r) => ROLE_DEFINITIONS[r].name).join(', ')}</span>
        </div>
      </div>
    );
  }

  // Check financial permission restriction
  if (requireFinancials && !user.canViewFinancials) {
    return (
      <div className="p-6 my-4 bg-zinc-950/90 border border-amber-500/30 rounded-2xl text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <EyeOff className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-400">Dati Economici Riservati</h4>
          <p className="text-xs text-zinc-300 mt-1">
            La visibilità dei dati finanziari per il tuo ruolo ({ROLE_DEFINITIONS[user.role].name}) non è attualmente abilitata.
          </p>
        </div>
      </div>
    );
  }

  // Check technical notes restriction (e.g. Segreteria)
  if (requireTechnicalNotes && (user.role === 'segreteria' || user.role === 'atleta')) {
    return (
      <div className="p-4 my-2 bg-zinc-950/90 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs">
        <Lock className="w-5 h-5 text-blue-400 shrink-0" />
        <div>
          <span className="font-bold text-blue-400 block">Note Tecniche Riservate al Coach</span>
          <span className="text-zinc-300">
            Il ruolo {ROLE_DEFINITIONS[user.role].name} gestisce l'area amministrativa e non ha accesso alle note tecniche riservate.
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
