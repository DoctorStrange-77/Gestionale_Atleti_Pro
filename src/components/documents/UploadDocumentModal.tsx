import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Shield, Calendar, User, Eye, Lock, FileCode } from 'lucide-react';
import { DocumentCategory, DocumentVisibility, StoredFile } from '../../types';
import { useAthletes } from '../../context/AthletesContext';
import { useDocuments } from '../../context/DocumentsContext';
import { useToast } from '../../context/ToastContext';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAthleteId?: string;
  defaultCategory?: DocumentCategory;
}

const DOCUMENT_CATEGORIES: { id: DocumentCategory; label: string; icon: string; defaultBucket: string }[] = [
  { id: 'contratto', label: 'Contratto', icon: '📜', defaultBucket: 'documents' },
  { id: 'consenso privacy', label: 'Consenso Privacy', icon: '🔒', defaultBucket: 'consents' },
  { id: 'certificato medico', label: 'Certificato Medico', icon: '🏥', defaultBucket: 'medical' },
  { id: 'ricevuta', label: 'Ricevuta', icon: '🧾', defaultBucket: 'documents' },
  { id: 'fattura', label: 'Fattura', icon: '💶', defaultBucket: 'documents' },
  { id: 'questionario', label: 'Questionario Anamnesi', icon: '📋', defaultBucket: 'documents' },
  { id: 'fotografia', label: 'Fotografia / Posturale', icon: '🖼️', defaultBucket: 'documents' },
  { id: 'PDF', label: 'PDF Generico', icon: '📄', defaultBucket: 'documents' },
  { id: 'altro', label: 'Altro Documento', icon: '📁', defaultBucket: 'documents' },
];

const VISIBILITY_OPTIONS: { id: DocumentVisibility; label: string; description: string }[] = [
  { id: 'pubblico', label: 'Pubblico Staff', description: 'Visibile a tutto lo staff e istruttori dell\'organizzazione.' },
  { id: 'solo_staff', label: 'Solo Staff Medico / Admin', description: 'Riservato ad amministratori e staff medico accreditato.' },
  { id: 'atleta_coach', label: 'Atleta + Coach', description: 'Condiviso unicamente tra l\'atleta ed il suo coach personale.' },
  { id: 'riservato', label: 'Riservato Titolare', description: 'Accessibile solo al Titolare / Amministratore della struttura.' },
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  defaultAthleteId,
  defaultCategory = 'contratto',
}) => {
  const { athletes } = useAthletes();
  const { addDocument, uploadFileToSupabaseStorage } = useDocuments();
  const { showError } = useToast();

  const [selectedAthleteId, setSelectedAthleteId] = useState(defaultAthleteId || (athletes[0]?.id || ''));
  const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [visibility, setVisibility] = useState<DocumentVisibility>('pubblico');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const validateSelectedFile = (file: File): boolean => {
    if (file.size > 1 * 1024 * 1024) {
      showError('File troppo grande', 'Il file supera il limite di 1 MB previsto per la versione dimostrativa. Utilizza un file più piccolo.');
      return false;
    }
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (!allowedMime.includes(file.type.toLowerCase()) && !allowedExt.includes(ext)) {
      showError('Formato non supportato', 'Formato file non supportato. I formati consentiti sono PDF, JPG, JPEG e PNG.');
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateSelectedFile(file)) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateSelectedFile(file)) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteId) {
      showError('Seleziona un Atleta', 'Devi associare il documento ad un atleta registrato.');
      return;
    }
    if (!title.trim()) {
      showError('Nome Mancante', 'Inserisci il nome del documento.');
      return;
    }

    const athlete = athletes.find((a) => a.id === selectedAthleteId);
    const athleteName = athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Atleta Sconosciuto';

    try {
      setIsUploading(true);
      let storedFile: StoredFile;

      if (selectedFile) {
        storedFile = await uploadFileToSupabaseStorage(selectedFile, category, selectedAthleteId);
      } else {
        // Mock fallback file if none dragged
        const mockName = `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
        storedFile = {
          name: mockName,
          size: 480000,
          mimeType: 'application/pdf',
          url: '#',
          bucket: category === 'certificato medico' ? 'medical' : category === 'consenso privacy' ? 'consents' : 'documents',
          path: `athletes/${selectedAthleteId}/${Date.now()}_${mockName}`,
        };
      }

      addDocument({
        athleteId: selectedAthleteId,
        athleteName,
        category,
        title,
        file: storedFile,
        expiryDate: expiryDate || undefined,
        visibility,
        notes,
      });

      // Reset and close
      setSelectedFile(null);
      setTitle('');
      setNotes('');
      setExpiryDate('');
      setIsUploading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      showError('Errore Caricamento', 'Impossibile completare il salvataggio locale del file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Carica Nuovo Documento</h3>
              <p className="text-xs text-zinc-400">
                Archiviazione locale dimostrativa — <span className="text-amber-400 font-semibold">Memoria del browser (Predisposizione Supabase)</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Informative Demo Banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Nella demo i documenti vengono salvati localmente nel browser. Non caricare documenti reali o contenenti dati sensibili.
            </p>
          </div>

          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              File Documento <span className="text-amber-400">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/40'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between bg-zinc-800/80 p-3 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-8 h-8 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-zinc-100 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) • {selectedFile.type || 'Documento'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto animate-bounce" />
                  <p className="text-xs font-medium text-zinc-200">
                    Trascina qui il file oppure{' '}
                    <label className="text-amber-400 hover:underline cursor-pointer font-bold">
                      sfoglia
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Formati consentiti: <span className="font-semibold text-zinc-300">PDF, JPG, JPEG, PNG</span> (Dimensione max: <span className="text-amber-400 font-bold">1 MB</span>)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Atleta Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Atleta <span className="text-amber-400">*</span>
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
              >
                <option value="" disabled>
                  Seleziona Atleta...
                </option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} ({a.discipline})
                  </option>
                ))}
              </select>
            </div>

            {/* Document Category / Tipologia */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Tipologia Documento <span className="text-amber-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label} (Bucket: {cat.defaultBucket})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nome Documento */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Nome / Titolo Documento <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Certificato Medico Agonistico 2026, Contratto Gold Firmato"
              required
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data di Scadenza */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Data Scadenza</span>
                {category === 'certificato medico' && (
                  <span className="text-[10px] text-amber-400 font-normal">Obbligatoria per certificati</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Visibilità / Permessi */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Visibilità & Permessi RLS
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as DocumentVisibility)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note aggiuntive */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Note & Annotazioni
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Aggiungi eventuali dettagli sul medico emittente, clausole o verifiche..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none"
            />
          </div>

          {/* Footer buttons */}
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
              disabled={isUploading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Conversione e salvataggio locale...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Carica Documento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
