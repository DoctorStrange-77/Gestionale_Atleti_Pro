import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

export const ComunicazioniPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>Comunicazioni Atleti</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Invio messaggi, solleciti di pagamento, promemoria scadenze e notifiche WhatsApp / Email.
          </p>
        </div>
        <button
          id="btn-add-comunicazione"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuovo Messaggio</span>
        </button>
      </div>

      <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-2">
        <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
        <p className="text-sm font-bold text-zinc-300">Nessuna comunicazione recente</p>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Invia promemoria e messaggi diretti ai tuoi atleti in modo personalizzato.
        </p>
      </div>
    </div>
  );
};
