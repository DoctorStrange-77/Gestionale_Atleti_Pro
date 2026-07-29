import React, { useState } from 'react';
import { useCommunications } from '../context/CommunicationsContext';
import { CommunicationLog, CommunicationChannel, CommunicationOutcome } from '../types';
import { CommunicationStats } from '../components/comunicazioni/CommunicationStats';
import { ChannelBadge, OutcomeBadge } from '../components/comunicazioni/ChannelBadge';
import { ComposerModal } from '../components/comunicazioni/ComposerModal';
import { CommunicationLogModal } from '../components/comunicazioni/CommunicationLogModal';
import { CommunicationDetailModal } from '../components/comunicazioni/CommunicationDetailModal';
import { MessageTemplatesTab } from '../components/comunicazioni/MessageTemplatesTab';
import { ApiIntegrationTab } from '../components/comunicazioni/ApiIntegrationTab';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  PhoneCall,
  Sparkles,
  Code,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Clock,
  Send,
  Mail,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ComunicazioniPage: React.FC = () => {
  const { communications, deleteCommunication, openWhatsApp, openTelegram, openEmail, copyToClipboard } =
    useCommunications();

  const [activeTab, setActiveTab] = useState<
    'registro' | 'modelli' | 'prossimi_contatti' | 'api'
  >('registro');

  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [composerTemplateId, setComposerTemplateId] = useState<string | undefined>();

  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null);

  const [selectedLogForDetail, setSelectedLogForDetail] = useState<CommunicationLog | null>(
    null
  );

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');

  // Filter logic
  const filteredCommunications = communications.filter((log) => {
    const matchesSearch =
      log.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
    const matchesOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter;

    return matchesSearch && matchesChannel && matchesOutcome;
  });

  // Upcoming scheduled contacts
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingContactsLogs = communications.filter(
    (log) => log.nextContactDate && log.nextContactDate >= todayStr
  );

  const handleOpenComposerWithTemplate = (templateId: string) => {
    setComposerTemplateId(templateId);
    setIsComposerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <span>Modulo Comunicazioni & Messaggistica</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gestione registro contatti, solleciti, 10 modelli di messaggio precompilati e predisposizione API
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-add-comunicazione-log"
            onClick={() => {
              setEditingLog(null);
              setIsLogModalOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-zinc-700"
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>Registra Contatto</span>
          </button>

          <button
            id="btn-add-comunicazione"
            onClick={() => {
              setComposerTemplateId(undefined);
              setIsComposerOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Componi Messaggio</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <CommunicationStats communications={communications} />

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('registro')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'registro'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Registro Comunicazioni</span>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300">
            {communications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('modelli')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'modelli'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Modelli di Messaggio (10)</span>
        </button>

        <button
          onClick={() => setActiveTab('prossimi_contatti')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'prossimi_contatti'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Prossimi Contatti & Solleciti</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 font-bold border border-amber-500/20">
            {upcomingContactsLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Integrazioni API & Webhooks</span>
        </button>
      </div>

      {/* Tab 1: Registro Storico Comunicazioni */}
      {activeTab === 'registro' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/80 p-3 border border-zinc-800 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca per atleta, oggetto, note, autore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Channel Filter */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Tutti i Canali</option>
                <option value="telefonata">Telefonata</option>
                <option value="email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Instagram">Instagram</option>
                <option value="incontro">Incontro</option>
                <option value="videochiamata">Videochiamata</option>
                <option value="altro">Altro</option>
              </select>

              {/* Outcome Filter */}
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Tutti gli Esiti</option>
                <option value="positivo">Positivo</option>
                <option value="in_attesa">In Attesa</option>
                <option value="da_ricontattare">Da Ricontattare</option>
                <option value="nessuna_risposta">Nessuna Risposta</option>
                <option value="completato">Completato</option>
                <option value="negativo">Negativo</option>
              </select>
            </div>
          </div>

          {/* Table / List View */}
          {filteredCommunications.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-2">
              <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Nessuna comunicazione trovata</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Prova a modificare i filtri di ricerca o registra un nuovo contatto.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="p-3.5 pl-5">Atleta</th>
                      <th className="p-3.5">Data & Ora</th>
                      <th className="p-3.5">Canale</th>
                      <th className="p-3.5">Autore</th>
                      <th className="p-3.5">Oggetto & Riepilogo</th>
                      <th className="p-3.5">Esito</th>
                      <th className="p-3.5">Prossima Azione</th>
                      <th className="p-3.5 pr-5 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {filteredCommunications.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-zinc-800/40 transition-colors group"
                      >
                        <td className="p-3.5 pl-5 font-bold text-zinc-100">
                          {log.athleteName}
                        </td>
                        <td className="p-3.5 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                          {log.date} <span className="text-zinc-600">({log.time})</span>
                        </td>
                        <td className="p-3.5">
                          <ChannelBadge channel={log.channel} size="sm" />
                        </td>
                        <td className="p-3.5 text-zinc-300 font-medium">
                          {log.author}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <p className="font-semibold text-zinc-200 truncate">
                            {log.subject}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {log.summary}
                          </p>
                        </td>
                        <td className="p-3.5">
                          <OutcomeBadge outcome={log.outcome} />
                        </td>
                        <td className="p-3.5">
                          {log.nextAction ? (
                            <div>
                              <p className="text-[11px] font-semibold text-amber-400">
                                {log.nextAction}
                              </p>
                              {log.nextContactDate && (
                                <p className="text-[10px] text-zinc-500 font-mono">
                                  Prox: {log.nextContactDate}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedLogForDetail(log)}
                              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Visualizza Dettaglio"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingLog(log);
                                setIsLogModalOpen(true);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Modifica"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteCommunication(log.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Modelli di Messaggio */}
      {activeTab === 'modelli' && (
        <MessageTemplatesTab onUseTemplate={handleOpenComposerWithTemplate} />
      )}

      {/* Tab 3: Prossimi Contatti & Solleciti */}
      {activeTab === 'prossimi_contatti' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-zinc-100">
                  Agenda Prossimi Contatti & Solleciti Programmati
                </h4>
                <p className="text-xs text-zinc-400">
                  Elenco delle azioni e dei ricontatti pianificati con gli atleti
                </p>
              </div>
            </div>
          </div>

          {upcomingContactsLogs.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
              <UserCheck className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Nessun ricontatto in programma</p>
              <p className="text-xs text-zinc-500">
                Tutti i contatti e solleciti recenti sono stati completati.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingContactsLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                        Data Contatto: {log.nextContactDate}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-100 mt-0.5">
                        {log.athleteName}
                      </h4>
                    </div>
                    <OutcomeBadge outcome={log.outcome} />
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-zinc-400 font-semibold block mb-0.5">
                      Prossima Azione:
                    </span>
                    <span className="text-amber-300 font-medium">{log.nextAction}</span>
                  </div>

                  <div className="text-xs text-zinc-400 space-y-1">
                    <p>
                      <strong>Ultimo contatto:</strong> {log.date} ({log.channel}) by{' '}
                      {log.author}
                    </p>
                    <p className="truncate">
                      <strong>Note:</strong> {log.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setComposerTemplateId(undefined);
                        setIsComposerOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ricontatta Ora</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: API & Webhooks */}
      {activeTab === 'api' && <ApiIntegrationTab />}

      {/* Modals */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialTemplateId={composerTemplateId}
      />

      <CommunicationLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        editingLog={editingLog}
      />

      <CommunicationDetailModal
        isOpen={!!selectedLogForDetail}
        onClose={() => setSelectedLogForDetail(null)}
        communication={selectedLogForDetail}
      />
    </div>
  );
};
