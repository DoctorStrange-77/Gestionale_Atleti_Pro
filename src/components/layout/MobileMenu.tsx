import React from 'react';
import { NavigationTab } from '../../types';
import { NAVIGATION_ITEMS } from '../../data/navigation';
import { NavIcon } from '../common/NavIcon';
import { useAuth } from '../../context/AuthContext';
import { getAllowedTabsForRole, ROLE_DEFINITIONS } from '../../lib/permissions';
import { X, Dumbbell, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
}) => {
  const { user, logout, organizationName } = useAuth();
  const allowedTabs = user ? getAllowedTabsForRole(user.role) : [];
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => allowedTabs.includes(item.id));

  const handleItemClick = (tab: NavigationTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-80 max-w-[85vw] bg-zinc-950 border-r border-zinc-800/80 h-full flex flex-col z-10 shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
                  <Dumbbell className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wider text-amber-400">
                    BUILDER ATHLETE
                  </h2>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                    Doctor Strength
                  </p>
                </div>
              </div>

              <button
                id="btn-close-mobile-menu"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800"
                aria-label="Chiudi menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Badge */}
            <div className="p-4 bg-zinc-900/50 border-b border-zinc-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                {user?.fullName?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-100 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-amber-400 font-medium truncate">{organizationName}</p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
              {filteredNavItems.map((item) => {
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <NavIcon
                        name={item.iconName}
                        className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.badgeType === 'red'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : item.badgeType === 'gold'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
              <button
                id="btn-mobile-logout"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 font-bold text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnetti Coach</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
