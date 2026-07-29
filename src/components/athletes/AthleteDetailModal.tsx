import React from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase, Calendar, Heart, Shield, Tag, MessageSquare, ExternalLink, Lock, Dumbbell, Clock, Edit2 } from 'lucide-react';
import { Athlete } from '../../types';
import { ATHLETE_STATUS_MAP, PAYMENT_STATUS_MAP, CONTACT_CHANNEL_LABELS, ACQUISITION_SOURCE_LABELS } from '../../lib/athleteHelpers';
import { canViewTechnicalNotes } from '../../lib/permissions';
import { useAuth } from '../../context/AuthContext';

interface AthleteDetailModalProps {
  athlete: Athlete | null;
  onClose: () => void;
  onEdit: (athlete: Athlete) => void;
  onChangeStatus: (athlete: Athlete, status: any) => void;
}

export const AthleteDetailModal: React.FC<AthleteDetailModalProps> = ({
  athlete,
  onClose,
  onEdit,
  onChangeStatus,
}) => {
  const { user } = useAuth();
  if (!athlete) return null;

  const canSeeNotes = canViewTechnicalNotes(user);
  const statusCfg = ATHLETE_STATUS_MAP[athlete.status] || ATHLETE_STATUS_MAP.attivo;
  const payCfg = PAYMENT_STATUS_MAP[athlete.paymentStatus] || PAYMENT_STATUS_MAP.regolare;

  const openWhatsApp = () => {
    const cleanPhone = athlete.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const openPhone = () => {
    window.location.href = `tel:${athlete.phone}`;
  };

  const openEmail = () => {
    window.location.href = `mailto:${athlete.email}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl space-y-0">
        {/* Header Hero */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={athlete.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={athlete.firstName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-950 ${statusCfg.dotClass}`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white">
                  {athlete.firstName} {athlete.lastName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusCfg.badgeClass}`}>
                  {statusCfg.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${payCfg.badgeClass}`}>
                  Pagamenti: {payCfg.label}
                </span>
              </div>

              <p className="text-xs text-zinc-400 flex items-center gap-3 flex-wrap">
                <span>Coach: <strong className="text-amber-400">{athlete.assignedCoachName || 'Non Assegnato'}</strong></span>
                <span>•</span>
                <span>Ingresso: <strong className="text-zinc-200">{athlete.joinDate}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
            <button
              onClick={openWhatsApp}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={openPhone}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Chiama</span>
            </button>

            <button
              onClick={openEmail}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Invia Email</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(athlete);
              }}
              className="ml-auto px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifica Scheda</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-xs max-h-[60vh] overflow-y-auto">
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Pacchetto Attivo</span>
              <p className="font-bold text-white text-xs">{athlete.activePackage || 'Nessun Pacchetto'}</p>
              <p className="text-[10px] text-amber-400">Scadenza: {athlete.expirationDate || 'N/A'}</p>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Disciplina & Obiettivo</span>
              <p className="font-bold text-white text-xs">{athlete.discipline || 'Fitness Generico'}</p>
              <p className="text-[10px] text-zinc-300 line-clamp-1">{athlete.goal || 'Mantenimento'}</p>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Certificato Medico</span>
              <p className="font-bold text-emerald-400 text-xs">{athlete.medicalCertificateExpiry || 'Valido'}</p>
              <p className="text-[10px] text-zinc-400">Cod. Fiscale: {athlete.fiscalCode || 'N/D'}</p>
            </div>
          </div>

          {/* Anagrafica e Contatti */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-2 border-b border-zinc-800 pb-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Dati Anagrafici & Dettagli di Contatto</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
              <p><strong className="text-zinc-400">Email:</strong> {athlete.email}</p>
              <p><strong className="text-zinc-400">Telefono:</strong> {athlete.phone}</p>
              <p><strong className="text-zinc-400">Data di Nascita:</strong> {athlete.birthDate || 'N/D'} ({athlete.gender || 'M'})</p>
              <p><strong className="text-zinc-400">Indirizzo:</strong> {athlete.address || 'N/D'} {athlete.city ? `- ${athlete.city} (${athlete.province})` : ''}</p>
              <p><strong className="text-zinc-400">Professione:</strong> {athlete.profession || 'N/D'}</p>
              <p><strong className="text-zinc-400">Canale Preferito:</strong> {athlete.preferredChannel ? CONTACT_CHANNEL_LABELS[athlete.preferredChannel] : 'WhatsApp'}</p>
              <p><strong className="text-zinc-400">Fonte Acquisizione:</strong> {athlete.acquisitionSource ? ACQUISITION_SOURCE_LABELS[athlete.acquisitionSource] : 'Passaparola'}</p>
            </div>

            {athlete.emergencyContact?.name && (
              <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-xs">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span className="text-zinc-400">Emergenza (ICE):</span>
                <strong className="text-white">{athlete.emergencyContact.name}</strong>
                <span className="text-amber-400 font-mono">({athlete.emergencyContact.phone})</span>
                {athlete.emergencyContact.relation && <span className="text-zinc-500">[{athlete.emergencyContact.relation}]</span>}
              </div>
            )}
          </div>

          {/* Note Tecniche */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
            <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Note Tecniche, Anamnesi & Programmazione</span>
            </h4>

            {canSeeNotes ? (
              <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                {athlete.notes || 'Nessuna nota tecnica riservata inserita.'}
              </p>
            ) : (
              <div className="p-3 bg-zinc-950 border border-blue-500/30 rounded-lg text-blue-400 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Note tecniche riservate ai ruoli Coach e Amministratore.</span>
              </div>
            )}
          </div>

          {/* Etichette */}
          <div className="space-y-1.5">
            <span className="font-bold text-zinc-400 text-[11px] block">Etichette & Tag Assegnati:</span>
            <div className="flex flex-wrap gap-1.5">
              {athlete.labels && athlete.labels.length > 0 ? (
                athlete.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold"
                  >
                    #{lbl}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500 italic text-[11px]">Nessuna etichetta</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">ID Atleta: <code className="text-amber-400">{athlete.id}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold"
          >
            Chiudi Scheda
          </button>
        </div>
      </div>
    </div>
  );
};
