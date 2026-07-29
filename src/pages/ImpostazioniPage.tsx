import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Clock,
  Calendar,
  CreditCard,
  Package,
  Layers,
  Tag,
  Users,
  Shield,
  Key,
  Bell,
  MessageSquare,
  Lock,
  Download,
  Share2,
  History,
  Plus,
  Trash2,
  Crown,
  FileSpreadsheet,
  Code,
  Save,
  RotateCcw,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { usePackages } from '../context/PackagesContext';
import { useToast } from '../context/ToastContext';
import { ROLE_DEFINITIONS } from '../lib/permissions';
import { SqlScriptModal } from '../components/sql/SqlScriptModal';
import { UserRole, CustomLabelTag } from '../types';
import {
  clearAppDemoData,
  exportAppLocalStorage,
  importAppLocalStorage,
  isAppStorageKey,
  isQuotaExceededError,
  STORAGE_KEYS,
} from '../config/storageKeys';
import { DEFAULT_ORGANIZATION_NAME } from '../lib/ownerProfile';

type SettingsSectionId =
  | 'organizzazione'
  | 'logo'
  | 'colori'
  | 'valuta'
  | 'fuso_orario'
  | 'formato_data'
  | 'pacchetti'
  | 'metodi_pagamento'
  | 'categorie_attivita'
  | 'etichette'
  | 'utenti'
  | 'ruoli'
  | 'permessi'
  | 'regole_promemoria'
  | 'modelli_messaggi'
  | 'privacy'
  | 'esportazione'
  | 'integrazioni'
  | 'registro_attivita';

const COLOR_PRESETS = [
  { name: 'Amber Gold (Predefinito)', primary: '#f59e0b', secondary: '#3b82f6' },
  { name: 'Emerald Performance', primary: '#10b981', secondary: '#8b5cf6' },
  { name: 'Crimson Power', primary: '#ef4444', secondary: '#f59e0b' },
  { name: 'Indigo Elite', primary: '#6366f1', secondary: '#10b981' },
  { name: 'Cyan Motion', primary: '#06b6d4', secondary: '#ec4899' },
  { name: 'Purple Luxury', primary: '#8b5cf6', secondary: '#f59e0b' },
];

export const ImpostazioniPage: React.FC = () => {
  const {
    user,
    toggleCoachFinancials,
    members,
    inviteMember,
    updateMemberRole,
    ownerProfile,
    updateOwnerProfile,
    logout,
  } = useAuth();
  const { showSuccess, showError } = useToast();
  const {
    settings,
    auditLogs,
    updateSettings,
    updatePaymentMethods,
    updateTaskCategories,
    updateTags,
    updateReminderRules,
    updatePrivacySettings,
    updateApiIntegrations,
    addAuditLog,
    clearAuditLogs,
    resetToDefaults,
  } = useSettings();
  const { packages } = usePackages();

  const [activeSection, setActiveSection] = useState<SettingsSectionId>('organizzazione');
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Form State for Organization & Branding
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [legalName, setLegalName] = useState(settings.legalName);
  const [vatNumber, setVatNumber] = useState(settings.vatNumber);
  const [fiscalCode, setFiscalCode] = useState(settings.fiscalCode);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [postalCode, setPostalCode] = useState(settings.postalCode);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [website, setWebsite] = useState(settings.website);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [currency, setCurrency] = useState(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [ownerFirstName, setOwnerFirstName] = useState(ownerProfile.firstName);
  const [ownerLastName, setOwnerLastName] = useState(ownerProfile.lastName);
  const [ownerEmail, setOwnerEmail] = useState(ownerProfile.email || '');
  const [ownerOrganization, setOwnerOrganization] = useState(ownerProfile.organizationName || '');
  const [ownerProfileError, setOwnerProfileError] = useState('');

  // State for adding new Task Category
  const [newCategoryName, setNewCategoryName] = useState('');

  // State for adding new Tag
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#f59e0b');
  const [newTagDesc, setNewTagDesc] = useState('');

  // State for Invite User Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('coach');

  // State for Audit Log search
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const isOwner = user?.role === 'proprietario' || user?.role === 'amministratore';

  // Save Organization Info
  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      legalName,
      vatNumber,
      fiscalCode,
      address,
      city,
      postalCode,
      phone,
      email,
      website,
    });
  };

  // Save Logo
  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ logoUrl });
  };

  // Save Colors (Real-Time Dynamic Graphic Update!)
  const handleSaveColors = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    updateSettings({ primaryColor: primary, secondaryColor: secondary });
  };

  // Save Currency, Timezone & Date Format
  const handleSaveRegional = () => {
    let symbol = '€';
    if (currency === 'USD') symbol = '$';
    if (currency === 'GBP') symbol = '£';
    if (currency === 'CHF') symbol = 'CHF';

    updateSettings({
      currency,
      currencySymbol: symbol,
      timezone,
      dateFormat,
    });
  };

  // Task Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const updated = [...settings.taskCategories, newCategoryName.trim()];
    updateTaskCategories(updated);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    const updated = settings.taskCategories.filter((c) => c !== cat);
    updateTaskCategories(updated);
  };

  // Tag handlers
  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const newTag: CustomLabelTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
      description: newTagDesc.trim(),
    };
    updateTags([...settings.tags, newTag]);
    setNewTagName('');
    setNewTagDesc('');
  };

  const handleDeleteTag = (id: string) => {
    updateTags(settings.tags.filter((t) => t.id !== id));
  };

  // Payment Method toggle
  const handleTogglePaymentMethod = (id: string) => {
    const updated = settings.paymentMethods.map((pm) =>
      pm.id === id ? { ...pm, enabled: !pm.enabled } : pm
    );
    updatePaymentMethods(updated);
  };

  // Invite user submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    inviteMember(inviteEmail, inviteName, inviteRole);
    setInviteEmail('');
    setInviteName('');
    setIsInviteModalOpen(false);
  };

  // Ripristina dati demo
  const handleResetDemoData = () => {
    const firstConfirmation = window.confirm(
      'Questa operazione eliminerà tutte le modifiche effettuate nella demo. Continuare?'
    );
    if (!firstConfirmation) return;

    const finalConfirmation = window.confirm(
      'Conferma definitiva: ripristinare i dati dimostrativi iniziali?'
    );
    if (!finalConfirmation) return;

    clearAppDemoData();
    if (ownerProfile.organizationName) {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({ businessName: ownerProfile.organizationName })
      );
    }
    showSuccess('Dati Demo Ripristinati', 'I dati dell\'applicazione sono stati ripristinati alle impostazioni dimostrative iniziali.');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleSaveOwnerProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const firstName = ownerFirstName.trim();
    const lastName = ownerLastName.trim();
    const emailValue = ownerEmail.trim();
    if (firstName.length < 2 || lastName.length < 2) {
      setOwnerProfileError('Nome e cognome devono contenere almeno 2 caratteri.');
      return;
    }
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setOwnerProfileError('Inserisci un indirizzo email valido.');
      return;
    }
    setOwnerProfileError('');
    const updatedProfile = {
      ...ownerProfile,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: emailValue || undefined,
      organizationName: ownerOrganization.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    updateOwnerProfile(updatedProfile);
    updateSettings({
      businessName: updatedProfile.organizationName || DEFAULT_ORGANIZATION_NAME,
    });
    addAuditLog(
      'Aggiornamento Profilo Proprietario',
      `Profilo proprietario aggiornato per ${updatedProfile.fullName}`
    );
    showSuccess('Profilo Proprietario Salvato', 'Le informazioni sono state aggiornate nell’interfaccia.');
  };

  const handleRemoveOwnerConfiguration = async () => {
    const firstConfirmation = window.confirm(
      'Questa operazione rimuoverà il profilo proprietario locale. Continuare?'
    );
    if (!firstConfirmation) return;
    const finalConfirmation = window.confirm(
      'Conferma definitiva: vuoi eliminare il proprietario configurato e ripetere la configurazione iniziale?'
    );
    if (!finalConfirmation) return;

    localStorage.removeItem(STORAGE_KEYS.OWNER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.INITIAL_SETUP_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.OWNER_MIGRATION_COMPLETED);
    await logout();
    window.location.reload();
  };

  // Esporta backup demo
  const handleExportDemoBackup = () => {
    const backupData = exportAppLocalStorage();
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_demo_builder_athlete_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Backup Esportato', 'Il file JSON con i dati locali della demo è stato scaricato con successo.');
  };

  // Importa backup demo
  const handleImportDemoBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasJsonExtension = file.name.toLowerCase().endsWith('.json');
    const hasJsonMimeType =
      file.type === '' || file.type === 'application/json' || file.type === 'text/json';
    if (!hasJsonExtension || !hasJsonMimeType) {
      showError('File Non Valido', 'Seleziona un file JSON valido con estensione .json.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          showError('File Non Valido', 'Il contenuto del file non può essere letto come JSON.');
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch {
          showError('Errore File', 'Il file selezionato non contiene JSON valido.');
          return;
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed) || Object.keys(parsed).length === 0) {
          showError('File Non Valido', 'Il file selezionato non contiene una struttura di backup valida.');
          return;
        }

        const backupData = parsed as Record<string, unknown>;
        const allKeys = Object.keys(backupData);
        const recognizedKeys = allKeys.filter(isAppStorageKey);
        const ignoredKeys = allKeys.filter((key) => !isAppStorageKey(key));
        if (recognizedKeys.length === 0) {
          showError(
            'Backup Non Riconosciuto',
            'Il file contiene soltanto chiavi estranee all’applicazione e non può essere importato.'
          );
          return;
        }

        const preview = [
          `Numero totale di categorie: ${allKeys.length}`,
          `Categorie riconosciute (${recognizedKeys.length}): ${recognizedKeys.join(', ')}`,
          `Chiavi ignorate: ${ignoredKeys.length > 0 ? ignoredKeys.join(', ') : 'nessuna'}`,
          '',
          'Confermare l’importazione del backup?',
        ].join('\n');
        const confirmed = window.confirm(
          preview
        );
        if (!confirmed) return;

        importAppLocalStorage(backupData);
        showSuccess('Backup Importato', 'Dati ripristinati con successo dal file di backup. Ricaricamento in corso...');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch (err) {
        console.error(err);
        if (isQuotaExceededError(err)) {
          showError(
            'Spazio Insufficiente',
            'Il backup supera lo spazio disponibile. I dati precedenti sono stati ripristinati automaticamente.'
          );
        } else {
          showError(
            'Importazione Fallita',
            'Il backup non è stato importato. I dati precedenti sono stati ripristinati automaticamente.'
          );
        }
      }
    };
    reader.onerror = () => {
      showError('Errore Lettura', 'Impossibile caricare il file selezionato.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase())
  );

  const SECTIONS_CONFIG: { id: SettingsSectionId; label: string; icon: React.ReactNode; category: string }[] = [
    { id: 'organizzazione', label: '1. Dati Organizzazione', icon: <Building2 className="w-4 h-4" />, category: 'Generale' },
    { id: 'logo', label: '2. Logo Aziendale', icon: <Building2 className="w-4 h-4 text-amber-400" />, category: 'Generale' },
    { id: 'colori', label: '3. Colori & Branding Live', icon: <Palette className="w-4 h-4 text-purple-400" />, category: 'Generale' },
    { id: 'valuta', label: '4. Valuta', icon: <Globe className="w-4 h-4 text-emerald-400" />, category: 'Generale' },
    { id: 'fuso_orario', label: '5. Fuso Orario', icon: <Clock className="w-4 h-4 text-blue-400" />, category: 'Generale' },
    { id: 'formato_data', label: '6. Formato Data', icon: <Calendar className="w-4 h-4 text-amber-400" />, category: 'Generale' },

    { id: 'pacchetti', label: '7. Pacchetti disponibili', icon: <Package className="w-4 h-4 text-purple-400" />, category: 'Listini & Tag' },
    { id: 'metodi_pagamento', label: '8. Metodi di Pagamento', icon: <CreditCard className="w-4 h-4 text-emerald-400" />, category: 'Listini & Tag' },
    { id: 'categorie_attivita', label: '9. Categorie Attività', icon: <Layers className="w-4 h-4 text-indigo-400" />, category: 'Listini & Tag' },
    { id: 'etichette', label: '10. Etichette & Tag Atleti', icon: <Tag className="w-4 h-4 text-amber-400" />, category: 'Listini & Tag' },

    { id: 'utenti', label: '11. Utenti & Team', icon: <Users className="w-4 h-4 text-blue-400" />, category: 'Team & Permessi' },
    { id: 'ruoli', label: '12. Ruoli Definizione', icon: <Shield className="w-4 h-4 text-amber-400" />, category: 'Team & Permessi' },
    { id: 'permessi', label: '13. Permessi & Economia Coach', icon: <Key className="w-4 h-4 text-emerald-400" />, category: 'Team & Permessi' },

    { id: 'regole_promemoria', label: '14. Regole Promemoria', icon: <Bell className="w-4 h-4 text-amber-400" />, category: 'Notifiche & API' },
    { id: 'modelli_messaggi', label: '15. Modelli dei Messaggi', icon: <MessageSquare className="w-4 h-4 text-indigo-400" />, category: 'Notifiche & API' },
    { id: 'integrazioni', label: '18. Integrazioni & Webhook', icon: <Share2 className="w-4 h-4 text-purple-400" />, category: 'Notifiche & API' },

    { id: 'privacy', label: '16. Privacy & GDPR', icon: <Lock className="w-4 h-4 text-red-400" />, category: 'Sicurezza & Dati' },
    { id: 'esportazione', label: '17. Esportazione Dati & Backup', icon: <Download className="w-4 h-4 text-emerald-400" />, category: 'Sicurezza & Dati' },
    { id: 'registro_attivita', label: '19. Registro Attività (Audit Log)', icon: <History className="w-4 h-4 text-blue-400" />, category: 'Sicurezza & Dati' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Pannello Impostazioni & Personalizzazione Grafica</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configurazione completa dei 19 moduli gestionali, branding live, ruoli e parametri contabili.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Code className="w-4 h-4 text-amber-400" />
            <span>SQL Supabase</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            title="Ripristina valori di fabbrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ripristina predefiniti</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sidebar Tabs (19 Sections) + Right Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Vertical Section Selector */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-xl space-y-4 h-fit">
          <div className="px-2 pt-1 pb-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              19 Sezioni Gestionali
            </span>
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
              19 / 19
            </span>
          </div>

          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {SECTIONS_CONFIG.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  <span className={isActive ? 'text-zinc-950' : 'text-zinc-400'}>
                    {sec.icon}
                  </span>
                  <span className="truncate flex-1">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active View Card */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* 1. DATI ORGANIZZAZIONE */}
          {activeSection === 'organizzazione' && (
            <form onSubmit={handleSaveOrganization} className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>1. Dati dell'Organizzazione e dell'Attività</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Informazioni fiscali, indirizzo e dati di contatto mostrati nelle ricevute e nei contratti.
                  </p>
                </div>
                {isOwner && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salva Dati</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    Nome dell'Attività / Performance Center *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isOwner}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    Ragione Sociale Completa *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isOwner}
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Partita IVA</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Codice Fiscale</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={fiscalCode}
                    onChange={(e) => setFiscalCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1">Indirizzo Sede Operativa</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Città</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">CAP</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Telefono / WhatsApp Sede</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Email Ufficiale / Contabilità</label>
                  <input
                    type="email"
                    disabled={!isOwner}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1">Sito Web Ufficiale</label>
                  <input
                    type="url"
                    disabled={!isOwner}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </form>
          )}

          {/* 2. LOGO */}
          {activeSection === 'logo' && (
            <form onSubmit={handleSaveLogo} className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>2. Logo Aziendale e Icona Brand</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Il logo viene mostrato in alto nel menu laterale, nelle ricevute di pagamento e nelle schede atletiche.
                  </p>
                </div>
                {isOwner && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Aggiorna Logo</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Logo Preview Box */}
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Anteprima Visuale Logo
                  </span>

                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Anteprima"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-2xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-xl">
                      DS
                    </div>
                  )}

                  <span className="text-xs text-zinc-500 font-mono truncate max-w-xs">
                    {logoUrl || 'Nessun URL logo impostato'}
                  </span>
                </div>

                {/* Logo Input */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      URL del Logo (Link Immagine PNG/JPG/SVG)
                    </label>
                    <input
                      type="url"
                      disabled={!isOwner}
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Puoi inserire qualsiasi URL immagine di alta qualità. Si raccomanda un'immagine quadrata con sfondo trasparente o scuro (minimo 200x200px).
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* 3. COLORI & BRANDING LIVE */}
          {activeSection === 'colori' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <span>3. Colori dell'Interfaccia & Dynamic Live Branding</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Seleziona il colore principale e secondario. L'intera interfaccia dell'applicazione si aggiornerà istantaneamente!
                </p>
              </div>

              {/* Color Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Palette Cromatiche Predefinite
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      primaryColor.toLowerCase() === preset.primary.toLowerCase() &&
                      secondaryColor.toLowerCase() === preset.secondary.toLowerCase();

                    return (
                      <button
                        key={preset.name}
                        onClick={() => handleSaveColors(preset.primary, preset.secondary)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center -space-x-1">
                            <span
                              className="w-4 h-4 rounded-full border border-black/50"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/50"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-zinc-200">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Colore Principale (Primary Accent)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      disabled={!isOwner}
                      value={primaryColor}
                      onChange={(e) => handleSaveColors(e.target.value, secondaryColor)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      disabled={!isOwner}
                      value={primaryColor}
                      onChange={(e) => handleSaveColors(e.target.value, secondaryColor)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Colore Secondario (Secondary Highlight)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      disabled={!isOwner}
                      value={secondaryColor}
                      onChange={(e) => handleSaveColors(primaryColor, e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      disabled={!isOwner}
                      value={secondaryColor}
                      onChange={(e) => handleSaveColors(primaryColor, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Widget */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Anteprima Live Componenti
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Pulsante Principale
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-xs font-bold border"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: `${primaryColor}15`,
                    }}
                  >
                    Pulsante Outline
                  </button>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${secondaryColor}25`, color: secondaryColor }}
                  >
                    Badge In evidenza
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. VALUTA */}
          {activeSection === 'valuta' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span>4. Valuta Predefinita di Sistema</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Definisci la valuta usata nei calcoli contabili, pacchetti e report commerciali.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={handleSaveRegional}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs"
                  >
                    Salva Valuta
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Valuta Principale</label>
                  <select
                    disabled={!isOwner}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="EUR">Euro (€ - EUR)</option>
                    <option value="USD">Dollaro Statunitense ($ - USD)</option>
                    <option value="GBP">Sterlina Britannica (£ - GBP)</option>
                    <option value="CHF">Franco Svizzero (CHF)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. FUSO ORARIO */}
          {activeSection === 'fuso_orario' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>5. Fuso Orario del Centro</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Garantisce che gli orari delle lezioni, scadenze e notifiche siano sincronizzati.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={handleSaveRegional}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs"
                  >
                    Salva Fuso Orario
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Timezone / Fuso Orario</label>
                  <select
                    disabled={!isOwner}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Europe/Rome">Europe/Rome (GMT+1 / Central Europe)</option>
                    <option value="Europe/London">Europe/London (GMT+0 / UK)</option>
                    <option value="America/New_York">America/New_York (GMT-5 / Eastern Time)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9 / Japan)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 6. FORMATO DATA */}
          {activeSection === 'formato_data' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>6. Formato di Visualizzazione Date</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Seleziona lo stile di visualizzazione delle date nelle tabelle e nei report.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={handleSaveRegional}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs"
                  >
                    Salva Formato
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Formato Data</label>
                  <select
                    disabled={!isOwner}
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (es. 29/07/2026 - Standard Italiano)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (es. 2026-07-29 - Standard ISO)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (es. 07/29/2026 - US Format)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 7. PACCHETTI */}
          {activeSection === 'pacchetti' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    <span>7. Listino Pacchetti e Offerte Attive ({packages.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Visualizzazione e configurazione sintetica dei pacchetti caricati a sistema.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{pkg.name}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        € {pkg.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{pkg.description}</p>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      Durata: {pkg.durationMonths} Mesi | Crediti: {pkg.entriesCount || 'Illimitati'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. METODI DI PAGAMENTO */}
          {activeSection === 'metodi_pagamento' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>8. Metodi di Pagamento Abilitati</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Attiva o disattiva i canali di pagamento selezionabili durante la registrazione di incassi.
                </p>
              </div>

              <div className="space-y-2.5">
                {settings.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-200 block">{pm.name}</span>
                      <span className="text-[11px] text-zinc-400">{pm.notes}</span>
                    </div>

                    <button
                      disabled={!isOwner}
                      onClick={() => handleTogglePaymentMethod(pm.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        pm.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {pm.enabled ? 'Abilitato' : 'Disabilitato'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. CATEGORIE ATTIVITA */}
          {activeSection === 'categorie_attivita' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>9. Categorie per Task e Attività</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Personalizza le tipologie di task assegnabili al team e ai coach.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nuova Categoria (es. Test Lattato)..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-amber-600"
                >
                  Aggiungi
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {settings.taskCategories.map((cat) => (
                  <div
                    key={cat}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-semibold text-zinc-200">{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. ETICHETTE & TAG ATLETI */}
          {activeSection === 'etichette' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <span>10. Etichette e Tag Personalizzati Atleti</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Crea tag con colore e descrizione per categorizzare e filtrare gli iscritti.
                </p>
              </div>

              {/* Add Tag Form */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 text-xs">
                <span className="font-bold text-zinc-200 block">Crea Nuova Etichetta</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nome Tag (es. Elite Athlete)..."
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newTagDesc}
                    onChange={(e) => setNewTagDesc(e.target.value)}
                    placeholder="Descrizione sintetica..."
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                    <button
                      onClick={handleAddTag}
                      className="flex-1 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-600"
                    >
                      Aggiungi Tag
                    </button>
                  </div>
                </div>
              </div>

              {/* Tag List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {settings.tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold text-zinc-950 mb-1"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                      <p className="text-[11px] text-zinc-400">{tag.description || 'Nessuna descrizione'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. UTENTI & TEAM */}
          {activeSection === 'utenti' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>11. Gestione Utenti e Team ({members.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Elenco dei collaboratori dell'organizzazione e relativi ruoli attivi.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Invita Collaboratore</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-zinc-800 text-xs">
                {members.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-zinc-200 block">{m.userFullName}</span>
                      <span className="text-[11px] text-zinc-500">{m.userEmail}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        disabled={!isOwner || m.roleCode === 'proprietario'}
                        value={m.roleCode}
                        onChange={(e) => updateMemberRole(m.id, e.target.value as UserRole)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      >
                        {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => (
                          <option key={rKey} value={rKey}>
                            {ROLE_DEFINITIONS[rKey].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. RUOLI DEFINIZIONE */}
          {activeSection === 'ruoli' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>12. Definizione e Gerarchia Ruoli</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Panoramica delle mansioni previste dal sistema di permessi.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
                  const rDef = ROLE_DEFINITIONS[rKey];
                  return (
                    <div
                      key={rKey}
                      className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${rDef.badgeColor}`}>
                          {rDef.name}
                        </span>
                        {rKey === 'proprietario' && (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" /> Ruolo Supremo
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-[11px] pt-1">{rDef.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 13. PERMESSI & ECONOMIA COACH */}
          {activeSection === 'permessi' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <span>13. Matrice Permessi e Visibilità Economica</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Regola l'accesso dei Coach ai dati di fatturato, pagamenti e pacchetti dei propri atleti.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-zinc-200">Visibilità Dati Economici per i Coach</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Permetti ai Coach di consultare gli importi saldati dagli atleti a loro assegnati.
                  </p>
                </div>

                <button
                  onClick={() => toggleCoachFinancials()}
                  className={`px-3.5 py-2 rounded-xl border font-bold text-xs shrink-0 transition-all ${
                    user?.canViewFinancials
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {user?.canViewFinancials ? 'Abilitato' : 'Disabilitato'}
                </button>
              </div>
            </div>
          )}

          {/* 14. REGOLE PROMEMORIA */}
          {activeSection === 'regole_promemoria' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-400" />
                    <span>14. Regole dei Promemoria e Tempistiche</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Configura l'invio automatico delle notifiche prima e dopo la scadenza.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-zinc-200">Invio Automatico WhatsApp</span>
                  <input
                    type="checkbox"
                    checked={settings.reminderRules.autoSendWhatsapp}
                    onChange={(e) =>
                      updateReminderRules({
                        ...settings.reminderRules,
                        autoSendWhatsapp: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">Invio Automatico Email</span>
                  <input
                    type="checkbox"
                    checked={settings.reminderRules.autoSendEmail}
                    onChange={(e) =>
                      updateReminderRules({
                        ...settings.reminderRules,
                        autoSendEmail: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 15. MODELLI MESSAGGI */}
          {activeSection === 'modelli_messaggi' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span>15. Modelli dei Messaggi e Template Testuali</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Testi predefiniti per comunicazioni via WhatsApp, Email e App.
                </p>
              </div>

              <div className="space-y-3">
                {settings.messageTemplates.map((tmpl) => (
                  <div key={tmpl.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{tmpl.name}</span>
                      <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-mono uppercase text-zinc-300">
                        {tmpl.channel}
                      </span>
                    </div>
                    <p className="text-zinc-300 font-mono text-[11px] bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 whitespace-pre-wrap">
                      {tmpl.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 16. PRIVACY & GDPR */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  <span>16. Informativa Privacy & Conformità GDPR</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Testo informativa sul trattamento dei dati personali e conservazione.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Informativa Privacy</label>
                  <textarea
                    rows={4}
                    value={settings.privacy.privacyPolicyText}
                    onChange={(e) =>
                      updatePrivacySettings({
                        ...settings.privacy,
                        privacyPolicyText: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 17. GESTIONE DATI DIMOSTRATIVI E BACKUP */}
          {activeSection === 'esportazione' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-400" />
                  <span>17. Gestione Dati Dimostrativi e Backup</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Gestisci il ripristino dei dati demo iniziali o effettua il backup e l'importazione dei dati salvati nel browser.
                </p>
              </div>

              <form onSubmit={handleSaveOwnerProfile} className="p-5 bg-zinc-950 border border-amber-500/25 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                    Profilo proprietario
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Questi dati identificano il proprietario locale della demo.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-zinc-400 space-y-1">
                    <span>Nome *</span>
                    <input value={ownerFirstName} onChange={(event) => setOwnerFirstName(event.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500" />
                  </label>
                  <label className="text-xs text-zinc-400 space-y-1">
                    <span>Cognome *</span>
                    <input value={ownerLastName} onChange={(event) => setOwnerLastName(event.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500" />
                  </label>
                  <label className="text-xs text-zinc-400 space-y-1">
                    <span>Email</span>
                    <input type="email" value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500" />
                  </label>
                  <label className="text-xs text-zinc-400 space-y-1">
                    <span>Organizzazione</span>
                    <input value={ownerOrganization} placeholder={DEFAULT_ORGANIZATION_NAME} onChange={(event) => setOwnerOrganization(event.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500" />
                  </label>
                </div>
                <div className="text-xs text-zinc-400">
                  Ruolo: <strong className="text-amber-400">Proprietario</strong>
                </div>
                {ownerProfileError && <p className="text-xs text-red-400">{ownerProfileError}</p>}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all">
                    SALVA PROFILO PROPRIETARIO
                  </button>
                  <button type="button" onClick={() => void handleRemoveOwnerConfiguration()} className="px-4 py-2.5 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold rounded-xl text-xs transition-all">
                    RIMUOVI CONFIGURAZIONE PROPRIETARIO
                  </button>
                </div>
              </form>

              {/* Informative Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Nota sulla persistenza locale:</span>
                  <p className="text-amber-300/90 text-[11px] leading-relaxed">
                    Il ripristino elimina solo i dati locali di questa demo salvati nel browser (chiavi <code className="bg-amber-950/60 px-1 py-0.5 rounded font-mono">builder_athlete_*</code>). Non vengono toccati dati di altri siti o domini.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Ripristina Dati Demo */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100">Ripristina dati demo</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Elimina i dati locali correnti e ricarica i dati dimostrativi iniziali dell'applicazione.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDemoData}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ripristina dati demo</span>
                  </button>
                </div>

                {/* 2. Esporta Backup Demo */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100">Esporta backup demo</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Scarica un file JSON completo contenente tutti i dati dell'applicazione presenti nel localStorage.
                    </p>
                  </div>
                  <button
                    onClick={handleExportDemoBackup}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>Esporta backup demo</span>
                  </button>
                </div>

                {/* 3. Importa Backup Demo */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100">Importa backup demo</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Seleziona un file JSON di backup precedentemente salvato per ripristinare i dati della demo.
                    </p>
                  </div>
                  <label className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Importa backup demo</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDemoBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 18. INTEGRAZIONI */}
          {activeSection === 'integrazioni' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <span>18. Integrazioni API, Gateway & Webhook</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Collega servizi esterni come WhatsApp Cloud API, Telegram Bot e Server SMTP.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <span className="font-bold text-zinc-200">WhatsApp Business Cloud API</span>
                  <input
                    type="text"
                    value={settings.apiIntegrations.whatsappPhoneNumberId}
                    onChange={(e) =>
                      updateApiIntegrations({
                        ...settings.apiIntegrations,
                        whatsappPhoneNumberId: e.target.value,
                      })
                    }
                    placeholder="Phone Number ID..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-zinc-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 19. REGISTRO ATTIVITA (AUDIT LOG) */}
          {activeSection === 'registro_attivita' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    <span>19. Registro Attività e Audit Log ({filteredAuditLogs.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Tracciamento di tutte le modifiche contabili, di ruolo e di sistema.
                  </p>
                </div>
                <button
                  onClick={clearAuditLogs}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Svuota Registro
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Cerca per azione, utente o dettagli..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                {filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold text-amber-400">{log.action}</span>
                      <span className="font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-zinc-200">{log.details}</p>
                    <span className="text-[10px] text-zinc-500 block">
                      Eseguito da: {log.userName} ({log.userRole})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-zinc-100">Invita Nuovo Collaboratore</h4>
            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="es. Alessandro Rossi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alessandro@doctorstrength.it"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Ruolo Assegnato *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200"
                >
                  <option value="amministratore">Amministratore</option>
                  <option value="coach">Coach / Personal Trainer</option>
                  <option value="segreteria">Segreteria / Front-desk</option>
                  <option value="staff">Staff Tecnico</option>
                  <option value="atleta">Atleta (Portale)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
                >
                  Invia Invito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSqlModal && <SqlScriptModal onClose={() => setShowSqlModal(false)} />}
    </div>
  );
};
