import React, { useState } from 'react';
import { X, Calendar, Clock, User, UserCheck, MapPin, FileText, Tag } from 'lucide-react';
import { useCalendarEvents } from '../../context/CalendarContext';
import { useAthletes } from '../../context/AthletesContext';
import { CalendarEventType, CalendarEventStatus } from '../../types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, { label: string; colorClass: string; badgeClass: string }> = {
  pagamenti: {
    label: 'Pagamenti',
    colorClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  },
  rinnovi: {
    label: 'Rinnovi',
    colorClass: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  },
  'fine abbonamento': {
    label: 'Fine Abbonamento',
    colorClass: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
  },
  'inizio abbonamento': {
    label: 'Inizio Abbonamento',
    colorClass: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
  },
  appuntamenti: {
    label: 'Appuntamenti',
    colorClass: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  },
  'check-in': {
    label: 'Check-in',
    colorClass: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
  },
  'programmi da consegnare': {
    label: 'Programmi da consegnare',
    colorClass: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
  },
  'certificati medici': {
    label: 'Certificati Medici',
    colorClass: 'border-red-500/40 bg-red-500/10 text-red-400',
    badgeClass: 'bg-red-500/20 text-red-300 border border-red-500/40',
  },
  documenti: {
    label: 'Documenti',
    colorClass: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
    badgeClass: 'bg-slate-500/20 text-slate-200 border border-slate-500/40',
  },
  gare: {
    label: 'Gare',
    colorClass: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    badgeClass: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
  },
  eventi: {
    label: 'Eventi',
    colorClass: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
  },
  compleanni: {
    label: 'Compleanni',
    colorClass: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
    badgeClass: 'bg-pink-500/20 text-pink-300 border border-pink-500/40',
  },
};

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
}) => {
  const { addEvent } = useCalendarEvents();
  const { athletes } = useAthletes();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>('appuntamenti');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [athleteId, setAthleteId] = useState('');
  const [coachName, setCoachName] = useState('Coach Roberto');
  const [location, setLocation] = useState('Studio PT Sala A');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<CalendarEventStatus>('in programma');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAthlete = athletes.find((a) => a.id === athleteId);
    const athleteName = selectedAthlete
      ? `${selectedAthlete.firstName} ${selectedAthlete.lastName}`
      : undefined;

    await addEvent({
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      athleteId: athleteId || undefined,
      athleteName,
      coachName,
      location,
      notes,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-zinc-100">Nuovo Evento Calendario</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-bold mb-1">Titolo Evento *</label>
            <input
              type="text"
              required
              placeholder="es. Check-in Antropometrico, Consulenza PT..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Tipologia
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CalendarEventType)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">Stato</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CalendarEventStatus)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="in programma">In programma</option>
                <option value="completato">Completato</option>
                <option value="in attesa">In attesa</option>
                <option value="scaduto">Scaduto</option>
                <option value="annullato">Annullato</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Ora Inizio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Ora Fine
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Atleta Coinvolto
              </label>
              <select
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Nessun atleta / Generale</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Coach / Responsabile
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="es. Coach Roberto"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Luogo / Sala
            </label>
            <input
              type="text"
              placeholder="es. Studio PT Sala B, Piattaforma Online, Palestra Central"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Descrizione & Note
            </label>
            <textarea
              rows={2}
              placeholder="Aggiungi dettagli dell evento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Salva Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
