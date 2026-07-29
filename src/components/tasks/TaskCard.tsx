import React from 'react';
import { Task } from '../../types';
import { Calendar, User, UserCheck, CheckCircle2, Clock, Trash2, Edit2 } from 'lucide-react';
import { PRIORITY_LABELS, STATUS_LABELS } from './NewTaskModal';
import { useTasks } from '../../context/TasksContext';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onEdit }) => {
  const { updateTaskStatus, deleteTask } = useTasks();

  const priorityMeta = PRIORITY_LABELS[task.priority] || {
    label: task.priority,
    badgeClass: 'bg-zinc-800 text-zinc-300',
  };

  const statusMeta = STATUS_LABELS[task.status] || {
    label: task.status,
    badgeClass: 'bg-zinc-800 text-zinc-300',
  };

  const isCompleted = task.status === 'completata';

  const handleQuickStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? 'da fare' : 'completata';
    updateTaskStatus(task.id, nextStatus);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Vuoi eliminare l'attività "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(task)}
      className={`p-4 bg-zinc-900/90 hover:bg-zinc-900 border rounded-2xl transition-all cursor-pointer space-y-3 shadow-lg hover:border-amber-500/50 ${
        isCompleted ? 'border-zinc-800/60 opacity-75' : 'border-zinc-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickStatusToggle}
            className={`p-1 rounded-lg border transition-colors ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-amber-400 hover:border-amber-500/40'
            }`}
            title={isCompleted ? 'Riapri attività' : 'Segna come completata'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
            {task.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${priorityMeta.badgeClass}`}>
            {priorityMeta.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${statusMeta.badgeClass}`}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div>
        <h4 className={`font-bold text-xs text-zinc-100 ${isCompleted ? 'line-through text-zinc-400' : ''}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{task.description}</p>
        )}
      </div>

      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span className="font-semibold text-zinc-300">{task.dueDate}</span>
            {task.dueTime && <span className="text-zinc-500">({task.dueTime})</span>}
          </div>

          {task.athleteName && (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <User className="w-3 h-3 text-amber-400" />
              <span>{task.athleteName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Modifica"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Elimina"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
