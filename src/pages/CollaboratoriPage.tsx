import React, { useState } from 'react';
import { UserCheck, Plus, Shield, Eye, EyeOff, Crown, Mail, Trash2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ROLE_DEFINITIONS, canManageOwnership, canManageMembers } from '../lib/permissions';
import { RoleGuard } from '../components/auth/RoleGuard';

export const CollaboratoriPage: React.FC = () => {
  const {
    user,
    members,
    inviteMember,
    updateMemberRole,
    toggleMemberFinancials,
    transferOwnership,
  } = useAuth();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('coach');

  const [selectedNewOwner, setSelectedNewOwner] = useState('');

  const isOwner = user ? canManageOwnership(user) : false;
  const isMemberManager = user ? canManageMembers(user) : false;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    inviteMember(inviteEmail, inviteName, inviteRole);
    setInviteEmail('');
    setInviteName('');
    setShowInviteModal(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewOwner) return;
    transferOwnership(selectedNewOwner);
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Gestione Staff, Ruoli & Permessi</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
              {members.length} Membri
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Organizzazione: <strong className="text-white">{user?.organizationName}</strong> • Isolamento multi-tenant attivo.
          </p>
        </div>

        {isMemberManager && (
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                id="btn-transfer-ownership"
                onClick={() => setShowTransferModal(true)}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Trasferisci Proprietà</span>
              </button>
            )}

            <button
              id="btn-add-collaboratore"
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Invita Membro Staff</span>
            </button>
          </div>
        )}
      </div>

      {/* Role Specs Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
          const rDef = ROLE_DEFINITIONS[rKey];
          return (
            <div
              key={rKey}
              className={`p-3 rounded-xl bg-zinc-950 border ${rDef.badgeColor} space-y-1`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{rDef.name}</span>
                <Shield className="w-3.5 h-3.5 opacity-80" />
              </div>
              <p className="text-[10px] text-zinc-300 leading-snug">{rDef.description}</p>
            </div>
          );
        })}
      </div>

      {/* Members Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Membri e Collaboratori dell'Organizzazione</span>
          </h3>
          <span className="text-xs text-zinc-400">Ruolo attuale: <strong className="text-amber-400">{user?.role}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Membro Staff</th>
                <th className="px-4 py-3">Ruolo Assegnato</th>
                <th className="px-4 py-3">Dati Economici</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {members.map((mem) => {
                const roleInfo = ROLE_DEFINITIONS[mem.roleCode];
                return (
                  <tr key={mem.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                          {mem.userFullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{mem.userFullName}</span>
                            {mem.roleCode === 'proprietario' && (
                              <Crown className="w-3.5 h-3.5 text-amber-400" title="Proprietario Organizzazione" />
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400">{mem.userEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {isMemberManager && mem.roleCode !== 'proprietario' ? (
                        <select
                          value={mem.roleCode}
                          onChange={(e) => updateMemberRole(mem.id, e.target.value as UserRole)}
                          className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="amministratore">Amministratore</option>
                          <option value="coach">Coach</option>
                          <option value="segreteria">Segreteria</option>
                          <option value="atleta">Atleta</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${roleInfo.badgeColor}`}>
                          {roleInfo.name}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {mem.roleCode === 'coach' ? (
                        isMemberManager ? (
                          <button
                            onClick={() => toggleMemberFinancials(mem.id, !mem.canViewFinancials)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                              mem.canViewFinancials
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            {mem.canViewFinancials ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Visibili</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-zinc-400" />
                                <span>Nascosti</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-zinc-400">{mem.canViewFinancials ? 'SI' : 'NO'}</span>
                        )
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          {mem.canViewFinancials ? 'Accesso Completo' : 'Limitato'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Attivo
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isMemberManager && mem.roleCode !== 'proprietario' && (
                        <button
                          onClick={() => alert(`Rimuovi ${mem.userFullName}`)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40"
                          title="Rimuovi Membro dallo Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Invita Collaboratore nello Staff
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Nome e Cognome</label>
                <input
                  type="text"
                  required
                  placeholder="es. Laura Bianchi"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="laura@doctorstrength.it"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Ruolo Iniziale</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="amministratore">Amministratore (Accesso operativo completo)</option>
                  <option value="coach">Coach (Atleti assegnati & schede)</option>
                  <option value="segreteria">Segreteria (Anagrafiche, pagamenti, rate, scadenze)</option>
                  <option value="atleta">Atleta (Portale atleta)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400"
                >
                  Invia Invito Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-amber-400 text-base flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Trasferisci Proprietà Organizzazione
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              <p className="font-bold">Attenzione:</p>
              <p className="mt-0.5">
                Solo il Proprietario può eseguire questa operazione. Trasferendo la proprietà a un altro utente, il tuo ruolo diventerà "Amministratore".
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Seleziona Nuovo Proprietario</label>
                <select
                  required
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Seleziona un membro...</option>
                  {members
                    .filter((m) => m.roleCode !== 'proprietario')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.userFullName} ({m.userEmail}) - {m.roleCode}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={!selectedNewOwner}
                  className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50"
                >
                  Conferma Trasferimento Proprietà
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
