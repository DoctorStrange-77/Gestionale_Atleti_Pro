import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase, Calendar, Target, Shield, Tag, Heart, ChevronRight, Check } from 'lucide-react';
import { Athlete, AthleteFormData, AthleteStatus, ContactChannel, AcquisitionSource, PaymentStatus } from '../../types';
import { ATHLETE_STATUS_MAP, ACQUISITION_SOURCE_LABELS, CONTACT_CHANNEL_LABELS } from '../../lib/athleteHelpers';
import { useAuth } from '../../context/AuthContext';

interface AthleteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AthleteFormData) => void;
  initialData?: Athlete | null;
  title?: string;
}

export const AthleteFormModal: React.FC<AthleteFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const { members } = useAuth();
  const [activeTab, setActiveTab] = useState<'anagrafica' | 'contatti' | 'gestione' | 'note'>('anagrafica');

  const [formData, setFormData] = useState<AthleteFormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    profession: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    preferredChannel: 'whatsapp',
    joinDate: new Date().toISOString().split('T')[0],
    acquisitionSource: 'passaparola',
    assignedCoachId: '',
    assignedCoachName: '',
    goal: '',
    discipline: 'Powerlifting',
    status: 'attivo',
    activePackage: 'Abbonamento Mensile',
    expirationDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'regolare',
    notes: '',
    labels: ['Fitness'],
  });

  const [tagInput, setTagInput] = useState('');

  const coaches = members.filter(
    (m) => m.roleCode === 'coach' || m.roleCode === 'proprietario' || m.roleCode === 'amministratore'
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        birthDate: initialData.birthDate || '',
        gender: initialData.gender || 'M',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        city: initialData.city || '',
        province: initialData.province || '',
        profession: initialData.profession || '',
        emergencyContactName: initialData.emergencyContact?.name || '',
        emergencyContactPhone: initialData.emergencyContact?.phone || '',
        emergencyContactRelation: initialData.emergencyContact?.relation || '',
        preferredChannel: initialData.preferredChannel || 'whatsapp',
        joinDate: initialData.joinDate || new Date().toISOString().split('T')[0],
        acquisitionSource: initialData.acquisitionSource || 'passaparola',
        assignedCoachId: initialData.assignedCoachId || '',
        assignedCoachName: initialData.assignedCoachName || '',
        goal: initialData.goal || '',
        discipline: initialData.discipline || 'Powerlifting',
        status: initialData.status || 'attivo',
        activePackage: initialData.activePackage || 'Abbonamento Mensile',
        expirationDate: initialData.expirationDate || '',
        paymentStatus: initialData.paymentStatus || 'regolare',
        notes: initialData.notes || '',
        labels: initialData.labels || [],
      });
    } else {
      // Default coach if available
      const defaultCoach = coaches[0];
      setFormData((prev) => ({
        ...prev,
        assignedCoachId: defaultCoach?.userId || defaultCoach?.id || '',
        assignedCoachName: defaultCoach?.userFullName || 'Coach Unassigned',
      }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    if (!tagInput.trim()) return;

    if (!formData.labels.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, labels: [...prev.labels, tagInput.trim()] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleCoachSelect = (coachId: string) => {
    const selected = coaches.find((c) => c.userId === coachId || c.id === coachId);
    setFormData((prev) => ({
      ...prev,
      assignedCoachId: coachId,
      assignedCoachName: selected ? selected.userFullName : 'Coach',
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
              {initialData ? 'Modifica Atleta' : 'Nuovo Atleta'}
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {title || (initialData ? `Modifica: ${initialData.firstName} ${initialData.lastName}` : 'Registra Nuovo Atleta')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'anagrafica', label: '1. Anagrafica', icon: User },
            { id: 'contatti', label: '2. Contatti & Emergenza', icon: Phone },
            { id: 'gestione', label: '3. Stato & Coach', icon: Target },
            { id: 'note', label: '4. Note & Etichette', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: ANAGRAFICA */}
          {activeTab === 'anagrafica' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Nome <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="es. Mario"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Cognome <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="es. Rossi"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data di Nascita</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Sesso</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="M">Maschile (M)</option>
                    <option value="F">Femminile (F)</option>
                    <option value="Altro">Altro / Non specificato</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">Indirizzo di Residenza</label>
                  <input
                    type="text"
                    placeholder="es. Via Garibaldi 12"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Città</label>
                  <input
                    type="text"
                    placeholder="es. Roma"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Provincia</label>
                  <input
                    type="text"
                    placeholder="es. RM"
                    maxLength={2}
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Professione / Occupazione</label>
                  <input
                    type="text"
                    placeholder="es. Ingegnere / Studente"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-[11px] text-amber-300">
                <span>Procedi al prossimo passaggio per inserire contatti ed emergenza.</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('contatti')}
                  className="px-2.5 py-1 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Avanti →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONTATTI & EMERGENZA */}
          {activeTab === 'contatti' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Telefono / Cellulare <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="es. +39 333 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Email <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="es. atleta@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Canale di Contatto Preferito</label>
                  <select
                    value={formData.preferredChannel}
                    onChange={(e) => setFormData({ ...formData, preferredChannel: e.target.value as ContactChannel })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {(Object.keys(CONTACT_CHANNEL_LABELS) as ContactChannel[]).map((c) => (
                      <option key={c} value={c}>
                        {CONTACT_CHANNEL_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Fonte di Acquisizione</label>
                  <select
                    value={formData.acquisitionSource}
                    onChange={(e) => setFormData({ ...formData, acquisitionSource: e.target.value as AcquisitionSource })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {(Object.keys(ACQUISITION_SOURCE_LABELS) as AcquisitionSource[]).map((s) => (
                      <option key={s} value={s}>
                        {ACQUISITION_SOURCE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contatto Emergenza Box */}
              <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  Contatto di Emergenza (ICE)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nome Referente</label>
                    <input
                      type="text"
                      placeholder="es. Laura Rossi"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Telefono Emergenza</label>
                    <input
                      type="tel"
                      placeholder="es. +39 333 9998877"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Grado di Parentela</label>
                    <input
                      type="text"
                      placeholder="es. Moglie / Padre"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('anagrafica')}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  ← Indietro
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gestione')}
                  className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400"
                >
                  Avanti →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GESTIONE, STATO & COACH */}
          {activeTab === 'gestione' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Stato Atleta (11 Stati Disponibili) <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AthleteStatus })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {(Object.keys(ATHLETE_STATUS_MAP) as AthleteStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {ATHLETE_STATUS_MAP[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Coach Assegnato</label>
                  <select
                    value={formData.assignedCoachId}
                    onChange={(e) => handleCoachSelect(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Nessun Coach Assegnato</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.userId || c.id}>
                        {c.userFullName} ({c.roleCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data di Ingresso</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Disciplina / Sport Principal</label>
                  <input
                    type="text"
                    placeholder="es. Powerlifting / Bodybuilding / Calisthenics"
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Pacchetto Attivo / Abbonamento</label>
                  <input
                    type="text"
                    placeholder="es. Annuale Gold / 10 Personal Training"
                    value={formData.activePackage}
                    onChange={(e) => setFormData({ ...formData, activePackage: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data di Scadenza Abbonamento</label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Situazione dei Pagamenti</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="regolare">Regolare (Pagamenti in regola)</option>
                  <option value="in_scadenza">In Scadenza (Rata o rinnovo imminente)</option>
                  <option value="scaduto">Scaduto (Abbonamento non saldato)</option>
                  <option value="in_attesa">In Attesa (In attesa di primo saldo / bonifico)</option>
                  <option value="moroso">Moroso (Solleciti attivi)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Obiettivo Principale Atleta</label>
                <textarea
                  rows={2}
                  placeholder="es. Aumento massimale panca e squat, calo ponderale di 5kg entro fine anno"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('contatti')}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  ← Indietro
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('note')}
                  className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400"
                >
                  Avanti →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NOTE & ETICHETTE */}
          {activeTab === 'note' && (
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Note Tecniche, Anamnesi e Indicazioni Riservate
                </label>
                <textarea
                  rows={4}
                  placeholder="Annotazioni tecniche riservate per Coach e Amministratori (es. infortuni pregressi, limitazioni articolari, piano di progressione carichi...)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Etichette & Tag Personalizzati
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Aggiungi etichetta (es. Powerlifting, Agonista, Sollecito)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold rounded-xl border border-zinc-700"
                  >
                    + Aggiungi
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  {formData.labels.length === 0 ? (
                    <span className="text-[11px] text-zinc-500 italic">Nessuna etichetta aggiunta.</span>
                  ) : (
                    formData.labels.map((label) => (
                      <span
                        key={label}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5"
                      >
                        <span>{label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(label)}
                          className="hover:text-red-400 font-black"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-zinc-400 font-semibold block text-[11px]">Riepilogo Salvataggio</span>
                <p className="text-[11px] text-zinc-300">
                  Registrando l'atleta, le informazioni saranno salvate nel database dell'organizzazione con permessi RLS attivi.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('gestione')}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  ← Indietro
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 -mx-5 -mb-5 mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialData ? 'Salva Modifiche Atleta' : 'Registra Atleta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
