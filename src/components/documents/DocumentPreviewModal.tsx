import React from 'react';
import { X, FileText, Download, Shield, Eye, Calendar, User, Database, HardDrive, Trash2 } from 'lucide-react';
import { AthleteDocument } from '../../types';
import { useDocuments } from '../../context/DocumentsContext';

interface DocumentPreviewModalProps {
  document: AthleteDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const { deleteDocument } = useDocuments();

  if (!isOpen || !document) return null;

  const isImage = document.file.mimeType.startsWith('image/');
  const formattedSize = (document.file.size / 1024).toFixed(1) + ' KB';

  const handleDelete = () => {
    if (window.confirm(`Sei sicuro di voler eliminare permanentemente "${document.title}" da Supabase Storage?`)) {
      deleteDocument(document.id);
      onClose();
    }
  };

  const handleDownload = () => {
    if (document.file.url && document.file.url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = document.file.url;
      link.download = document.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Simulate file download
      const content = `SUPABASE STORAGE DEMO FILE\nDocumento: ${document.title}\nAtleta: ${document.athleteName}\nCategoria: ${document.category}\nData caricamento: ${document.uploadDate}\nPath: ${document.file.path}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">{document.title}</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Atleta: <strong className="text-zinc-200">{document.athleteName}</strong></span>
                <span>•</span>
                <span className="capitalize text-amber-400 font-semibold">{document.category}</span>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Preview Canvas */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
            {isImage && document.file.url && document.file.url.startsWith('data:') ? (
              <img
                src={document.file.url}
                alt={document.title}
                className="max-h-64 object-contain rounded-lg border border-zinc-800"
              />
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200">{document.file.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formattedSize} • {document.file.mimeType}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] text-emerald-400 font-mono">
                  <Database className="w-3.5 h-3.5" />
                  <span>Bucket: {document.file.bucket}</span>
                </div>
              </div>
            )}
          </div>

          {/* Supabase Storage Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
              <p className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px] text-zinc-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Supabase Storage Info</span>
              </p>
              <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                <p><strong className="text-zinc-300 font-normal">Bucket:</strong> {document.file.bucket}</p>
                <p className="truncate"><strong className="text-zinc-300 font-normal">Path:</strong> {document.file.path}</p>
                <p><strong className="text-zinc-300 font-normal">Size:</strong> {formattedSize}</p>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
              <p className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px] text-zinc-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Metadati & Visibilità RLS</span>
              </p>
              <div className="space-y-1 text-[11px] text-zinc-400">
                <p><strong className="text-zinc-300">Caricato il:</strong> {document.uploadDate}</p>
                <p><strong className="text-zinc-300">Scadenza:</strong> {document.expiryDate || 'Nessuna (Illimitata)'}</p>
                <p><strong className="text-zinc-300">Autore:</strong> {document.author} ({document.authorRole || 'Staff'})</p>
                <p><strong className="text-zinc-300">Visibilità:</strong> <span className="text-amber-400 uppercase font-semibold">{document.visibility.replace('_', ' ')}</span></p>
              </div>
            </div>
          </div>

          {document.notes && (
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Note:</p>
              <p className="text-xs text-zinc-300">{document.notes}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Elimina File</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Scarica File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
