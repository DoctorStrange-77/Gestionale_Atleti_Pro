export type NavigationTab =
  | 'dashboard'
  | 'atleti'
  | 'pacchetti'
  | 'abbonamenti'
  | 'pagamenti'
  | 'scadenze'
  | 'rinnovi'
  | 'attivita'
  | 'calendario'
  | 'documenti'
  | 'comunicazioni'
  | 'report'
  | 'collaboratori'
  | 'impostazioni'
  | 'atleta_portale';

export interface NavItem {
  id: NavigationTab;
  label: string;
  iconName: string;
  badge?: number | string;
  badgeType?: 'gold' | 'red' | 'gray';
  allowedRoles?: UserRole[];
}

export type UserRole =
  | 'proprietario'
  | 'amministratore'
  | 'coach'
  | 'segreteria'
  | 'atleta';

export interface RoleDefinition {
  code: UserRole;
  name: string;
  description: string;
  permissionsSummary: string[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  vatNumber?: string;
  fiscalCode?: string;
  logoUrl?: string;
  createdAt: string;
  settings: {
    coachFinancialsDefault: boolean;
    currency: string;
  };
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  roleCode: UserRole;
  canViewFinancials: boolean;
  status: 'active' | 'invited' | 'suspended';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId: string;
  organizationName: string;
  canViewFinancials: boolean;
  organizations?: Organization[];
}

export interface LocalOwnerProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  organizationName?: string;
  role: 'proprietario';
  createdAt: string;
  updatedAt: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url?: string;
  error?: string | null;
}

// ----------------------------------------------------------------------
// ATHLETE MANAGEMENT TYPES
// ----------------------------------------------------------------------

export type AthleteStatus =
  | 'potenziale_cliente'
  | 'prova'
  | 'onboarding'
  | 'attivo'
  | 'sospeso'
  | 'in_pausa'
  | 'moroso'
  | 'in_scadenza'
  | 'non_rinnovato'
  | 'inattivo'
  | 'archiviato';

export type AthletePaymentStatus =
  | 'regolare'
  | 'in_scadenza'
  | 'scaduto'
  | 'in_attesa'
  | 'moroso'
  | 'pagamento imminente'
  | 'pagamento parziale'
  | 'pagamento scaduto'
  | 'più pagamenti scaduti'
  | 'nessun pagamento programmato';

export type ContactChannel = 'whatsapp' | 'email' | 'telefono' | 'sms';

export type AcquisitionSource =
  | 'social'
  | 'passaparola'
  | 'sito_web'
  | 'pubblicita'
  | 'altro';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface Athlete {
  id: string;
  organizationId: string;
  avatarUrl?: string;
  firstName: string; // nome
  lastName: string; // cognome
  birthDate?: string; // data di nascita
  gender?: 'M' | 'F' | 'Altro'; // sesso
  phone: string; // telefono
  email: string; // email
  address?: string; // indirizzo
  city?: string; // città
  province?: string; // provincia
  profession?: string; // professione
  emergencyContact?: EmergencyContact; // contatto di emergenza
  preferredChannel?: ContactChannel; // canale di contatto preferito
  joinDate: string; // data di ingresso
  acquisitionSource?: AcquisitionSource; // fonte di acquisizione
  assignedCoachId?: string; // coach assegnato ID
  assignedCoachName?: string; // coach assegnato Nome
  goal?: string; // obiettivo
  discipline?: string; // disciplina
  status: AthleteStatus; // stato
  activePackage?: string; // pacchetto attivo
  expirationDate?: string; // data di scadenza
  paymentStatus: AthletePaymentStatus; // situazione dei pagamenti
  notes?: string; // note
  labels: string[]; // etichette
  medicalCertificateExpiry?: string;
  fiscalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteFormData {
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Altro';
  phone: string;
  email: string;
  address?: string;
  city?: string;
  province?: string;
  profession?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredChannel?: ContactChannel;
  joinDate: string;
  acquisitionSource?: AcquisitionSource;
  assignedCoachId?: string;
  assignedCoachName?: string;
  goal?: string;
  discipline?: string;
  status: AthleteStatus;
  activePackage?: string;
  expirationDate?: string;
  paymentStatus?: AthletePaymentStatus;
  notes?: string;
  labels: string[];
}

// ----------------------------------------------------------------------
// ATHLETE DETAILED SUB-ENTITIES
// ----------------------------------------------------------------------

export type NoteCategory = 'generali' | 'amministrative' | 'tecniche' | 'riservate';
export type VisibilityLevel = 'tutti' | 'segreteria_admin' | 'coach_admin' | 'riservato_direzione';

export interface AthleteNote {
  id: string;
  athleteId: string;
  authorName: string;
  authorRole: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: NoteCategory;
  text: string;
  visibilityLevel: VisibilityLevel;
  createdAt: string;
}

export type TimelineEventType =
  | 'creazione'
  | 'modifica_stato'
  | 'assegnazione_coach'
  | 'acquisto_pacchetto'
  | 'rinnovo'
  | 'pagamento'
  | 'sospensione'
  | 'caricamento_documento'
  | 'comunicazione'
  | 'nota'
  | 'attivita_completata';

export interface TimelineEvent {
  id: string;
  athleteId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  authorName: string;
  date: string;
  time: string;
  createdAt: string;
}

export type SubscriptionStatus =
  | 'bozza'
  | 'futuro'
  | 'attivo'
  | 'in_scadenza'
  | 'sospeso'
  | 'scaduto'
  | 'annullato'
  | 'rinnovato';

export type PreferredPaymentMethod =
  | 'carta'
  | 'bonifico'
  | 'contanti'
  | 'rid_sepa'
  | 'pos'
  | 'paypal'
  | 'altro';

export interface SubscriptionInstallment {
  id: string;
  subscriptionId?: string;
  number: number;
  label: string;
  dueDate: string;
  amount: number;
  status: 'pagato' | 'in_attesa' | 'in_scadenza' | 'scaduto' | 'parziale';
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: PreferredPaymentMethod;
  receiptNumber?: string;
  notes?: string;
}

export interface AthleteSubscription {
  id: string;
  athleteId: string;
  athleteName?: string;
  packageId?: string;
  packageName: string;
  startDate: string;
  durationValue: number;
  durationUnit: PackageDurationUnit;
  durationCustomText?: string;
  endDate: string;
  isCustomEndDate?: boolean;
  listPrice: number;
  discountFixed: number;
  discountPercent: number;
  agreedPrice: number;
  paymentFrequency: PaymentFrequency;
  installmentCount: number;
  downPayment: number;
  firstInstallmentDate: string;
  preferredPaymentMethod: PreferredPaymentMethod;
  renewalType: 'automatico' | 'manuale';
  gracePeriodDays: number;
  status: SubscriptionStatus;
  notes?: string;
  installments: SubscriptionInstallment[];
  previousSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AthletePayment {
  id: string;
  athleteId: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pagato' | 'in_scadenza' | 'scaduto' | 'moroso' | 'in_attesa';
  method?: 'contanti' | 'carta' | 'bonifico' | 'pos' | 'sdd';
  receiptNumber?: string;
}

export interface AthleteDocument {
  id: string;
  athleteId: string;
  athleteName?: string;
  title: string;
  type?: 'certificato_medico' | 'privacy' | 'regolamento' | 'carta_identita' | 'anamnesi' | 'altro' | string;
  category?: DocumentCategory;
  expiryDate?: string;
  status?: 'valido' | 'in_scadenza' | 'scaduto' | 'mancante' | string;
  fileUrl?: string;
  uploadedAt?: string;
  file?: StoredFile;
  uploadDate?: string;
  author?: string;
  authorRole?: string;
  visibility?: DocumentVisibility;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AthleteActivity {
  id: string;
  athleteId: string;
  title: string;
  dueDate: string;
  assignedToName: string;
  completed: boolean;
  completedAt?: string;
  category: 'chiamata' | 'scheda' | 'amministrazione' | 'check' | 'altro';
}

export interface AthleteCommunication {
  id: string;
  athleteId: string;
  channel: ContactChannel;
  subject: string;
  message: string;
  sentBy: string;
  date: string;
  time: string;
  status: 'inviato' | 'consegnato' | 'letto' | 'fallito';
}

// ----------------------------------------------------------------------
// PACKAGES TYPES
// ----------------------------------------------------------------------

export type PackageDurationUnit =
  | 'mensile'
  | 'bimestrale'
  | 'trimestrale'
  | 'quadrimestrale'
  | 'semestrale'
  | 'annuale'
  | 'personalizzata'
  | 'servizio_singolo'
  | 'numero_consulenze'
  | 'numero_checkin';

export type PaymentFrequency =
  | 'unica_soluzione'
  | 'mensile'
  | 'bimestrale'
  | 'trimestrale'
  | 'quadrimestrale'
  | 'semestrale'
  | 'personalizzata';

export type DiscountType = 'nessuno' | 'percentuale' | 'fisso';

export interface PackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  durationValue: number;
  durationUnit: PackageDurationUnit;
  durationCustomText?: string;
  paymentFrequency: PaymentFrequency;
  installmentCount: number;
  includedServices: string[];
  renewalType: 'automatico' | 'manuale';
  canBeSuspended: boolean;
  maxSuspensionPeriod: string;
  initialFee: number;
  discountType: DiscountType;
  discountValue: number;
  status: 'attivo' | 'disattivato';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod =
  | 'contanti'
  | 'bonifico'
  | 'carta'
  | 'PayPal'
  | 'Stripe'
  | 'addebito automatico'
  | 'assegno'
  | 'altro';

export type PaymentStatus =
  | 'programmato'
  | 'in scadenza'
  | 'da pagare'
  | 'pagato'
  | 'pagato parzialmente'
  | 'scaduto'
  | 'sollecitato'
  | 'fallito'
  | 'annullato'
  | 'rimborsato'
  | 'parzialmente rimborsato';

export interface PaymentRecord {
  id: string;
  atletaId: string;
  atletaNome: string;
  abbonamentoId?: string;
  abbonamentoNome?: string;
  importoPrevisto: number;
  importoPagato: number;
  importoRimborsato?: number;
  importoResiduo: number; // calculated: importoPrevisto - importoPagato
  dataDiScadenza: string; // YYYY-MM-DD
  suspendedFrom?: string; // YYYY-MM-DD, inizio sospensione programmata
  suspendedUntil?: string; // YYYY-MM-DD, rata esclusa dalle scadenze fino a questa data inclusa
  dataDelPagamento?: string; // YYYY-MM-DD
  numeroDellaRata?: string; // e.g. "Rata 1 di 12", "Acconto", "Quota Unica"
  metodoDiPagamento?: PaymentMethod;
  stato: PaymentStatus;
  riferimentoTransazione?: string;
  numeroRicevuta?: string;
  riferimentoFattura?: string;
  note?: string;
  allegato?: string; // file name or base64/URL
  utenteCheHaRegistrato?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAuditLog {
  id: string;
  pagamentoId: string;
  atletaId: string;
  atletaNome: string;
  abbonamentoNome?: string;
  azione: string;
  valorePrecedente: string;
  nuovoValore: string;
  autore: string;
  data: string; // YYYY-MM-DD
  ora: string; // HH:mm:ss
  createdAt: string;
}

// ----------------------------------------------------------------------
// RENEWALS & PAUSES TYPES
// ----------------------------------------------------------------------

export type RenewalStatus =
  | 'da contattare'
  | 'contattato'
  | 'interessato'
  | 'in valutazione'
  | 'confermato'
  | 'rinnovato'
  | 'non rinnovato'
  | 'irraggiungibile'
  | 'rinviato';

export interface AthleteRenewal {
  id: string;
  athleteId: string;
  athleteName: string;
  subscriptionId?: string;
  currentPackageName: string;
  price: number;
  coachName?: string;
  endDate: string;
  daysRemaining: number;
  paymentStatus: AthletePaymentStatus;
  lastCommunicationDate?: string;
  lastCommunicationNote?: string;
  nextAction?: string;
  nextActionDate?: string;
  responsibleName?: string;
  status: RenewalStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PauseExpiryOption = 'proroga' | 'invariata';
export type PauseInstallmentsOption = 'sospendi' | 'attive' | 'riprogramma';

export interface SubscriptionPause {
  id: string;
  subscriptionId: string;
  athleteId: string;
  athleteName: string;
  startDate: string; // YYYY-MM-DD
  expectedEndDate: string; // YYYY-MM-DD
  actualEndDate?: string; // YYYY-MM-DD
  reason: string; // Motivazione
  pauseDays: number;
  authorization: string; // Autorizzato da
  notes?: string;
  expiryOption: PauseExpiryOption;
  installmentsOption: PauseInstallmentsOption;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// TASKS / ATTIVITÀ TYPES
// ----------------------------------------------------------------------
export type TaskPriority = 'bassa' | 'normale' | 'alta' | 'urgente';

export type TaskStatus =
  | 'da fare'
  | 'in lavorazione'
  | 'in attesa'
  | 'completata'
  | 'annullata'
  | 'scaduta';

export interface Task {
  id: string;
  title: string;
  description: string;
  athleteId?: string;
  athleteName?: string;
  responsible: string; // Coach / Responsabile
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  category: string;
  reminder?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// CALENDAR & EVENTS TYPES
// ----------------------------------------------------------------------
export type CalendarEventType =
  | 'pagamenti'
  | 'rinnovi'
  | 'fine abbonamento'
  | 'inizio abbonamento'
  | 'appuntamenti'
  | 'check-in'
  | 'programmi da consegnare'
  | 'certificati medici'
  | 'documenti'
  | 'gare'
  | 'eventi'
  | 'compleanni';

export type CalendarEventStatus = 'in programma' | 'completato' | 'scaduto' | 'in attesa' | 'annullato';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  athleteId?: string;
  athleteName?: string;
  coachId?: string;
  coachName?: string;
  status: CalendarEventStatus;
  location?: string;
  notes?: string;
  isSystemGenerated?: boolean;
  linkUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// DOCUMENTI & CONSENSI TYPES (SUPABASE STORAGE INTEGRATION)
// ----------------------------------------------------------------------

export type DocumentCategory =
  | 'contratto'
  | 'consenso privacy'
  | 'certificato medico'
  | 'ricevuta'
  | 'fattura'
  | 'questionario'
  | 'fotografia'
  | 'PDF'
  | 'altro';

export type DocumentVisibility = 'pubblico' | 'riservato' | 'atleta_coach' | 'solo_staff';

export interface StoredFile {
  name: string;
  size: number; // in bytes
  mimeType: string;
  url: string; // Blob or Data URL or Supabase Storage public/signed URL
  bucket: string; // 'documents' | 'consents' | 'medical'
  path: string; // e.g., 'athletes/ath-1/contratto_marco_rossi.pdf'
}

export type ConsentType =
  | 'Privacy GDPR & Trattamento Dati'
  | 'Uso Immagini & Materiale Fotografico'
  | 'Liberatoria Responsabilità & Regolamento Box'
  | 'Consenso Certificato Medico Agonistico'
  | 'Consenso Minorenni / Tutore Legale'
  | 'Altro Consenso';

export type ConsentStatus = 'attivo' | 'in attesa' | 'revocato' | 'scaduto';

export interface AthleteConsent {
  id: string;
  athleteId: string;
  athleteName: string;
  consentType: ConsentType | string;
  date: string; // YYYY-MM-DD
  status: ConsentStatus;
  linkedDocumentId?: string;
  linkedDocumentTitle?: string;
  isRevoked?: boolean;
  revocationDate?: string;
  revocationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentAlertType =
  | 'documento_mancante'
  | 'documento_in_scadenza'
  | 'certificato_scaduto'
  | 'consenso_mancante';

export interface DocumentAlert {
  id: string;
  type: DocumentAlertType;
  severity: 'critico' | 'warning' | 'info';
  athleteId: string;
  athleteName: string;
  title: string;
  description: string;
  documentCategory?: DocumentCategory;
  dueDate?: string;
  actionLabel?: string;
}

// ----------------------------------------------------------------------
// COMUNICAZIONI & MESSAGGI TYPES
// ----------------------------------------------------------------------

export type CommunicationChannel =
  | 'telefonata'
  | 'email'
  | 'WhatsApp'
  | 'Telegram'
  | 'Instagram'
  | 'incontro'
  | 'videochiamata'
  | 'altro';

export type CommunicationOutcome =
  | 'positivo'
  | 'in_attesa'
  | 'da_ricontattare'
  | 'nessuna_risposta'
  | 'completato'
  | 'negativo';

export type MessageTemplateCategory =
  | 'benvenuto'
  | 'pagamento_in_scadenza'
  | 'pagamento_scaduto'
  | 'abbonamento_in_scadenza'
  | 'rinnovo'
  | 'documento_mancante'
  | 'certificato_medico'
  | 'checkin_non_completato'
  | 'ringraziamento_pagamento'
  | 'recupero_inattivo';

export interface MessageTemplate {
  id: string;
  category: MessageTemplateCategory;
  title: string;
  description: string;
  defaultChannel: CommunicationChannel;
  subjectTemplate: string;
  bodyTemplate: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  athleteId: string;
  athleteName: string;
  athletePhone?: string;
  athleteEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  channel: CommunicationChannel;
  author: string; // Autore
  subject: string; // Oggetto
  summary: string; // Riepilogo
  outcome: CommunicationOutcome; // Esito
  nextAction?: string; // Prossima azione
  nextContactDate?: string; // Data del prossimo contatto (YYYY-MM-DD)
  templateCategory?: MessageTemplateCategory | string;
  messageSent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalInvoice {
  id: string;
  numeroFattura: string;
  dataFattura: string;
  riferimento: string;
  documentoAllegato?: string;
  softwareEsterno: 'Fatture in Cloud' | 'Aruba Fatturazione' | 'Namirial' | 'Danea Easyfatt' | 'Agenzia delle Entrate' | 'Altro' | string;
  importo?: number;
  atletaId?: string;
  atletaNome?: string;
  paymentId?: string;
  note?: string;
  createdAt: string;
}

export interface SavedReportFilter {
  id: string;
  name: string;
  dateFilter: string;
  customStartDate?: string;
  customEndDate?: string;
  athleteId?: string;
  coachName?: string;
  packageName?: string;
  paymentMethod?: string;
  status?: string;
  serviceType?: string;
  comparePeriod?: boolean;
  createdAt: string;
}

export interface ApiIntegrationConfig {
  whatsappEnabled: boolean;
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  webhookUrl: string;
  webhookSecret: string;
}

export interface PaymentMethodSetting {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  notes?: string;
}

export interface CustomLabelTag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface MessageTemplateSetting {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms' | 'app';
  category: string;
  subject?: string;
  body: string;
}

export interface ReminderRules {
  expiryNoticeDays: number[];
  overdueNoticeDays: number[];
  autoSendWhatsapp: boolean;
  autoSendEmail: boolean;
}

export interface PrivacySettings {
  privacyPolicyText: string;
  consentRetentionMonths: number;
  requireMedicalCertificateConsent: boolean;
  gdprContactEmail: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface OrganizationSettings {
  businessName: string;
  legalName: string;
  vatNumber: string;
  fiscalCode: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
  paymentMethods: PaymentMethodSetting[];
  taskCategories: string[];
  tags: CustomLabelTag[];
  reminderRules: ReminderRules;
  messageTemplates: MessageTemplateSetting[];
  privacy: PrivacySettings;
  apiIntegrations: ApiIntegrationConfig;
}









