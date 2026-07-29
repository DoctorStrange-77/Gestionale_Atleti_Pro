import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Upload,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldX,
  Plus,
  Eye,
  Download,
  Trash2,
  Lock,
  Database,
  UserCheck,
  AlertCircle,
  FileCode,
  Calendar,
  XCircle,
  FilePlus,
  ArrowRight,
} from 'lucide-react';
import { useDocuments } from '../context/DocumentsContext';
import { useAthletes } from '../context/AthletesContext';
import { AthleteDocument, AthleteConsent, DocumentCategory, DocumentVisibility, ConsentStatus, DocumentAlert } from '../types';
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal';
import { NewConsentModal } from '../components/documents/NewConsentModal';
import { RevokeConsentModal } from '../components/documents/RevokeConsentModal';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { SupabaseSecurityModal } from '../components/documents/SupabaseSecurityModal';

type ActiveTab = 'documenti' | 'consensi' | 'avvisi' | 'sicurezza';

const CATEGORY_MAP: Record<DocumentCategory, { label: string; icon: string; bg: string; text: string }> = {
  'contratto': { label: 'Contratto', icon: '📜', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  'consenso privacy': { label: 'Consenso Privacy', icon: '🔒', bg: 'bg-sky-500/10 border-sky-500/20', text: 'text-sky-400' },
  'certificato medico': { label: 'Certificato Medico', icon: '🏥', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  'ricevuta': { label: 'Ricevuta', icon: '🧾', bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400' },
  'fattura': { label: 'Fattura', icon: '💶', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' },
  'questionario': { label: 'Questionario', icon: '📋', bg: 'bg-teal-500/10 border-teal-500/20', text: 'text-teal-400' },
  'fotografia': { label: 'Fotografia', icon: '🖼️', bg: 'bg-pink-500/10 border-pink-500/20', text: 'text-pink-400' },
  'PDF': { label: 'PDF Generico', icon: '📄', bg: 'bg-zinc-500/10 border-zinc-500/20', text: 'text-zinc-300' },
  'altro': { label: 'Altro Documento', icon: '📁', bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-400' },
};

const VISIBILITY_MAP: Record<DocumentVisibility, { label: string; color: string }> = {
  'pubblico': { label: 'Pubblico Staff', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'solo_staff': { label: 'Solo Staff Medico', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  'atleta_coach': { label: 'Atleta + Coach', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'riservato': { label: 'Riservato Titolare', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

export const DocumentiPage: React.FC = () => {
  const { documents, consents, alerts, deleteDocument, deleteConsent } = useDocuments();
  const { athletes } = useAthletes();

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('documenti');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<AthleteDocument | null>(null);
  const [selectedRevokeConsent, setSelectedRevokeConsent] = useState<AthleteConsent | null>(null);

  // Pre-fill parameters for modals from alerts
  const [uploadPresetAthleteId, setUploadPresetAthleteId] = useState<string | undefined>(undefined);
  const [uploadPresetCategory, setUploadPresetCategory] = useState<DocumentCategory | undefined>(undefined);

  // Document Filters
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState<string>('all');
  const [docAthlete, setDocAthlete] = useState<string>('all');
  const [docExpiryStatus, setDocExpiryStatus] = useState<string>('all'); // all, valid, expiring, expired
  const [docVisibility, setDocVisibility] = useState<string>('all');

  // Consents Filters
  const [consentSearch, setConsentSearch] = useState('');
  const [consentAthlete, setConsentAthlete] = useState<string>('all');
  const [consentStatusFilter, setConsentStatusFilter] = useState<string>('all');

  // Trigger preset upload
  const openUploadForAthlete = (athleteId: string, category?: DocumentCategory) => {
    setUploadPresetAthleteId(athleteId);
    setUploadPresetCategory(category || 'certificato medico');
    setIsUploadModalOpen(true);
  };

  // Trigger preset consent
  const openConsentForAthlete = (athleteId: string) => {
    setUploadPresetAthleteId(athleteId);
    setIsConsentModalOpen(true);
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    return documents.filter((doc) => {
      // Search
      const matchesSearch =
        doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
        doc.athleteName.toLowerCase().includes(docSearch.toLowerCase()) ||
        doc.file.name.toLowerCase().includes(docSearch.toLowerCase());

      if (!matchesSearch) return false;

      // Category
      if (docCategory !== 'all' && doc.category !== docCategory) return false;

      // Athlete
      if (docAthlete !== 'all' && doc.athleteId !== docAthlete) return false;

      // Visibility
      if (docVisibility !== 'all' && doc.visibility !== docVisibility) return false;

      // Expiry status
      if (docExpiryStatus === 'expired') {
        if (!doc.expiryDate || doc.expiryDate >= today) return false;
      } else if (docExpiryStatus === 'expiring') {
        if (!doc.expiryDate || doc.expiryDate < today || doc.expiryDate > thirtyDays) return false;
      } else if (docExpiryStatus === 'valid') {
        if (doc.expiryDate && doc.expiryDate < today) return false;
      }

      return true;
    });
  }, [documents, docSearch, docCategory, docAthlete, docExpiryStatus, docVisibility]);

  // Filtered Consents
  const filteredConsents = useMemo(() => {
    return consents.filter((cons) => {
      const matchesSearch =
        cons.consentType.toLowerCase().includes(consentSearch.toLowerCase()) ||
        cons.athleteName.toLowerCase().includes(consentSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (consentAthlete !== 'all' && cons.athleteId !== consentAthlete) return false;
      if (consentStatusFilter !== 'all' && cons.status !== consentStatusFilter) return false;

      return true;
    });
  }, [consents, consentSearch, consentAthlete, consentStatusFilter]);

  // Alert counters
  const alertStats = useMemo(() => {
    const certExpired = alerts.filter((a) => a.type === 'certificato_scaduto').length;
    const docExpiring = alerts.filter((a) => a.type === 'documento_in_scadenza').length;
    const docMissing = alerts.filter((a) => a.type === 'documento_mancante').length;
    const consentMissing = alerts.filter((a) => a.type === 'consenso_mancante').length;

    return { certExpired, docExpiring, docMissing, consentMissing, total: alerts.length };
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-amber-400" />
              <span>Documenti, Certificati & Consensi Privacy</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              Predisposizione Supabase RLS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Archiviazione sicura file, certificati medici agonistici, contratti, fatture e registro consensi GDPR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Regole Supabase RLS</span>
          </button>

          <button
            onClick={() => {
              setUploadPresetAthleteId(undefined);
              setIsConsentModalOpen(true);
            }}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Registra Consenso</span>
          </button>

          <button
            id="btn-upload-documento"
            onClick={() => {
              setUploadPresetAthleteId(undefined);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Carica Documento</span>
          </button>
        </div>
      </div>

      {/* Alert Banner / Counter Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('avvisi')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            alertStats.certExpired > 0
              ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Certificati Scaduti</span>
            <AlertCircle className={`w-4 h-4 ${alertStats.certExpired > 0 ? 'text-red-400' : 'text-zinc-600'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${alertStats.certExpired > 0 ? 'text-red-400' : 'text-zinc-200'}`}>
            {alertStats.certExpired}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Idoneità da rinnovare subito</p>
        </button>

        <button
          onClick={() => setActiveTab('avvisi')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            alertStats.docExpiring > 0
              ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">In Scadenza (30gg)</span>
            <Clock className={`w-4 h-4 ${alertStats.docExpiring > 0 ? 'text-amber-400' : 'text-zinc-600'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${alertStats.docExpiring > 0 ? 'text-amber-400' : 'text-zinc-200'}`}>
            {alertStats.docExpiring}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Documenti con scadenza imminente</p>
        </button>

        <button
          onClick={() => setActiveTab('avvisi')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            alertStats.docMissing > 0
              ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Documenti Mancanti</span>
            <FilePlus className={`w-4 h-4 ${alertStats.docMissing > 0 ? 'text-purple-400' : 'text-zinc-600'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${alertStats.docMissing > 0 ? 'text-purple-400' : 'text-zinc-200'}`}>
            {alertStats.docMissing}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Atleti senza contratti/certificati</p>
        </button>

        <button
          onClick={() => setActiveTab('avvisi')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            alertStats.consentMissing > 0
              ? 'bg-sky-500/10 border-sky-500/30 hover:border-sky-500/50'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Consensi Mancanti</span>
            <ShieldCheck className={`w-4 h-4 ${alertStats.consentMissing > 0 ? 'text-sky-400' : 'text-zinc-600'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${alertStats.consentMissing > 0 ? 'text-sky-400' : 'text-zinc-200'}`}>
            {alertStats.consentMissing}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Firme GDPR non registrate</p>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('documenti')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'documenti'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tutti i Documenti ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consensi')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'consensi'
              ? 'border-sky-400 text-sky-400 bg-sky-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gestione Consensi Privacy ({consents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('avvisi')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'avvisi'
              ? 'border-red-400 text-red-400 bg-red-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Avvisi & Scadenze ({alertStats.total})</span>
          {alertStats.total > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sicurezza')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sicurezza'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sicurezza & Supabase RLS</span>
        </button>
      </div>

      {/* TAB 1: ALL DOCUMENTS */}
      {activeTab === 'documenti' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Cerca per nome documento, atleta o file..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 outline-none"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
              >
                <option value="all">Tutte le Tipologie</option>
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_MAP[cat as DocumentCategory].icon} {cat.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Athlete */}
              <select
                value={docAthlete}
                onChange={(e) => setDocAthlete(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none max-w-[180px]"
              >
                <option value="all">Tutti gli Atleti</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>

              {/* Expiry Status */}
              <select
                value={docExpiryStatus}
                onChange={(e) => setDocExpiryStatus(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
              >
                <option value="all">Tutti gli Stati Scadenza</option>
                <option value="valid">Validi / In Regola</option>
                <option value="expiring">In Scadenza (30 gg)</option>
                <option value="expired">Scaduti</option>
              </select>

              {/* Visibility */}
              <select
                value={docVisibility}
                onChange={(e) => setDocVisibility(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
              >
                <option value="all">Tutte le Visibilità</option>
                <option value="pubblico">Pubblico Staff</option>
                <option value="solo_staff">Solo Staff Medico</option>
                <option value="atleta_coach">Atleta + Coach</option>
                <option value="riservato">Riservato Titolare</option>
              </select>
            </div>
          </div>

          {/* Documents Table / Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
              <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Nessun documento trovato</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Modifica i filtri di ricerca oppure carica un nuovo documento per l'atleta.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Carica Primo Documento</span>
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3.5">Documento & File</th>
                      <th className="px-4 py-3.5">Atleta</th>
                      <th className="px-4 py-3.5">Tipologia & Bucket</th>
                      <th className="px-4 py-3.5">Caricamento / Scadenza</th>
                      <th className="px-4 py-3.5">Visibilità RLS</th>
                      <th className="px-4 py-3.5 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredDocuments.map((doc) => {
                      const catInfo = CATEGORY_MAP[doc.category] || CATEGORY_MAP['altro'];
                      const visInfo = VISIBILITY_MAP[doc.visibility] || VISIBILITY_MAP['pubblico'];

                      const todayStr = new Date().toISOString().split('T')[0];
                      const isExpired = doc.expiryDate && doc.expiryDate < todayStr;
                      const isExpiring =
                        doc.expiryDate &&
                        !isExpired &&
                        doc.expiryDate <= new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

                      return (
                        <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 ${catInfo.bg}`}>
                                {catInfo.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-100 truncate">{doc.title}</p>
                                <p className="text-[11px] text-zinc-400 font-mono truncate">
                                  {doc.file.name} • {(doc.file.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-zinc-200">{doc.athleteName}</div>
                            <span className="text-[10px] text-zinc-500">ID: {doc.athleteId}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${catInfo.bg} ${catInfo.text}`}>
                                {doc.category}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-400/80 font-mono block mt-0.5">
                              bucket: {doc.file.bucket}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="text-zinc-300 text-[11px]">Caricato: {doc.uploadDate}</p>
                            {doc.expiryDate ? (
                              <div className="mt-1 flex items-center gap-1.5">
                                {isExpired ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Scaduto il {doc.expiryDate}
                                  </span>
                                ) : isExpiring ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3" /> Scade il {doc.expiryDate}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-400">Scadenza: {doc.expiryDate}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-500">Senza scadenza</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${visInfo.color}`}>
                              {visInfo.label}
                            </span>
                            <span className="block text-[10px] text-zinc-500 mt-0.5">da {doc.author}</span>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedPreviewDoc(doc)}
                                className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Anteprima & Dettagli"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const content = `SUPABASE FILE\nTitle: ${doc.title}\nAthlete: ${doc.athleteName}\nUploaded: ${doc.uploadDate}`;
                                  const blob = new Blob([content], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = doc.file.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Scarica File"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Eliminare permanentemente "${doc.title}"?`)) {
                                    deleteDocument(doc.id);
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Elimina Documento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSENTI PRIVACY MANAGEMENT */}
      {activeTab === 'consensi' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={consentSearch}
                onChange={(e) => setConsentSearch(e.target.value)}
                placeholder="Cerca tipo di consenso o nome atleta..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:border-sky-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={consentAthlete}
                onChange={(e) => setConsentAthlete(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
              >
                <option value="all">Tutti gli Atleti</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>

              <select
                value={consentStatusFilter}
                onChange={(e) => setConsentStatusFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
              >
                <option value="all">Tutti gli Stati Consenso</option>
                <option value="attivo">Attivo</option>
                <option value="in attesa">In Attesa</option>
                <option value="revocato">Revocato</option>
                <option value="scaduto">Scaduto</option>
              </select>

              <button
                onClick={() => {
                  setUploadPresetAthleteId(undefined);
                  setIsConsentModalOpen(true);
                }}
                className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Consenso</span>
              </button>
            </div>
          </div>

          {/* Consents Table */}
          {filteredConsents.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
              <ShieldCheck className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Nessun consenso registrato</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Registra i moduli di consenso GDPR e le liberatorie per la gestione legale della struttura.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3.5">Atleta</th>
                      <th className="px-4 py-3.5">Tipologia Consenso</th>
                      <th className="px-4 py-3.5">Data Sottoscrizione</th>
                      <th className="px-4 py-3.5">Stato & Revoca</th>
                      <th className="px-4 py-3.5">Documento Collegato</th>
                      <th className="px-4 py-3.5 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredConsents.map((cons) => {
                      return (
                        <tr key={cons.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-zinc-200">
                            {cons.athleteName}
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-zinc-100">{cons.consentType}</p>
                            {cons.notes && <p className="text-[11px] text-zinc-400 mt-0.5">{cons.notes}</p>}
                          </td>

                          <td className="px-4 py-3.5 text-zinc-300">
                            {cons.date}
                          </td>

                          <td className="px-4 py-3.5">
                            {cons.status === 'attivo' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Attivo
                              </span>
                            )}
                            {cons.status === 'in attesa' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> In Attesa di Firma
                              </span>
                            )}
                            {cons.status === 'revocato' && (
                              <div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
                                  <ShieldX className="w-3 h-3" /> Revocato ({cons.revocationDate})
                                </span>
                                {cons.revocationReason && (
                                  <p className="text-[10px] text-red-300/80 mt-1 italic max-w-xs">
                                    "{cons.revocationReason}"
                                  </p>
                                )}
                              </div>
                            )}
                            {cons.status === 'scaduto' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                Scaduto
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                            {cons.linkedDocumentTitle ? (
                              <span className="text-amber-400 font-medium flex items-center gap-1">
                                📄 {cons.linkedDocumentTitle}
                              </span>
                            ) : (
                              <span className="text-zinc-600 font-italic">Nessun file collegato</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {cons.status === 'attivo' && (
                                <button
                                  onClick={() => setSelectedRevokeConsent(cons)}
                                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                                >
                                  <ShieldX className="w-3.5 h-3.5" />
                                  <span>Revoca</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm('Eliminare questo record di consenso?')) {
                                    deleteConsent(cons.id);
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Elimina Consenso"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALERTS & EXPIRATIONS CENTER */}
      {activeTab === 'avvisi' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Centro Avvisi & Inadempienze Documentali</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Segnalazioni automatiche per certificati medici scaduti, documenti in scadenza e firme mancanti.
              </p>
            </div>
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs rounded-full">
              {alerts.length} Avvisi Attivi
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-zinc-200">Tutti i documenti sono in regola!</p>
              <p className="text-xs text-zinc-500">Nessun certificato scaduto né documento in scadenza rilevato.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    alert.severity === 'critico'
                      ? 'bg-red-500/10 border-red-500/30'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        alert.severity === 'critico' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {alert.dueDate && (
                        <span className="text-[11px] font-mono text-zinc-400">Data: {alert.dueDate}</span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100">{alert.title}</h4>
                    <p className="text-xs text-zinc-300">{alert.description}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-400">Atleta: {alert.athleteName}</span>
                    <button
                      onClick={() => {
                        if (alert.type === 'consenso_mancante') {
                          openConsentForAthlete(alert.athleteId);
                        } else {
                          openUploadForAthlete(alert.athleteId, alert.documentCategory);
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                    >
                      <span>{alert.actionLabel || 'Risolvi Ora'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SICUREZZA & SUPABASE RLS OVERVIEW */}
      {activeTab === 'sicurezza' && (
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Architettura Storage & Cifratura Supabase</h3>
                <p className="text-xs text-zinc-400">
                  I file caricati sono cifrati in transito (TLS 1.3) e protetti da Criteri di Sicurezza a Livello di Riga (Row Level Security).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 1. Isolamento Buckets
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Suddivisione rigida dei file nei bucket dedicated (<code className="text-emerald-400">documents</code>, <code className="text-amber-400">medical</code>, <code className="text-sky-400">consents</code>).
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> 2. RLS Security Policies
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Impedisce ad utenti o atleti non autorizzati di scaricare o visualizzare documenti di terzi.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> 3. Registro Audit & Autori
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ogni upload memorizza immutabilmente l'autore, la data, ed il ruolo di chi ha effettuato la registrazione.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                <span>Apri Simulatore & Script SQL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultAthleteId={uploadPresetAthleteId}
        defaultCategory={uploadPresetCategory}
      />

      <NewConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        defaultAthleteId={uploadPresetAthleteId}
      />

      <RevokeConsentModal
        consent={selectedRevokeConsent}
        isOpen={!!selectedRevokeConsent}
        onClose={() => setSelectedRevokeConsent(null)}
      />

      <DocumentPreviewModal
        document={selectedPreviewDoc}
        isOpen={!!selectedPreviewDoc}
        onClose={() => setSelectedPreviewDoc(null)}
      />

      <SupabaseSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
};
