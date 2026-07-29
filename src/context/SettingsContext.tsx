import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  OrganizationSettings,
  AuditLogEntry,
  PaymentMethodSetting,
  CustomLabelTag,
  MessageTemplateSetting,
  ReminderRules,
  PrivacySettings,
  ApiIntegrationConfig,
} from '../types';
import { useToast } from './ToastContext';
import { STORAGE_KEYS } from '../config/storageKeys';

interface SettingsContextType {
  settings: OrganizationSettings;
  auditLogs: AuditLogEntry[];
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
  updatePaymentMethods: (methods: PaymentMethodSetting[]) => void;
  updateTaskCategories: (categories: string[]) => void;
  updateTags: (tags: CustomLabelTag[]) => void;
  updateReminderRules: (rules: ReminderRules) => void;
  updateMessageTemplates: (templates: MessageTemplateSetting[]) => void;
  updatePrivacySettings: (privacy: PrivacySettings) => void;
  updateApiIntegrations: (api: ApiIntegrationConfig) => void;
  addAuditLog: (action: string, details: string) => void;
  clearAuditLogs: () => void;
  resetToDefaults: () => void;
}

const SETTINGS_STORAGE_KEY = STORAGE_KEYS.SETTINGS;
const AUDIT_LOG_STORAGE_KEY = STORAGE_KEYS.AUDIT_LOGS;

const DEFAULT_PAYMENT_METHODS: PaymentMethodSetting[] = [
  { id: 'pm-1', name: 'Contanti', code: 'contanti', enabled: true, notes: 'Incasso diretto in cassa' },
  { id: 'pm-2', name: 'Bonifico Bancario', code: 'bonifico', enabled: true, notes: 'IBAN IT00000000000000000000' },
  { id: 'pm-3', name: 'Carta di Credito / POS', code: 'carta', enabled: true, notes: 'POS SumUp o Nexi in reception' },
  { id: 'pm-4', name: 'Stripe Online', code: 'stripe', enabled: true, notes: 'Gateway pagamento automatico carta' },
  { id: 'pm-5', name: 'PayPal', code: 'paypal', enabled: true, notes: 'Integrazione contabilità PayPal' },
  { id: 'pm-6', name: 'RID / SDD SEPA', code: 'addebito automatico', enabled: true, notes: 'Addebito ricorrente mensile' },
  { id: 'pm-7', name: 'Assegno', code: 'assegno', enabled: false, notes: 'In dismissione' },
];

const DEFAULT_TASK_CATEGORIES: string[] = [
  'Scheda Allenamento',
  'Check-in & Anamnesi',
  'Valutazione Funzionale',
  'Amministrazione & Pagamenti',
  'Sollecito Scadenza',
  'Visita Medica / Certificato',
  'Nutrizione & Dieta',
  'Telefonata / Follow-up',
];

const DEFAULT_TAGS: CustomLabelTag[] = [
  { id: 'tag-1', name: 'Atleta VIP', color: '#f59e0b', description: 'Atleta ad alto valore con supporto prioritario' },
  { id: 'tag-2', name: 'Agonista Powerlifting', color: '#3b82f6', description: 'Preparazione gara di forza' },
  { id: 'tag-3', name: 'Infortunato / Rehab', color: '#ef4444', description: 'Atleta in fase di riabilitazione' },
  { id: 'tag-4', name: 'Nuovo Iscritto', color: '#10b981', description: 'Inizio percorso negli ultimi 30 giorni' },
  { id: 'tag-5', name: 'Rischio Churn', color: '#ec4899', description: 'Assente da più di 14 giorni' },
  { id: 'tag-6', name: 'Certificato In Scadenza', color: '#8b5cf6', description: 'Certificato medico agonistico da rinnovare' },
];

const DEFAULT_REMINDER_RULES: ReminderRules = {
  expiryNoticeDays: [15, 7, 3, 1],
  overdueNoticeDays: [1, 5, 10, 15],
  autoSendWhatsapp: true,
  autoSendEmail: true,
};

const DEFAULT_MESSAGE_TEMPLATES: MessageTemplateSetting[] = [
  {
    id: 'tmpl-1',
    name: 'Benvenuto Nuovo Atleta',
    channel: 'whatsapp',
    category: 'Onboarding',
    body: 'Ciao {nome_atleta}! Benvenuto in {nome_attivita}. Il tuo abbonamento "{nome_pacchetto}" è ora attivo con il Coach {nome_coach}. Puoi accedere al tuo portale qui: {link_portale}. Buon allenamento!',
  },
  {
    id: 'tmpl-2',
    name: 'Promemoria Scadenza Abbonamento',
    channel: 'whatsapp',
    category: 'Scadenze',
    body: 'Ciao {nome_atleta}, ti ricordiamo che il tuo abbonamento "{nome_pacchetto}" scadrà il {data_scadenza}. Contattaci in reception o rispondi a questo messaggio per confezionare il rinnovo.',
  },
  {
    id: 'tmpl-3',
    name: 'Sollecito Pagamento Rata Scaduta',
    channel: 'email',
    category: 'Amministrazione',
    subject: 'Sollecito Pagamento Scaduto - {nome_attivita}',
    body: 'Gentile {nome_atleta},\n\nRisulta non ancora saldata la quota di €{importo} relativa al pacchetto "{nome_pacchetto}" con data di scadenza {data_scadenza}.\n\nTi invitiamo ad effettuare il saldo tramite bonifico (IBAN: {iban}) o direttamente in reception.\n\nCordiali saluti,\n{nome_attivita}',
  },
  {
    id: 'tmpl-4',
    name: 'Nuova Scheda d\'Allenamento Pronta',
    channel: 'app',
    category: 'Coaching',
    body: '🔥 Ciao {nome_atleta}, il Coach {nome_coach} ha caricato la tua nuova scheda di allenamento sul portale! Accedi subito per visualizzare i carichi e gli esercizi.',
  },
];

const DEFAULT_PRIVACY: PrivacySettings = {
  privacyPolicyText: 'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR). I dati sanitari, anamnestici e di allenamento sono trattati esclusivamente per l\'erogazione dei servizi di personal training e preparazione atletica.',
  consentRetentionMonths: 24,
  requireMedicalCertificateConsent: true,
  gdprContactEmail: 'demo@example.com',
};

const DEFAULT_API_INTEGRATIONS: ApiIntegrationConfig = {
  whatsappEnabled: false,
  whatsappPhoneNumberId: '000000000000000',
  whatsappAccessToken: 'DEMO_WHATSAPP_TOKEN',
  telegramEnabled: false,
  telegramBotToken: 'DEMO_TELEGRAM_TOKEN',
  telegramChatId: '',
  emailEnabled: false,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUser: 'demo@example.com',
  webhookUrl: 'https://api.example.com/demo',
  webhookSecret: 'DEMO_WEBHOOK_SECRET',
};

const DEFAULT_SETTINGS: OrganizationSettings = {
  businessName: 'Doctor Strength Performance Center',
  legalName: 'Doctor Strength S.r.l. Società Sportiva Dilettantistica',
  vatNumber: 'IT00000000000',
  fiscalCode: '00000000000',
  address: 'Via Dimostrativa, 1',
  city: 'Milano',
  postalCode: '20100',
  phone: '+39 02 0000000',
  email: 'demo@example.com',
  website: 'https://example.com/demo',
  logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80',
  primaryColor: '#f59e0b', // Amber-500 default
  secondaryColor: '#3b82f6', // Blue-500 default
  currency: 'EUR',
  currencySymbol: '€',
  timezone: 'Europe/Rome',
  dateFormat: 'DD/MM/YYYY',
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  taskCategories: DEFAULT_TASK_CATEGORIES,
  tags: DEFAULT_TAGS,
  reminderRules: DEFAULT_REMINDER_RULES,
  messageTemplates: DEFAULT_MESSAGE_TEMPLATES,
  privacy: DEFAULT_PRIVACY,
  apiIntegrations: DEFAULT_API_INTEGRATIONS,
};

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userName: 'Salvatore Carotenuto',
    userRole: 'proprietario',
    action: 'Inizializzazione Impostazioni',
    details: 'Configurazione iniziale parametri dell\'organizzazione Doctor Strength S.r.l.',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    userName: 'Marco Rossi (Admin)',
    userRole: 'amministratore',
    action: 'Aggiornamento Template Messaggi',
    details: 'Modificato modello WhatsApp "Benvenuto Nuovo Atleta"',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    userName: 'Salvatore Carotenuto',
    userRole: 'proprietario',
    action: 'Modifica Colori Branding',
    details: 'Impostato Colore Principale (#f59e0b) e Colore Secondario (#3b82f6)',
  },
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load settings from storage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load audit logs from storage:', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const { showSuccess, showInfo } = useToast();

  // Apply Live Dynamic Styling CSS variables on document root whenever primary/secondary colors change
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);

      // Store in localStorage
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to storage:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Error saving audit logs to storage:', e);
    }
  }, [auditLogs]);

  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: 'Salvatore Carotenuto (Proprietario)',
      userRole: 'proprietario',
      action,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]); // keep max 100
  };

  const updateSettings = (updates: Partial<OrganizationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });

    const changedKeys = Object.keys(updates).join(', ');
    addAuditLog('Aggiornamento Impostazioni', `Modificati i parametri: ${changedKeys}`);
    showSuccess('Impostazioni Salvate', 'Le modifiche sono state applicate con successo all\'interfaccia.');
  };

  const updatePaymentMethods = (methods: PaymentMethodSetting[]) => {
    setSettings((prev) => ({ ...prev, paymentMethods: methods }));
    addAuditLog('Metodi di Pagamento', `Aggiornato l'elenco dei ${methods.length} metodi di pagamento`);
    showSuccess('Metodi di Pagamento Aggiornati', 'Configurazione contabile salvata');
  };

  const updateTaskCategories = (categories: string[]) => {
    setSettings((prev) => ({ ...prev, taskCategories: categories }));
    addAuditLog('Categorie Attività', `Aggiornate ${categories.length} categorie per i task`);
    showSuccess('Categorie Attività Aggiornate', 'Categorie attività salvate');
  };

  const updateTags = (tags: CustomLabelTag[]) => {
    setSettings((prev) => ({ ...prev, tags }));
    addAuditLog('Etichette Atleti', `Aggiornate ${tags.length} etichette personalizzate`);
    showSuccess('Etichette Salvate', 'Etichette atleti aggiornate con successo');
  };

  const updateReminderRules = (rules: ReminderRules) => {
    setSettings((prev) => ({ ...prev, reminderRules: rules }));
    addAuditLog('Regole Promemoria', 'Aggiornate le regole e tempistiche dei promemoria automatici');
    showSuccess('Regole Promemoria Salvate', 'Configurazione notifiche aggiornata');
  };

  const updateMessageTemplates = (templates: MessageTemplateSetting[]) => {
    setSettings((prev) => ({ ...prev, messageTemplates: templates }));
    addAuditLog('Modelli Messaggi', `Aggiornati ${templates.length} modelli di comunicazione`);
    showSuccess('Modelli Messaggi Salvati', 'Modelli di testo salvati correttamente');
  };

  const updatePrivacySettings = (privacy: PrivacySettings) => {
    setSettings((prev) => ({ ...prev, privacy }));
    addAuditLog('Informativa Privacy & GDPR', 'Modificate le regole e consensi privacy');
    showSuccess('Impostazioni Privacy Salvate', 'Parametri GDPR aggiornati');
  };

  const updateApiIntegrations = (apiIntegrations: ApiIntegrationConfig) => {
    setSettings((prev) => ({ ...prev, apiIntegrations }));
    addAuditLog('Integrazioni API & Gateway', 'Aggiornate le chiavi API e Webhook di integrazione');
    showSuccess('Integrazioni Salvate', 'Parametri di connessione API aggiornati');
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    showInfo('Registro Svuotato', 'Il registro delle attività è stato svuotato.');
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    addAuditLog('Reset Impostazioni', 'Ripristinate le impostazioni predefinite di sistema');
    showInfo('Impostazioni Ripristinate', 'Ripristinati i valori predefiniti');
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        auditLogs,
        updateSettings,
        updatePaymentMethods,
        updateTaskCategories,
        updateTags,
        updateReminderRules,
        updateMessageTemplates,
        updatePrivacySettings,
        updateApiIntegrations,
        addAuditLog,
        clearAuditLogs,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve essere utilizzato all\'interno di un SettingsProvider');
  }
  return context;
};
