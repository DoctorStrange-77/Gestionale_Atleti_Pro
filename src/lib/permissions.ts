import { UserRole, UserProfile, NavigationTab } from '../types';

export const ROLE_DEFINITIONS: Record<UserRole, { name: string; description: string; badgeColor: string }> = {
  proprietario: {
    name: 'Proprietario',
    description: 'Accesso completo a tutto, inclusa la gestione della proprietà dell\'organizzazione',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  amministratore: {
    name: 'Amministratore',
    description: 'Accesso completo operativo, esclusa la modifica della proprietà dell\'organizzazione',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  },
  coach: {
    name: 'Coach',
    description: 'Vede e gestisce gli atleti assegnati. Visibilità dati economici configurabile',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  segreteria: {
    name: 'Segreteria',
    description: 'Gestisce dati anagrafici, pagamenti, rate, scadenze, rinnovi e documenti. No note tecniche',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  },
  atleta: {
    name: 'Atleta',
    description: 'Predisposto per il futuro portale atleta (prenotazioni, schede e ricevute personali)',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  },
};

/**
  * Checks whether the user can view financial data (revenue, totals, payment amounts).
  */
export function canViewFinancials(user: UserProfile | null): boolean {
  if (!user) return false;
  if (user.role === 'proprietario' || user.role === 'amministratore' || user.role === 'segreteria') {
    return true;
  }
  if (user.role === 'coach') {
    return user.canViewFinancials ?? false;
  }
  return false;
}

/**
  * Checks whether the user can view reserved technical notes.
  * Segreteria and Atleta CANNOT view reserved technical notes.
  */
export function canViewTechnicalNotes(user: UserProfile | null): boolean {
  if (!user) return false;
  if (user.role === 'segreteria' || user.role === 'atleta') {
    return false;
  }
  return true;
}

/**
  * Checks whether user can modify organization ownership.
  * Only Proprietario can transfer or modify ownership.
  */
export function canManageOwnership(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'proprietario';
}

/**
  * Checks whether user can manage organization members & roles.
  */
export function canManageMembers(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'proprietario' || user.role === 'amministratore';
}

/**
  * Returns tabs allowed for a given role.
  */
export function getAllowedTabsForRole(role: UserRole): NavigationTab[] {
  switch (role) {
    case 'proprietario':
    case 'amministratore':
      return [
        'dashboard',
        'atleti',
        'pacchetti',
        'abbonamenti',
        'pagamenti',
        'scadenze',
        'rinnovi',
        'attivita',
        'calendario',
        'documenti',
        'comunicazioni',
        'report',
        'collaboratori',
        'impostazioni',
      ];
    case 'coach':
      return [
        'dashboard',
        'atleti',
        'attivita',
        'calendario',
        'documenti',
        'comunicazioni',
        'report',
        'impostazioni',
      ];
    case 'segreteria':
      return [
        'dashboard',
        'atleti',
        'pacchetti',
        'abbonamenti',
        'pagamenti',
        'scadenze',
        'rinnovi',
        'attivita',
        'calendario',
        'documenti',
        'comunicazioni',
        'collaboratori',
        'impostazioni',
      ];
    case 'atleta':
      return [
        'atleta_portale',
        'calendario',
        'documenti',
        'comunicazioni',
        'impostazioni',
      ];
    default:
      return ['dashboard', 'atleti'];
  }
}
