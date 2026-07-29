import React from 'react';
import { X, Calendar, Clock, User, UserCheck, MapPin, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCalendarEvents } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { EVENT_TYPE_LABELS } from './NewEventModal';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose }) => {
  const { deleteEvent, updateEvent } = useCalendarEvents();

  if (!event) return null;

  const typeMeta = EVENT_TYPE_LABELS[event.type] || {
    label: event.type,
    badgeClass: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
  };

  const handleDelete = async () => {
    if (confirm('Sei sicuro di voler eliminare questo evento dal calendario?')) {
      await deleteEvent(event.id);
      onClose();
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = event.status === 'completato' ? 'in programma' : 'completato';
    await updateEvent(event.id, { status: nextStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${typeMeta.badgeClass}`}>
            {typeMeta.label}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-white">{event.title}</h3>
            {event.description && <p className="text-zinc-400 mt-1">{event.description}</p>}
          </div>

          <div className="space-y-2.5 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80 text-zinc-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">{event.date}</span>
              {event.startTime && (
                <span className="text-zinc-400 flex items-center gap-1 ml-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                </span>
              )}
            </div>

            {event.athleteName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Atleta: <strong className="text-white">{event.athleteName}</strong></span>
              </div>
            )}

            {event.coachName && (
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Coach: <strong className="text-white">{event.coachName}</strong></span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Luogo: <strong className="text-white">{event.location}</strong></span>
              </div>
            )}

            {event.isSystemGenerated && (
              <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Evento generato automaticamente dal sistema.</span>
              </div>
            )}
          </div>

          {event.notes && (
            <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <p className="font-bold text-zinc-400 text-[10px] uppercase mb-1">Note:</p>
              <p className="text-zinc-300">{event.notes}</p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800">
            {!event.isSystemGenerated ? (
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {!event.isSystemGenerated && (
                <button
                  onClick={handleToggleStatus}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{event.status === 'completato' ? 'Riapri Evento' : 'Segna Completato'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors"
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
