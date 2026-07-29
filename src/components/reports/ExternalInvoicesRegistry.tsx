import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Paperclip,
  Calendar,
  Building,
  Euro,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { ExternalInvoice, Athlete } from '../../types';
import { STORAGE_KEYS } from '../../config/storageKeys';

interface ExternalInvoicesRegistryProps {
  athletes: Athlete[];
}

const LOCAL_STORAGE_KEY = STORAGE_KEYS.EXTERNAL_INVOICES;

const SEED_EXTERNAL_INVOICES: ExternalInvoice[] = [
  {
    id: 'ext-inv-1',
    numeroFattura: 'FAT-2026-089',
    dataFattura: '2026-07-26',
    riferimento: 'Pagamento Abbonamento Gold Power #pay-1',
    documentoAllegato: 'fattura_esterno_089.pdf',
    softwareEsterno: 'Fatture in Cloud',
    importo: 200,
    atletaNome: 'Marco Rossi',
    note: 'Fattura emessa tramite Fatture in Cloud per acconto abbonamento annuale.',
    createdAt: '2026-07-26T14:30:00.000Z',
  },
  {
    id: 'ext-inv-2',
    numeroFattura: 'FAT-2026-014',
    dataFattura: '2026-02-15',
    riferimento: 'Saldato Carnet Personal Training #pay-2',
    documentoAllegato: 'ricevuta_aruba_014.pdf',
    softwareEsterno: 'Aruba Fatturazione',
    importo: 400,
    atletaNome: 'Elena Bianchi',
    note: 'Inviata a SDI tramite Aruba.',
    createdAt: '2026-02-15T09:05:00.000Z',
  },
];

export const ExternalInvoicesRegistry: React.FC<ExternalInvoicesRegistryProps> = ({ athletes }) => {
  const [invoices, setInvoices] = useState<ExternalInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Invoice Form state
  const [numeroFattura, setNumeroFattura] = useState('');
  const [dataFattura, setDataFattura] = useState(new Date().toISOString().split('T')[0]);
  const [riferimento, setRiferimento] = useState('');
  const [softwareEsterno, setSoftwareEsterno] = useState<string>('Fatture in Cloud');
  const [documentoAllegato, setDocumentoAllegato] = useState('');
  const [importo, setImporto] = useState<number | ''>('');
  const [atletaNome, setAtletaNome] = useState('');
  const [note, setNote] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        setInvoices(SEED_EXTERNAL_INVOICES);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_EXTERNAL_INVOICES));
      }
    } catch (e) {
      console.error('Error loading external invoices:', e);
      setInvoices(SEED_EXTERNAL_INVOICES);
    }
  }, []);

  const saveInvoicesToStorage = (updated: ExternalInvoice[]) => {
    setInvoices(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving external invoices:', e);
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroFattura.trim() || !dataFattura || !riferimento.trim()) return;

    const newInv: ExternalInvoice = {
      id: `ext-inv-${Date.now()}`,
      numeroFattura: numeroFattura.trim(),
      dataFattura,
      riferimento: riferimento.trim(),
      softwareEsterno,
      documentoAllegato: documentoAllegato.trim() || 'fattura_allegata.pdf',
      importo: importo !== '' ? Number(importo) : undefined,
      atletaNome: atletaNome.trim() || 'N/A',
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newInv, ...invoices];
    saveInvoicesToStorage(updated);

    // Reset Form
    setNumeroFattura('');
    setDataFattura(new Date().toISOString().split('T')[0]);
    setRiferimento('');
    setSoftwareEsterno('Fatture in Cloud');
    setDocumentoAllegato('');
    setImporto('');
    setAtletaNome('');
    setNote('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa registrazione di fattura esterna?')) {
      const updated = invoices.filter((i) => i.id !== id);
      saveInvoicesToStorage(updated);
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    const term = searchTerm.toLowerCase();
    return (
      i.numeroFattura.toLowerCase().includes(term) ||
      i.riferimento.toLowerCase().includes(term) ||
      (i.atletaNome || '').toLowerCase().includes(term) ||
      i.softwareEsterno.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Registro Fatture Esterne
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Gestione e tracciamento contabile per fatture emesse tramite gestionali esterni (Fatture in Cloud, Aruba, Namirial, Danea, etc.).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registra Fattura Esterna</span>
        </button>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="text-amber-400 font-bold block mb-0.5">Nota di Conformità Fiscale:</strong>
          Il sistema non effettua l'invio diretto all'Agenzia delle Entrate (SDI). In questa sezione puoi registrare i riferimenti, numeri e file delle fatture create con i tuoi software contabili esterni.
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per N° Fattura, Riferimento, Atleta..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <span className="text-xs text-zinc-400 font-medium">
          Totale Fatture Registrate: <strong className="text-amber-400">{filteredInvoices.length}</strong>
        </span>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <th className="p-3">N° Fattura</th>
              <th className="p-3">Data</th>
              <th className="p-3">Riferimento</th>
              <th className="p-3">Atleta</th>
              <th className="p-3">Software Esterno</th>
              <th className="p-3 text-right">Importo</th>
              <th className="p-3 text-center">Allegato</th>
              <th className="p-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-xs text-zinc-300">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  Nessuna fattura esterna trovata per la ricerca corrente.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400">
                    {inv.numeroFattura}
                  </td>
                  <td className="p-3 text-zinc-400 font-mono">
                    {inv.dataFattura}
                  </td>
                  <td className="p-3 max-w-xs truncate" title={inv.riferimento}>
                    {inv.riferimento}
                  </td>
                  <td className="p-3 font-semibold text-zinc-200">
                    {inv.atletaNome || 'N/A'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md text-[11px]">
                      {inv.softwareEsterno}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    {inv.importo ? `€ ${inv.importo.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-center">
                    {inv.documentoAllegato ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-mono">
                        <Paperclip className="w-3 h-3" />
                        <span className="max-w-[80px] truncate">{inv.documentoAllegato}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Elimina registrazione"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Registration Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <FileText className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-zinc-100">
                Registra Dati Fattura Esterna
              </h4>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Numero Fattura */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Numero Fattura *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroFattura}
                    onChange={(e) => setNumeroFattura(e.target.value)}
                    placeholder="es. FAT-2026-102"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 2. Data */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Data Emissione *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataFattura}
                    onChange={(e) => setDataFattura(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3. Riferimento */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Riferimento (Pagamento / Abbonamento) *
                </label>
                <input
                  type="text"
                  required
                  value={riferimento}
                  onChange={(e) => setRiferimento(e.target.value)}
                  placeholder="es. Rata 1 Abbonamento Annuale Gold Power"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 4. Software Esterno Utilizzato */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Software Esterno Utilizzato *
                  </label>
                  <select
                    value={softwareEsterno}
                    onChange={(e) => setSoftwareEsterno(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Fatture in Cloud">Fatture in Cloud</option>
                    <option value="Aruba Fatturazione">Aruba Fatturazione</option>
                    <option value="Namirial">Namirial</option>
                    <option value="Danea Easyfatt">Danea Easyfatt</option>
                    <option value="Agenzia delle Entrate">Agenzia delle Entrate</option>
                    <option value="Altro">Altro Software</option>
                  </select>
                </div>

                {/* Importo */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Importo Totale (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={importo}
                    onChange={(e) => setImporto(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="es. 300.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Atleta Referente */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Atleta Intestatario
                  </label>
                  <input
                    type="text"
                    value={atletaNome}
                    onChange={(e) => setAtletaNome(e.target.value)}
                    placeholder="es. Marco Rossi"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Documento Allegato */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Documento Allegato (Nome File)
                  </label>
                  <input
                    type="text"
                    value={documentoAllegato}
                    onChange={(e) => setDocumentoAllegato(e.target.value)}
                    placeholder="es. fattura_102.pdf"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Note Aggiuntive
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Informazioni o riferimenti aggiuntivi per la contabilità..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs"
                >
                  Salva Registrazione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
