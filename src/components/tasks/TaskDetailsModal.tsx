import React from 'react';
import { X, CheckSquare, Calendar, Clock, User, UserCheck, AlertTriangle, Bell, FileText, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { PRIORITY_LABELS, STATUS_LABELS } from './NewTaskModal';
import { useTasks } from '../../context/TasksContext';

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onEdit }) => {
  const { deleteTask, updateTaskStatus } = useTasks();

  if (!task) return null;

  const priorityMeta = PRIORITY_LABELS[task.priority];
  const statusMeta = STATUS_LABELS[task.status];

  const handleDelete = async () => {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTaskStatus(task.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
              {task.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityMeta?.badgeClass}`}>
              Priorità: {priorityMeta?.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-white">{task.title}</h3>
            {task.description && <p className="text-zinc-400 mt-1">{task.description}</p>}
          </div>

          <div className="space-y-2.5 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80 text-zinc-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Scadenza: <strong className="text-white">{task.dueDate}</strong> {task.dueTime ? `alle ${task.dueTime}` : ''}</span>
            </div>

            {task.athleteName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Atleta: <strong className="text-white">{task.athleteName}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Responsabile: <strong className="text-white">{task.responsible}</strong></span>
            </div>

            {task.reminder && (
              <div className="flex items-center gap-2 text-amber-300">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Promemoria: <strong>{task.reminder}</strong></span>
              </div>
            )}
          </div>

          {task.notes && (
            <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <p className="font-bold text-zinc-400 text-[10px] uppercase mb-1">Note operative:</p>
              <p className="text-zinc-300">{task.notes}</p>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 font-bold mb-1.5">Cambia Stato Attività:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['da fare', 'in lavorazione', 'in attesa', 'completata', 'scaduta', 'annullata'] as TaskStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      task.status === st
                        ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800">
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Elimina</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modifica</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
