import { NavItem } from '../types';

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { id: 'atleta_portale', label: 'Portale Atleta', iconName: 'User', badge: 'Atleta', badgeType: 'gold' },
  { id: 'atleti', label: 'Atleti', iconName: 'Users', badge: 'Attivi', badgeType: 'gold' },
  { id: 'pacchetti', label: 'Pacchetti', iconName: 'Package' },
  { id: 'abbonamenti', label: 'Abbonamenti', iconName: 'CreditCard' },
  { id: 'pagamenti', label: 'Pagamenti', iconName: 'Euro' },
  { id: 'scadenze', label: 'Scadenze', iconName: 'Clock', badge: '3', badgeType: 'red' },
  { id: 'rinnovi', label: 'Rinnovi', iconName: 'RefreshCw' },
  { id: 'attivita', label: 'Attività', iconName: 'CheckSquare' },
  { id: 'calendario', label: 'Calendario', iconName: 'Calendar' },
  { id: 'documenti', label: 'Documenti', iconName: 'FolderKanban' },
  { id: 'comunicazioni', label: 'Comunicazioni', iconName: 'MessageSquare' },
  { id: 'report', label: 'Report', iconName: 'BarChart3' },
  { id: 'collaboratori', label: 'Collaboratori', iconName: 'UserCheck' },
  { id: 'impostazioni', label: 'Impostazioni', iconName: 'Settings' },
];
