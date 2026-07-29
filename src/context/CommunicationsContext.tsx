import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CommunicationLog,
  CommunicationChannel,
  CommunicationOutcome,
  MessageTemplate,
  MessageTemplateCategory,
  ApiIntegrationConfig,
} from '../types';
import { useToast } from './ToastContext';

interface CommunicationsContextType {
  communications: CommunicationLog[];
  templates: MessageTemplate[];
  apiConfig: ApiIntegrationConfig;
  addCommunication: (data: Omit<CommunicationLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCommunication: (id: string, updates: Partial<CommunicationLog>) => Promise<void>;
  deleteCommunication: (id: string) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => Promise<void>;
  resetTemplatesToDefault: () => void;
  updateApiConfig: (updates: Partial<ApiIntegrationConfig>) => Promise<void>;
  renderTemplateText: (template: MessageTemplate, variables: Record<string, string>) => { subject: string; body: string };
  openWhatsApp: (phone: string, text: string) => void;
  openTelegram: (phoneOrUser: string, text: string) => void;
  openEmail: (email: string, subject: string, body: string) => void;
  copyToClipboard: (text: string) => Promise<boolean>;
}

const CommunicationsContext = createContext<CommunicationsContextType | undefined>(undefined);

const STORAGE_KEY_COMMUNICATIONS = 'app_communications_v1';
const STORAGE_KEY_TEMPLATES = 'app_comm_templates_v1';
const STORAGE_KEY_API_CONFIG = 'app_comm_api_config_v1';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-benvenuto',
    category: 'benvenuto',
    title: 'Benvenuto Atleta',
    description: 'Messaggio di benvenuto per nuovi iscritti al centro sportivo o coaching.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'Benvenuto in {{nome_palestra}}, {{nome_atleta}}!',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\nTi diamo un caloroso benvenuto in {{nome_palestra}}! Siamo felici di iniziare questo percorso insieme. Il tuo piano {{nome_pacchetto}} è attivo.\n\nPer qualsiasi dubbio contatta il tuo coach {{nome_staff}} o la segreteria.\n\nBuon allenamento!\nIl Team di {{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-pagamento-scadenza',
    category: 'pagamento_in_scadenza',
    title: 'Pagamento in Scadenza',
    description: 'Promemoria amichevole per la rata o abbonamento in arrivo alla scadenza.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'Promemoria: Rata in scadenza per {{nome_atleta}}',
    bodyTemplate:
      'Gentile {{nome_atleta}},\n\nti ricordiamo che il saldo della rata di {{importo}} per l\'abbonamento {{nome_pacchetto}} andrà in scadenza il {{data_scadenza}}.\n\nPuoi saldare direttamente in segreteria oppure tramite bonifico/POS.\n\nGrazie per la puntualità,\n{{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-pagamento-scaduto',
    category: 'pagamento_scaduto',
    title: 'Pagamento Scaduto / Sollecito',
    description: 'Sollecito formale per pagamenti o rate non saldate nei termini.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'Sollecito: Pagamento scaduto per {{nome_pacchetto}}',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\nrisulta non ancora saldato l\'importo di {{importo}} relativo alla quota {{nome_pacchetto}}, scaduta il {{data_scadenza}}.\n\nTi preghiamo di regolarizzare la posizione entro qualche giorno per garantire la continuità del servizio.\n\nRestiamo a disposizione,\n{{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-abbonamento-scadenza',
    category: 'abbonamento_in_scadenza',
    title: 'Abbonamento in Scadenza',
    description: 'Notifica per abbonamenti vicini al termine per incoraggiare la continuità.',
    defaultChannel: 'email',
    subjectTemplate: 'Il tuo abbonamento {{nome_pacchetto}} è in scadenza',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\nil tuo abbonamento {{nome_pacchetto}} arriverà a termine il {{data_scadenza}}.\n\nContatta {{nome_staff}} o passa in reception per confermare il rinnovo ed evitare interruzioni nella pianificazione degli allenamenti.\n\nA presto,\n{{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-rinnovo',
    category: 'rinnovo',
    title: 'Proposta di Rinnovo',
    description: 'Messaggio commerciale promozionale per il rinnovo dell\'abbonamento.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'Proposta di rinnovo per {{nome_atleta}}',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\ncomplimenti per i risultati ottenuti finora! Per proseguire verso i tuoi obiettivi, abbiamo preparato la tua nuova scheda e la proposta di rinnovo per {{nome_pacchetto}}.\n\nPassa in segreteria per scoprire le promozioni riservate ai tesserati fedeli.\n\nTi aspettiamo,\n{{nome_staff}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-documento-mancante',
    category: 'documento_mancante',
    title: 'Documento Mancante',
    description: 'Richiesta di invio o firma di documenti amministrativi o contrattuali.',
    defaultChannel: 'email',
    subjectTemplate: 'Richiesta documento mancante: {{nome_documento}}',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\nper completare il tuo fascicolo anagrafico in regola, abbiamo bisogno che ci trasmetta la copia di: {{nome_documento}}.\n\nPuoi caricarlo sul Portale Atleta oppure inviarlo in risposta a questa mail.\n\nGrazie per la collaborazione,\n{{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-certificato-medico',
    category: 'certificato_medico',
    title: 'Certificato Medico in Scadenza/Mancante',
    description: 'Sollecito obbligatorio per la consegna del certificato idoneità sportiva.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'IMPORTANTE: Certificato Medico per {{nome_atleta}}',
    bodyTemplate:
      'Gentile {{nome_atleta}},\n\nti ricordiamo che il tuo certificato di idoneità sportiva scade il {{data_scadenza}} (o non risulta presente negli archivi).\n\nPer normativa vigente, senza un certificato in corso di validità non possiamo consentire l\'accesso agli allenamenti. Ti chiediamo di consegnarne copia il prima possibile.\n\nCordiali saluti,\nSegreteria {{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-checkin-non-completato',
    category: 'checkin_non_completato',
    title: 'Check-in Settimanale Non Completato',
    description: 'Promemoria per atleti che non hanno caricato le misurazioni o il feedback.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'Promemoria Check-in Settimanale - {{nome_atleta}}',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\nnotiamo che non hai ancora completato il tuo check-in per questa settimana. Invia i tuoi dati e le foto così {{nome_staff}} potrà analizzare l\'andamento e aggiornare i carichi!\n\nRestiamo in attesa,\n{{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-ringraziamento-pagamento',
    category: 'ringraziamento_pagamento',
    title: 'Ringraziamento per il Pagamento',
    description: 'Conferma di incasso e ringraziamento inviato all\'atleta.',
    defaultChannel: 'email',
    subjectTemplate: 'Conferma pagamento ricevuto per {{nome_pacchetto}}',
    bodyTemplate:
      'Gentile {{nome_atleta}},\n\nabbiamo registrato con successo la ricezione del pagamento di {{importo}} per {{nome_pacchetto}} in data {{data_pagamento}}.\n\nTi ringraziamo per la precisione e ti auguriamo un ottimo proseguimento di allenamenti!\n\nCordiali saluti,\n{{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-recupero-inattivo',
    category: 'recupero_inattivo',
    title: 'Recupero Atleta Inattivo',
    description: 'Messaggio di riaggancio per atleti che non frequentano da settimane/mesi.',
    defaultChannel: 'WhatsApp',
    subjectTemplate: 'Ci manchi in palestra! Torna ad allenarti con noi',
    bodyTemplate:
      'Ciao {{nome_atleta}},\n\nè un po\' che non ci vediamo in palestra! Volevamo sapere come stai e se possiamo aiutarti a ripartire con i tuoi obiettivi di benessere.\n\nSe vuoi passare a fare due chiacchiere con {{nome_staff}}, abbiamo riservato una sessione di ripartenza gratuita per te!\n\nTi aspettiamo,\nIl Team di {{nome_palestra}}',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_COMMUNICATIONS: CommunicationLog[] = [
  {
    id: 'comm-1',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    athletePhone: '+393331234567',
    athleteEmail: 'marco.rossi@email.com',
    date: '2026-07-28',
    time: '11:30',
    channel: 'WhatsApp',
    author: 'Coach Roberto',
    subject: 'Verifica aderenza piano nutrizionale e check-in',
    summary: 'Chiamato via WhatsApp per confermare i dati del check-in. Marco ha confermato ottima energia e carichi in crescita.',
    outcome: 'positivo',
    nextAction: 'Pianificare videochiamata tra 2 settimane',
    nextContactDate: '2026-08-11',
    templateCategory: 'checkin_non_completato',
    messageSent: 'Ciao Marco, complimenti per la costanza nei primi test! Ci vediamo alla prossima sessione.',
    createdAt: '2026-07-28T11:30:00Z',
    updatedAt: '2026-07-28T11:30:00Z',
  },
  {
    id: 'comm-2',
    athleteId: 'ath-2',
    athleteName: 'Laura Bianchi',
    athletePhone: '+393409876543',
    athleteEmail: 'laura.bianchi@email.com',
    date: '2026-07-27',
    time: '15:15',
    channel: 'email',
    author: 'Segreteria',
    subject: 'Sollecito certificato medico agonistico in scadenza',
    summary: 'Inviata mail formale di sollecito con allegato il modulo per la visita sportiva convenzionata.',
    outcome: 'in_attesa',
    nextAction: 'Richiamare lunedì se non invia la ricevuta della prenotazione',
    nextContactDate: '2026-08-03',
    templateCategory: 'certificato_medico',
    messageSent: 'Gentile Laura, ti ricordiamo che il certificato scadrà breve. Ti invitiamo ad inviare la copia aggiornata.',
    createdAt: '2026-07-27T15:15:00Z',
    updatedAt: '2026-07-27T15:15:00Z',
  },
  {
    id: 'comm-3',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    athletePhone: '+393281122334',
    athleteEmail: 'giuseppe.verdi@email.com',
    date: '2026-07-25',
    time: '10:00',
    channel: 'telefonata',
    author: 'Coach Elena',
    subject: 'Discussione rinnovo trimestrale personal coaching',
    summary: 'Colloquio telefonico sui progressi. Giuseppe è interessato a rinnovare aggiungendo la consulenza nutrizionale.',
    outcome: 'da_ricontattare',
    nextAction: 'Inviare preventivo rinnovo pacchetto Gold',
    nextContactDate: '2026-07-30',
    templateCategory: 'rinnovo',
    messageSent: 'Accordo verbale su proposta rinnovo.',
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z',
  },
  {
    id: 'comm-4',
    athleteId: 'ath-4',
    athleteName: 'Andrea Conti',
    athletePhone: '+393475566778',
    athleteEmail: 'andrea.conti@email.com',
    date: '2026-07-20',
    time: '18:45',
    channel: 'incontro',
    author: 'Salvatore Carotenuto',
    subject: 'Incontro de visu al box su preparazione gara',
    summary: 'Riconfermate le pose obbligatorie e la pianificazione di picco carboidrati in vista delle selezioni regionali.',
    outcome: 'completato',
    nextAction: 'Inviare riepilogo integrazione via Telegram',
    nextContactDate: '2026-08-01',
    templateCategory: 'benvenuto',
    createdAt: '2026-07-20T18:45:00Z',
    updatedAt: '2026-07-20T18:45:00Z',
  },
];

const DEFAULT_API_CONFIG: ApiIntegrationConfig = {
  whatsappEnabled: false,
  whatsappPhoneNumberId: '',
  whatsappAccessToken: '',
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  emailEnabled: false,
  smtpHost: 'smtp.gymmanager.com',
  smtpPort: 587,
  smtpUser: 'notifiche@gymmanager.com',
  webhookUrl: 'https://api.gymmanager.com/v1/webhooks/communications',
  webhookSecret: 'whsec_9a8b7c6d5e4f3a2b1c0d',
};

export const CommunicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [communications, setCommunications] = useState<CommunicationLog[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_COMMUNICATIONS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored communications', e);
      }
    }
    return INITIAL_COMMUNICATIONS;
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored templates', e);
      }
    }
    return DEFAULT_TEMPLATES;
  });

  const [apiConfig, setApiConfig] = useState<ApiIntegrationConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_API_CONFIG);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored API config', e);
      }
    }
    return DEFAULT_API_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMMUNICATIONS, JSON.stringify(communications));
  }, [communications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_API_CONFIG, JSON.stringify(apiConfig));
  }, [apiConfig]);

  const addCommunication = async (data: Omit<CommunicationLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLog: CommunicationLog = {
      ...data,
      id: `comm-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setCommunications((prev) => [newLog, ...prev]);
    showToast('Comunicazione registrata con successo', 'success');
  };

  const updateCommunication = async (id: string, updates: Partial<CommunicationLog>) => {
    const now = new Date().toISOString();
    setCommunications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c))
    );
    showToast('Comunicazione aggiornata', 'success');
  };

  const deleteCommunication = async (id: string) => {
    setCommunications((prev) => prev.filter((c) => c.id !== id));
    showToast('Comunicazione eliminata', 'info');
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    const now = new Date().toISOString();
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );
    showToast('Modello di messaggio salvato', 'success');
  };

  const resetTemplatesToDefault = () => {
    setTemplates(DEFAULT_TEMPLATES);
    localStorage.removeItem(STORAGE_KEY_TEMPLATES);
    showToast('Modelli ripristinati alle impostazioni predefinite', 'info');
  };

  const updateApiConfig = async (updates: Partial<ApiIntegrationConfig>) => {
    setApiConfig((prev) => ({ ...prev, ...updates }));
    showToast('Configurazione API & Webhook aggiornata', 'success');
  };

  const renderTemplateText = (template: MessageTemplate, variables: Record<string, string>) => {
    let subject = template.subjectTemplate;
    let body = template.bodyTemplate;

    Object.entries(variables).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(regex, val || '');
      body = body.replace(regex, val || '');
    });

    return { subject, body };
  };

  const openWhatsApp = (phone: string, text: string) => {
    if (!phone) {
      showToast('Numero di telefono non presente per questo atleta', 'error');
      return;
    }
    // Clean phone number (keep only digits and optional leading +)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Apertura WhatsApp in corso...', 'info');
  };

  const openTelegram = (phoneOrUser: string, text: string) => {
    const encodedText = encodeURIComponent(text);
    let tgUrl = `https://t.me/share/url?url=&text=${encodedText}`;
    if (phoneOrUser && phoneOrUser.startsWith('@')) {
      tgUrl = `https://t.me/${phoneOrUser.replace('@', '')}`;
    }
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
    showToast('Apertura Telegram in corso...', 'info');
  };

  const openEmail = (email: string, subject: string, body: string) => {
    if (!email) {
      showToast('Indirizzo Email non presente per questo atleta', 'error');
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    showToast('Apertura client Email predefinito...', 'info');
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast('Testo copiato negli appunti!', 'success');
        return true;
      } else {
        // Fallback for iframe restrictions
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Testo copiato negli appunti!', 'success');
        return true;
      }
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      showToast('Impossibile copiare automaticamente. Seleziona e copia manualmente.', 'warning');
      return false;
    }
  };

  return (
    <CommunicationsContext.Provider
      value={{
        communications,
        templates,
        apiConfig,
        addCommunication,
        updateCommunication,
        deleteCommunication,
        updateTemplate,
        resetTemplatesToDefault,
        updateApiConfig,
        renderTemplateText,
        openWhatsApp,
        openTelegram,
        openEmail,
        copyToClipboard,
      }}
    >
      {children}
    </CommunicationsContext.Provider>
  );
};

export const useCommunications = () => {
  const context = useContext(CommunicationsContext);
  if (!context) {
    throw new Error('useCommunications must be used within a CommunicationsProvider');
  }
  return context;
};
