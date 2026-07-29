import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ROLE_DEFINITIONS } from '../../lib/permissions';
import { Building2, Shield, Eye, EyeOff, Plus, Database, Code, CheckCircle, ChevronDown, Lock } from 'lucide-react';
import { SqlScriptModal } from '../sql/SqlScriptModal';

export const OrgAndRoleSelector: React.FC = () => {
  const {
    user,
    organizations,
    switchOrganization,
    switchRole,
    toggleCoachFinancials,
    addOrganization,
  } = useAuth();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgVat, setNewOrgVat] = useState('');

  if (!user) return null;

  const currentRoleInfo = ROLE_DEFINITIONS[user.role];

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    addOrganization(newOrgName, newOrgVat);
    setNewOrgName('');
    setNewOrgVat('');
    setShowNewOrgModal(false);
  };

  return (
    <>
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Active Organization & Multi-Tenant Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              id="btn-select-organization"
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-amber-500/30 hover:border-amber-500/60 text-zinc-100 px-3 py-1.5 rounded-lg transition-all font-semibold shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[200px]">{user.organizationName}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                  Organizzazioni Disponibili
                </div>
                <div className="space-y-1 my-1">
                  {organizations.map((org) => {
                    const isSelected = org.id === user.organizationId;
                    return (
                      <button
                        key={org.id}
                        id={`org-option-${org.id}`}
                        onClick={() => {
                          switchOrganization(org.id);
                          setIsOrgDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <span className="truncate font-semibold">{org.name}</span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1 border-t border-zinc-800/80">
                  <button
                    id="btn-add-new-organization"
                    onClick={() => {
                      setIsOrgDropdownOpen(false);
                      setShowNewOrgModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors font-medium text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crea Nuova Organizzazione</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="text-zinc-400 hidden sm:inline">•</span>

          {/* Active Role Selector Badge */}
          <div className="relative">
            <button
              id="btn-select-role"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${currentRoleInfo.badgeColor}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Ruolo: {currentRoleInfo.name}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                  Seleziona Ruolo per Test & Simulazione
                </div>
                <div className="space-y-1 my-1">
                  {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
                    const rInfo = ROLE_DEFINITIONS[rKey];
                    const isSelected = user.role === rKey;
                    return (
                      <button
                        key={rKey}
                        id={`role-option-${rKey}`}
                        onClick={() => {
                          switchRole(rKey);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-zinc-800 text-white border border-amber-500/40'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>{rInfo.name}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-zinc-300 mt-0.5 leading-tight">{rInfo.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Coach Financials Toggle button if in Coach role */}
          {user.role === 'coach' && (
            <button
              id="btn-toggle-coach-financials"
              onClick={() => toggleCoachFinancials()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                user.canViewFinancials
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
              }`}
              title="Attiva o disattiva la visibilità dei dati economici per il ruolo Coach"
            >
              {user.canViewFinancials ? (
                <>
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Dati Economici: ABILITATI</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-zinc-300" />
                  <span>Dati Economici: DISABILITATI</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Side: SQL & RLS Schema Button */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            id="btn-open-sql-schema"
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <Code className="w-3.5 h-3.5 hidden sm:inline" />
            <span>Query SQL & RLS</span>
          </button>
        </div>
      </div>

      {/* Modal for creating a new organization */}
      {showNewOrgModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Building2 className="w-5 h-5" />
                <h3>Crea Nuova Organizzazione</h3>
              </div>
              <button
                onClick={() => setShowNewOrgModal(false)}
                className="text-zinc-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Nome Attività / Palestra / Centro</label>
                <input
                  type="text"
                  required
                  placeholder="es. Titan Performance Club"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Partita IVA / Codice Fiscale (Opzionale)</label>
                <input
                  type="text"
                  placeholder="IT12345678901"
                  value={newOrgVat}
                  onChange={(e) => setNewOrgVat(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-zinc-400 space-y-1">
                <p className="font-semibold text-amber-400">Isolamento Completo dei Dati</p>
                <p>Ogni nuova organizzazione ha un id univoco e non vedrà mai i dati delle altre organizzazioni (Row Level Security in Supabase).</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl hover:brightness-110"
                >
                  Crea Organizzazione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal displaying complete SQL query and RLS script */}
      {showSqlModal && <SqlScriptModal onClose={() => setShowSqlModal(false)} />}
    </>
  );
};
