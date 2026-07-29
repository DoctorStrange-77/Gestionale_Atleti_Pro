import React from 'react';
import { CommunicationLog } from '../../types';
import { useCommunications } from '../../context/CommunicationsContext';
import { ChannelBadge, OutcomeBadge } from './ChannelBadge';
import {
  X,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Mail,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  FileText,
} from 'lucide-react';

interface CommunicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  communication: CommunicationLog | null;
}

export const CommunicationDetailModal: React.FC<CommunicationDetailModalProps> = ({
  isOpen,
  onClose,
  communication,
}) => {
  const { openWhatsApp, openTelegram, openEmail, copyToClipboard } = useCommunications();

  if (!isOpen || !communication) return null;

  const handleCopyMessage = () => {
    if (communication.messageSent) {
      copyToClipboard(communication.messageSent);
    } else {
      copyToClipboard(`OGGETTO: ${communication.subject}\n\n${communication.summary}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <ChannelBadge channel={communication.channel} size="md" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Dettaglio Comunicazione
              </h3>
              <p className="text-xs text-zinc-400">
                Registrata il {communication.date} alle {communication.time}
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Athlete & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                Atleta
              </span>
              <span className="font-bold text-amber-400 text-sm block">
                {communication.athleteName}
              </span>
              {communication.athletePhone && (
                <span className="text-zinc-400 block mt-0.5">
                  Tel: {communication.athletePhone}
                </span>
              )}
              {communication.athleteEmail && (
                <span className="text-zinc-400 block">
                  Email: {communication.athleteEmail}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                Autore / Operatore
              </span>
              <span className="font-semibold text-zinc-200 text-sm block">
                {communication.author}
              </span>
              <span className="text-zinc-400 block mt-1">
                Esito: <OutcomeBadge outcome={communication.outcome} />
              </span>
            </div>
          </div>

          {/* Subject */}
          <div>
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
              Oggetto
            </span>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-100">
              {communication.subject}
            </div>
          </div>

          {/* Summary / Notes */}
          <div>
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
              Riepilogo / Note del Contatto
            </span>
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {communication.summary}
            </div>
          </div>

          {/* Actual Message Sent (if applicable) */}
          {communication.messageSent && (
            <div>
              <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
                Testo Messaggio Inviato / Composto
              </span>
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                {communication.messageSent}
              </div>
            </div>
          )}

          {/* Next Action & Next Contact Date */}
          {(communication.nextAction || communication.nextContactDate) && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              {communication.nextAction && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                    Prossima Azione
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {communication.nextAction}
                  </span>
                </div>
              )}

              {communication.nextContactDate && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                    Data Prossimo Contatto
                  </span>
                  <span className="font-bold text-amber-300">
                    {communication.nextContactDate}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyMessage}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-zinc-700"
          >
            <Copy className="w-4 h-4 text-zinc-400" />
            <span>Copia Testo</span>
          </button>

          <div className="flex items-center gap-2">
            {communication.channel === 'WhatsApp' && communication.athletePhone && (
              <button
                onClick={() =>
                  openWhatsApp(
                    communication.athletePhone!,
                    communication.messageSent || communication.summary
                  )
                }
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            )}

            {communication.channel === 'Telegram' && (
              <button
                onClick={() =>
                  openTelegram(
                    communication.athletePhone || '',
                    communication.messageSent || communication.summary
                  )
                }
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </button>
            )}

            {communication.channel === 'email' && communication.athleteEmail && (
              <button
                onClick={() =>
                  openEmail(
                    communication.athleteEmail!,
                    communication.subject,
                    communication.messageSent || communication.summary
                  )
                }
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
