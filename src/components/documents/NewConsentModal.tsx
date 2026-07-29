import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';
import { ConsentType, ConsentStatus } from '../../types';
import { useAthletes } from '../../context/AthletesContext';
import { useDocuments } from '../../context/DocumentsContext';
import { useToast } from '../../context/ToastContext';

interface NewConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAthleteId?: string;
}

const CONSENT_TYPES: { id: ConsentType; label: string; description: string }[] = [
  {
    id: 'Privacy GDPR & Trattamento Dati',
    label: 'Privacy GDPR & Trattamento Dati',
    description: 'Informativa e consenso per la gestione ed archiviazione dati personali e sanitari.',
  },
  {
    id: 'Uso Immagini & Materiale Fotografico',
    label: 'Uso Immagini & Materiale Fotografico',
    description: 'Autorizzazione alla ripresa e pubblicazione foto/video per social ed archivio.',
  },
  {
    id: 'Liberatoria Responsabilità & Regolamento Box',
    label: 'Liberatoria Responsabilità & Regolamento',
    description: 'Accettazione regolamento di struttura e manleva di responsabilità sportiva.',
  },
  {
    id: 'Consenso Certificato Medico Agonistico',
    label: 'Consenso Certificato Medico Agonistico',
    description: 'Autorizzazione alla conservazione e trasmissione idoneità medica.',
  },
  {
    id: 'Consenso Minorenni / Tutore Legale',
    label: 'Consenso Minorenni / Tutore Legale',
    description: 'Firma dell\'esercente la responsabilità genitoriale o tutore legale.',
  },
  {
    id: 'Altro Consenso',
    label: 'Altro Consenso Personalizzato',
    description: 'Consenso o accordo specifico non categorizzato precedentemente.',
  },
];

export const NewConsentModal: React.FC<NewConsentModalProps> = ({
  isOpen,
  onClose,
  defaultAthleteId,
}) => {
  const { athletes } = useAthletes();
  const { documents, addConsent } = useDocuments();
  const { showError } = useToast();

  const [selectedAthleteId, setSelectedAthleteId] = useState(defaultAthleteId || (athletes[0]?.id || ''));
  const [consentType, setConsentType] = useState<ConsentType>('Privacy GDPR & Trattamento Dati');
  const [customConsentType, setCustomConsentType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ConsentStatus>('attivo');
  const [linkedDocumentId, setLinkedDocumentId] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const athleteDocs = documents.filter((d) => d.athleteId === selectedAthleteId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteId) {
      showError('Seleziona un Atleta', 'Devi selezionare un atleta registrato.');
      return;
    }

    const athlete = athletes.find((a) => a.id === selectedAthleteId);
    const athleteName = athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Atleta';

    const finalType = consentType === 'Altro Consenso' && customConsentType.trim()
      ? customConsentType
      : consentType;

    const linkedDoc = documents.find((d) => d.id === linkedDocumentId);

    addConsent({
      athleteId: selectedAthleteId,
      athleteName,
      consentType: finalType,
      date,
      status,
      linkedDocumentId: linkedDoc ? linkedDoc.id : undefined,
      linkedDocumentTitle: linkedDoc ? linkedDoc.title : undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Registra Nuovo Consenso</h3>
              <p className="text-xs text-zinc-400">
                Gestione conformità GDPR e autorizzazioni dell'atleta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Atleta Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Atleta <span className="text-amber-400">*</span>
            </label>
            <select
              value={selectedAthleteId}
              onChange={(e) => {
                setSelectedAthleteId(e.target.value);
                setLinkedDocumentId('');
              }}
              required
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
            >
              <option value="" disabled>
                Seleziona Atleta...
              </option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName} ({a.email})
                </option>
              ))}
            </select>
          </div>

          {/* Tipologia Consenso */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Tipologia di Consenso <span className="text-amber-400">*</span>
            </label>
            <select
              value={consentType}
              onChange={(e) => setConsentType(e.target.value as ConsentType)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
            >
              {CONSENT_TYPES.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          {consentType === 'Altro Consenso' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Specifica Tipologia Personalizzata
              </label>
              <input
                type="text"
                value={customConsentType}
                onChange={(e) => setCustomConsentType(e.target.value)}
                placeholder="es. Liberatoria Accesso Fuori Orario"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-emerald-400 outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Consenso */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Data Sottoscrizione <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-emerald-400 outline-none"
              />
            </div>

            {/* Stato */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Stato Consenso <span className="text-amber-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ConsentStatus)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-emerald-400 outline-none"
              >
                <option value="attivo">Attivo / Accordato</option>
                <option value="in attesa">In Attesa di Firma</option>
                <option value="revocato">Revocato dall'Atleta</option>
                <option value="scaduto">Scaduto</option>
              </select>
            </div>
          </div>

          {/* Documento Collegato */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Documento Firmato Collegato (Opzionale)
            </label>
            <select
              value={linkedDocumentId}
              onChange={(e) => setLinkedDocumentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-emerald-400 outline-none"
            >
              <option value="">Nessun documento collegato</option>
              {athleteDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  📄 {doc.title} ({doc.category})
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Note ed Annotazioni
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="es. Accettazione registrata via form web o tablet in reception..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-400 outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salva Consenso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
