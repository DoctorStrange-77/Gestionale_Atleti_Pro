import React from 'react';
import { NavigationTab } from '../../types';
import { NAVIGATION_ITEMS } from '../../data/navigation';
import { NavIcon } from '../common/NavIcon';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getAllowedTabsForRole, ROLE_DEFINITIONS } from '../../lib/permissions';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const allowedTabs = user ? getAllowedTabsForRole(user.role) : [];
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => allowedTabs.includes(item.id));

  return (
    <aside
      id="desktop-sidebar"
      className={`hidden lg:flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 relative z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-800 shadow-md"
              onError={(e) => {
                // Fallback icon on image load error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg text-zinc-950 font-black"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span
                className="text-sm font-black tracking-wider truncate"
                style={{ color: settings.primaryColor }}
              >
                {settings.businessName || 'BUILDER ATHLETE'}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 truncate">
                {user?.organizationName || 'Doctor Strength'}
              </span>
            </div>
          )}
        </div>

        <button
          id="btn-toggle-sidebar"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          title={isCollapsed ? 'Espandi Menu' : 'Riduci Menu'}
          aria-label={isCollapsed ? 'Espandi Menu' : 'Riduci Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredNavItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative group ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active Left Pill */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_#facc15]" />
              )}

              <div
                className={`shrink-0 transition-transform ${
                  isActive ? 'text-amber-400 scale-110' : 'group-hover:text-amber-400/80'
                }`}
              >
                <NavIcon name={item.iconName} className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Badge indicator */}
              {!isCollapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    item.badgeType === 'red'
                      ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                      : item.badgeType === 'gold'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot badge */}
              {isCollapsed && item.badge && (
                <span
                  className={`w-2 h-2 rounded-full absolute top-2 right-2 ${
                    item.badgeType === 'red' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info / User Role badge */}
      {!isCollapsed && user && (
        <div className="p-3 m-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-center text-[10px] text-zinc-300 space-y-1">
          <p className="font-semibold text-amber-400 truncate">{user.fullName}</p>
          <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 font-bold uppercase text-[9px] tracking-wider border border-zinc-700">
            {ROLE_DEFINITIONS[user.role].name}
          </span>
        </div>
      )}
    </aside>
  );
};

