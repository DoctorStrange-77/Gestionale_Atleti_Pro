import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Clock, User, UserCheck, AlertTriangle, Tag, Bell, FileText } from 'lucide-react';
import { useTasks } from '../../context/TasksContext';
import { useAthletes } from '../../context/AthletesContext';
import { TaskPriority, TaskStatus, Task } from '../../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const PRIORITY_LABELS: Record<TaskPriority, { label: string; badgeClass: string }> = {
  bassa: { label: 'Bassa', badgeClass: 'bg-slate-500/10 text-slate-400 border border-slate-500/30' },
  normale: { label: 'Normale', badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' },
  alta: { label: 'Alta', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
  urgente: { label: 'Urgente', badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' },
};

export const STATUS_LABELS: Record<TaskStatus, { label: string; badgeClass: string }> = {
  'da fare': { label: 'Da Fare', badgeClass: 'bg-zinc-800 text-zinc-300 border border-zinc-700' },
  'in lavorazione': { label: 'In Lavorazione', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
  'in attesa': { label: 'In Attesa', badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' },
  completata: { label: 'Completata', badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
  annullata: { label: 'Annullata', badgeClass: 'bg-zinc-900 text-zinc-500 border border-zinc-800' },
  scaduta: { label: 'Scaduta', badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' },
};

export const CATEGORIES = [
  'Allenamento',
  'Nutrizione',
  'Check-in',
  'Amministrazione',
  'Commerciale',
  'Gare',
  'Generale',
];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { addTask, updateTask } = useTasks();
  const { athletes } = useAthletes();

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [athleteId, setAthleteId] = useState(taskToEdit?.athleteId || '');
  const [responsible, setResponsible] = useState(taskToEdit?.responsible || 'Coach Roberto');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'normale');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || '2026-07-30');
  const [dueTime, setDueTime] = useState(taskToEdit?.dueTime || '12:00');
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || 'da fare');
  const [category, setCategory] = useState(taskToEdit?.category || 'Allenamento');
  const [reminder, setReminder] = useState(taskToEdit?.reminder || '');
  const [notes, setNotes] = useState(taskToEdit?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAthlete = athletes.find((a) => a.id === athleteId);
    const athleteName = selectedAthlete
      ? `${selectedAthlete.firstName} ${selectedAthlete.lastName}`
      : undefined;

    if (taskToEdit) {
      await updateTask(taskToEdit.id, {
        title,
        description,
        athleteId: athleteId || undefined,
        athleteName,
        responsible,
        priority,
        dueDate,
        dueTime,
        status,
        category,
        reminder,
        notes,
      });
    } else {
      await addTask({
        title,
        description,
        athleteId: athleteId || undefined,
        athleteName,
        responsible,
        priority,
        dueDate,
        dueTime,
        status,
        category,
        reminder,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-zinc-100">
              {taskToEdit ? 'Modifica Attività' : 'Nuova Attività Coach'}
            </h3>
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
            <label className="block text-zinc-400 font-bold mb-1">Titolo Attività *</label>
            <input
              type="text"
              required
              placeholder="es. Verifica scheda di allenamento, Invio Dieta, Sollecito..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1">Descrizione Dettagliata</label>
            <textarea
              rows={2}
              placeholder="Descrivi la checklist o i compiti da svolgere..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Priorità
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="bassa">Bassa</option>
                <option value="normale">Normale</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Scadenza
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Ora
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">Stato</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="da fare">Da fare</option>
                <option value="in lavorazione">In lavorazione</option>
                <option value="in attesa">In attesa</option>
                <option value="completata">Completata</option>
                <option value="scaduta">Scaduta</option>
                <option value="annullata">Annullata</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Atleta
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
                <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Responsabile
              </label>
              <input
                type="text"
                required
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="es. Coach Roberto, Segreteria..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" /> Promemoria / Avviso
            </label>
            <input
              type="text"
              placeholder="es. 2026-07-30 09:00 - Notifica via email"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Note Interne
            </label>
            <textarea
              rows={2}
              placeholder="Note o istruzioni operative aggiuntive..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
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
              {taskToEdit ? 'Aggiorna Attività' : 'Salva Attività'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
