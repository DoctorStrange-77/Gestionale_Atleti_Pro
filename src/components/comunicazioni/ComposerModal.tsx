import React, { useState, useEffect } from 'react';
import {
  MessageTemplate,
  CommunicationChannel,
  MessageTemplateCategory,
  CommunicationOutcome,
} from '../../types';
import { useCommunications } from '../../context/CommunicationsContext';
import { useAthletes } from '../../context/AthletesContext';
import { useAuth } from '../../context/AuthContext';
import { ChannelBadge } from './ChannelBadge';
import {
  X,
  Copy,
  Mail,
  Send,
  MessageSquare,
  Check,
  User,
  Sparkles,
  ExternalLink,
  Save,
  Calendar,
  Clock,
  Info,
} from 'lucide-react';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateId?: string;
  initialAthleteId?: string;
}

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  initialTemplateId,
  initialAthleteId,
}) => {
  const {
    templates,
    renderTemplateText,
    openWhatsApp,
    openTelegram,
    openEmail,
    copyToClipboard,
    addCommunication,
  } = useCommunications();
  const { athletes } = useAthletes();
  const { user } = useAuth();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || templates[0]?.id || ''
  );
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(initialAthleteId || '');
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>('WhatsApp');

  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [autoLog, setAutoLog] = useState<boolean>(true);

  const [outcome, setOutcome] = useState<CommunicationOutcome>('positivo');
  const [nextAction, setNextAction] = useState<string>('');
  const [nextContactDate, setNextContactDate] = useState<string>('');

  // Selected Athlete & Template objects
  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Sync state when template or athlete changes
  useEffect(() => {
    if (initialTemplateId) setSelectedTemplateId(initialTemplateId);
    if (initialAthleteId) setSelectedAthleteId(initialAthleteId);
  }, [initialTemplateId, initialAthleteId, isOpen]);

  useEffect(() => {
    if (!selectedTemplate) return;

    if (selectedTemplate.defaultChannel) {
      setSelectedChannel(selectedTemplate.defaultChannel);
    }

    const variables: Record<string, string> = {
      nome_atleta: selectedAthlete ? `${selectedAthlete.firstName} ${selectedAthlete.lastName}` : 'Atleta',
      cognome_atleta: selectedAthlete?.lastName || '',
      nome_palestra: 'Builder Athlete Club',
      nome_staff: user?.name || 'Coach',
      nome_pacchetto: selectedAthlete?.currentPackageName || 'Coaching Gold',
      importo: '€ 120,00',
      data_scadenza: selectedAthlete?.packageExpiryDate || '31/08/2026',
      data_pagamento: new Date().toLocaleDateString('it-IT'),
      nome_documento: 'Certificato Medico Agonistico',
    };

    const rendered = renderTemplateText(selectedTemplate, variables);
    setCustomSubject(rendered.subject);
    setCustomBody(rendered.body);
  }, [selectedTemplateId, selectedAthleteId, templates]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const fullText = customSubject ? `OGGETTO: ${customSubject}\n\n${customBody}` : customBody;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (autoLog && selectedAthlete) {
        logCurrentCommunication('Copiato negli appunti per invio manuale');
      }
    }
  };

  const handleOpenWhatsApp = () => {
    const phone = selectedAthlete?.phone || '+393331234567';
    openWhatsApp(phone, customBody);

    if (autoLog && selectedAthlete) {
      logCurrentCommunication('Aperto collegamento diretto WhatsApp');
    }
  };

  const handleOpenTelegram = () => {
    const phoneOrUser = selectedAthlete?.phone || '+393331234567';
    openTelegram(phoneOrUser, customBody);

    if (autoLog && selectedAthlete) {
      logCurrentCommunication('Aperto collegamento diretto Telegram');
    }
  };

  const handleOpenEmail = () => {
    const email = selectedAthlete?.email || 'atleta@email.com';
    openEmail(email, customSubject, customBody);

    if (autoLog && selectedAthlete) {
      logCurrentCommunication('Aperto client Email predefinito');
    }
  };

  const logCurrentCommunication = (actionSummary: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    addCommunication({
      athleteId: selectedAthlete?.id || 'ath-0',
      athleteName: selectedAthlete ? `${selectedAthlete.firstName} ${selectedAthlete.lastName}` : 'Atleta Selezionato',
      athletePhone: selectedAthlete?.phone,
      athleteEmail: selectedAthlete?.email,
      date: dateStr,
      time: timeStr,
      channel: selectedChannel,
      author: user?.name || 'Coach',
      subject: customSubject || 'Messaggio inviato',
      summary: `${actionSummary}. ${customBody.slice(0, 100)}...`,
      outcome: outcome,
      nextAction: nextAction || 'Verificare risposta del contatto',
      nextContactDate: nextContactDate || undefined,
      templateCategory: selectedTemplate?.category,
      messageSent: customBody,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Componi Comunicazione / Modello
              </h3>
              <p className="text-xs text-zinc-400">
                Seleziona il modello e l'atleta per generare il messaggio personalizzato
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
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Row 1: Select Template & Select Athlete */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Modello di Messaggio
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.title} ({tmpl.category.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Athlete Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Seleziona Atleta (Auto-fill dati)
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">-- Seleziona un Atleta --</option>
                {athletes.map((ath) => (
                  <option key={ath.id} value={ath.id}>
                    {ath.firstName} {ath.lastName} ({ath.phone || 'Senza num.'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Athlete Info Box */}
          {selectedAthlete ? (
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl flex flex-wrap items-center justify-between text-xs text-zinc-300 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-zinc-100">
                  {selectedAthlete.firstName} {selectedAthlete.lastName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span>Tel: <strong className="text-zinc-200">{selectedAthlete.phone || 'N/D'}</strong></span>
                <span>Email: <strong className="text-zinc-200">{selectedAthlete.email || 'N/D'}</strong></span>
                <span>Pacchetto: <strong className="text-amber-400">{selectedAthlete.currentPackageName || 'N/D'}</strong></span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Seleziona un atleta per compilare automaticamente i marcatori dinamici (es. nome, cellulare, data di scadenza).
              </span>
            </div>
          )}

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Canale Preferito
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'WhatsApp',
                  'email',
                  'Telegram',
                  'telefonata',
                  'incontro',
                  'videochiamata',
                  'Instagram',
                  'altro',
                ] as CommunicationChannel[]
              ).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedChannel === ch
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <ChannelBadge channel={ch} showLabel={true} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Subject & Body Editing */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Oggetto Messaggio / Email
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Oggetto della comunicazione..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Testo del Messaggio
              </label>
              <textarea
                rows={6}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 leading-relaxed focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Auto-logging & Next Action Section */}
          <div className="p-4 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200">
                <input
                  type="checkbox"
                  checked={autoLog}
                  onChange={(e) => setAutoLog(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Registra automaticamente nel Registro Comunicazioni</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                Autore: {user?.name || 'Coach'}
              </span>
            </div>

            {autoLog && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/60">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Esito
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
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Prossima Azione
                  </label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    placeholder="Es. Verifica bonifico"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
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
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 border border-zinc-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiato!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-400" />
                  <span>Copia Testo</span>
                </>
              )}
            </button>

            {autoLog && (
              <button
                onClick={() => {
                  logCurrentCommunication('Registrazione manuale della comunicazione');
                  onClose();
                }}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 border border-zinc-700"
              >
                <Save className="w-4 h-4" />
                <span>Salva Registro</span>
              </button>
            )}
          </div>

          {/* Direct Launch Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenWhatsApp}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4 fill-zinc-950" />
              <span>Apri WhatsApp</span>
            </button>

            <button
              onClick={handleOpenTelegram}
              className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Apri Telegram</span>
            </button>

            <button
              onClick={handleOpenEmail}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>Apri Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
