import React, { useState } from 'react';
import { NavigationTab } from '../../types';
import { NAVIGATION_ITEMS } from '../../data/navigation';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';
import { SupabaseNotice } from '../common/SupabaseNotice';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Building2,
  ChevronDown,
  Dumbbell,
  ShieldCheck,
  Euro,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onTabChange: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onTabChange,
}) => {
  const { user, logout, organizationName } = useAuth();
  const { openQuickRegisterModal } = usePayments();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentNavItem = NAVIGATION_ITEMS.find((item) => item.id === currentTab);

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left section: Mobile menu toggle & Active tab title */}
      <div className="flex items-center gap-3">
        <button
          id="btn-open-mobile-menu"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          aria-label="Apri menu mobile"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand icon */}
        <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black shrink-0">
          <Dumbbell className="w-4 h-4" />
        </div>

        <div>
          <h1 className="text-base lg:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span>{currentNavItem?.label || 'Dashboard'}</span>
          </h1>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            {organizationName} • Doctor Strength
          </p>
        </div>
      </div>

      {/* Right section: Search, Supabase status, Notifications, User profile */}
      <div className="flex items-center gap-2.5 lg:gap-3">
        {/* Quick Search trigger */}
        <button
          id="btn-header-search"
          onClick={() => onTabChange('atleti')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs transition-all"
        >
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span>Cerca atleta o abbonamento...</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 text-[10px] text-zinc-500 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Quick Registra Pagamento Button */}
        <button
          id="btn-header-registra-pagamento"
          onClick={() => openQuickRegisterModal()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10"
          title="Registra subito un nuovo incasso o rata"
        >
          <Euro className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Registra Pagamento</span>
        </button>

        {/* Supabase Status Indicator */}
        <SupabaseNotice />

        {/* Notifications Button */}
        <button
          id="btn-notifications"
          onClick={() => onTabChange('comunicazioni')}
          className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          title="Notifiche e Scadenze"
          aria-label="Notifiche e Scadenze"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-100 max-w-[120px] truncate">
                {user?.fullName || 'Coach'}
              </span>
              <span className="text-[10px] text-amber-400 font-medium">
                {user?.role === 'admin' ? 'Master Coach' : user?.role || 'Staff'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
              <div className="p-2.5 border-b border-zinc-800 text-xs">
                <p className="font-bold text-zinc-100 truncate">{user?.fullName}</p>
                <p className="text-zinc-400 truncate text-[11px]">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/60 text-[10px]">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">{organizationName}</span>
                </div>
              </div>

              <button
                id="btn-menu-impostazioni"
                onClick={() => {
                  onTabChange('impostazioni');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-amber-400 hover:bg-zinc-800/60 rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profilo e Impostazioni</span>
              </button>

              <button
                id="btn-logout"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnetti</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
