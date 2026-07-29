import React, { useState } from 'react';
import { MessageTemplate, MessageTemplateCategory } from '../../types';
import { useCommunications } from '../../context/CommunicationsContext';
import { ChannelBadge } from './ChannelBadge';
import {
  Sparkles,
  Copy,
  Edit2,
  Check,
  Send,
  MessageSquare,
  Mail,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface MessageTemplatesTabProps {
  onUseTemplate: (templateId: string) => void;
}

export const MessageTemplatesTab: React.FC<MessageTemplatesTabProps> = ({
  onUseTemplate,
}) => {
  const { templates, updateTemplate, resetTemplatesToDefault, copyToClipboard } =
    useCommunications();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubject, setEditSubject] = useState<string>('');
  const [editBody, setEditBody] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bodyTemplate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyTemplate = async (template: MessageTemplate) => {
    const textToCopy = `OGGETTO: ${template.subjectTemplate}\n\n${template.bodyTemplate}`;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleStartEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setEditTitle(template.title);
    setEditSubject(template.subjectTemplate);
    setEditBody(template.bodyTemplate);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    await updateTemplate(editingTemplate.id, {
      title: editTitle,
      subjectTemplate: editSubject,
      bodyTemplate: editBody,
    });
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Reset */}
      <div className="p-5 bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Modelli di Messaggio Preconfigurati (10 Categorie)
            </h3>
            <p className="text-xs text-zinc-400">
              Personalizza i testi e usa i segnaposto dinamici come {'{{nome_atleta}}'}, {'{{nome_pacchetto}}'}, {'{{data_scadenza}}'}, {'{{importo}}'}
            </p>
          </div>
        </div>

        <button
          onClick={resetTemplatesToDefault}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-zinc-700 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Ripristina Modelli Predefiniti</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-3 border border-zinc-800 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca nei modelli..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tutte le Categorie (10)</option>
            <option value="benvenuto">1. Benvenuto</option>
            <option value="pagamento_in_scadenza">2. Pagamento in Scadenza</option>
            <option value="pagamento_scaduto">3. Pagamento Scaduto</option>
            <option value="abbonamento_in_scadenza">4. Abbonamento in Scadenza</option>
            <option value="rinnovo">5. Rinnovo</option>
            <option value="documento_mancante">6. Documento Mancante</option>
            <option value="certificato_medico">7. Certificato Medico</option>
            <option value="checkin_non_completato">8. Check-in Non Completato</option>
            <option value="ringraziamento_pagamento">9. Ringraziamento Pagamento</option>
            <option value="recupero_inattivo">10. Recupero Atleta Inattivo</option>
          </select>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {template.category.replace(/_/g, ' ')}
                    </span>
                    <ChannelBadge channel={template.defaultChannel} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                    {template.title}
                  </h4>
                </div>

                <button
                  onClick={() => handleStartEdit(template)}
                  className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Modifica modello"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-400">{template.description}</p>

              {/* Subject Box */}
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                  Oggetto:
                </span>
                <span className="font-semibold text-zinc-200">
                  {template.subjectTemplate}
                </span>
              </div>

              {/* Body Box */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {template.bodyTemplate}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyTemplate(template)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                {copiedId === template.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copia Testo</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onUseTemplate(template.id)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Usa & Compila</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-400" />
              <span>Modifica Modello: {editingTemplate.title}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Titolo Modello
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Oggetto Predefinito
              </label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Testo Modello (con Marcatori {'{{...}}'})
              </label>
              <textarea
                rows={8}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
              >
                Salva Modello
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
