import React, { useState, useEffect } from 'react';
import {
  CommunicationLog,
  CommunicationChannel,
  CommunicationOutcome,
} from '../../types';
import { useCommunications } from '../../context/CommunicationsContext';
import { useAthletes } from '../../context/AthletesContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  PhoneCall,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Save,
} from 'lucide-react';

interface CommunicationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog?: CommunicationLog | null;
  initialAthleteId?: string;
}

export const CommunicationLogModal: React.FC<CommunicationLogModalProps> = ({
  isOpen,
  onClose,
  editingLog,
  initialAthleteId,
}) => {
  const { addCommunication, updateCommunication } = useCommunications();
  const { athletes } = useAthletes();
  const { user } = useAuth();

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [athleteId, setAthleteId] = useState<string>(
    editingLog?.athleteId || initialAthleteId || ''
  );
  const [date, setDate] = useState<string>(editingLog?.date || defaultDate);
  const [time, setTime] = useState<string>(editingLog?.time || defaultTime);
  const [channel, setChannel] = useState<CommunicationChannel>(
    editingLog?.channel || 'telefonata'
  );
  const [author, setAuthor] = useState<string>(
    editingLog?.author || user?.name || 'Coach Roberto'
  );
  const [subject, setSubject] = useState<string>(editingLog?.subject || '');
  const [summary, setSummary] = useState<string>(editingLog?.summary || '');
  const [outcome, setOutcome] = useState<CommunicationOutcome>(
    editingLog?.outcome || 'positivo'
  );
  const [nextAction, setNextAction] = useState<string>(editingLog?.nextAction || '');
  const [nextContactDate, setNextContactDate] = useState<string>(
    editingLog?.nextContactDate || ''
  );

  useEffect(() => {
    if (editingLog) {
      setAthleteId(editingLog.athleteId);
      setDate(editingLog.date);
      setTime(editingLog.time);
      setChannel(editingLog.channel);
      setAuthor(editingLog.author);
      setSubject(editingLog.subject);
      setSummary(editingLog.summary);
      setOutcome(editingLog.outcome);
      setNextAction(editingLog.nextAction || '');
      setNextContactDate(editingLog.nextContactDate || '');
    } else {
      setAthleteId(initialAthleteId || (athletes[0]?.id || ''));
      setDate(defaultDate);
      setTime(defaultTime);
      setChannel('telefonata');
      setAuthor(user?.name || 'Coach Roberto');
      setSubject('');
      setSummary('');
      setOutcome('positivo');
      setNextAction('');
      setNextContactDate('');
    }
  }, [editingLog, initialAthleteId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteId || !subject || !summary) {
      return;
    }

    const selectedAthlete = athletes.find((a) => a.id === athleteId);
    const athleteName = selectedAthlete
      ? `${selectedAthlete.firstName} ${selectedAthlete.lastName}`
      : 'Atleta';

    if (editingLog) {
      await updateCommunication(editingLog.id, {
        athleteId,
        athleteName,
        athletePhone: selectedAthlete?.phone,
        athleteEmail: selectedAthlete?.email,
        date,
        time,
        channel,
        author,
        subject,
        summary,
        outcome,
        nextAction: nextAction || undefined,
        nextContactDate: nextContactDate || undefined,
      });
    } else {
      await addCommunication({
        athleteId,
        athleteName,
        athletePhone: selectedAthlete?.phone,
        athleteEmail: selectedAthlete?.email,
        date,
        time,
        channel,
        author,
        subject,
        summary,
        outcome,
        nextAction: nextAction || undefined,
        nextContactDate: nextContactDate || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                {editingLog ? 'Modifica Registrazione' : 'Registra Nuova Comunicazione'}
              </h3>
              <p className="text-xs text-zinc-400">
                Annota contatti telefonici, incontri di persona, note ed esiti
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Athlete Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Atleta <span className="text-amber-400">*</span>
            </label>
            <select
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="">-- Seleziona Atleta --</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName} ({a.phone || 'Senza num.'})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Time, Channel, Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Data <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Ora <span className="text-amber-400">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Canale / Tipologia <span className="text-amber-400">*</span>
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="telefonata">Telefonata</option>
                <option value="email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Instagram">Instagram</option>
                <option value="incontro">Incontro di Persona</option>
                <option value="videochiamata">Videochiamata</option>
                <option value="altro">Altro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Autore / Operatore <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Es. Coach Roberto"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Oggetto <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Es. Richiesta informazioni su rinnovo abbonamento"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Summary / Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Riepilogo / Note del Contatto <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Inserisci i dettagli principali discussi durante la comunicazione..."
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Outcome & Next Action */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Esito Contatto
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as CommunicationOutcome)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="positivo">Positivo</option>
                <option value="in_attesa">In Attesa</option>
                <option value="da_ricontattare">Da Ricontattare</option>
                <option value="nessuna_risposta">Nessuna Risposta</option>
                <option value="completato">Completato</option>
                <option value="negativo">Negativo</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Prossima Azione
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="Es. Inviare sollecito"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Data Prossimo Contatto
              </label>
              <input
                type="date"
                value={nextContactDate}
                onChange={(e) => setNextContactDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{editingLog ? 'Aggiorna Registro' : 'Salva Comunicazione'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
