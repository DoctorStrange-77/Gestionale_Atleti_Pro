import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Activity,
  MessageSquare,
  Plus,
  Edit2,
  Lock,
  ArrowLeft,
  RefreshCw,
  Send,
  Trash2,
  Download,
  ExternalLink,
  Filter,
  Search,
  Tag,
  Eye,
  EyeOff,
  FileCheck,
  CheckSquare,
  Square,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Sparkles,
  Building2,
  Receipt,
  Share2,
} from 'lucide-react';
import {
  Athlete,
  AthleteStatus,
  PaymentStatus,
  AthleteNote,
  TimelineEvent,
  AthleteSubscription,
  AthletePayment,
  AthleteDocument,
  AthleteActivity,
  AthleteCommunication,
  NoteCategory,
  VisibilityLevel,
  TimelineEventType,
  ContactChannel,
  AcquisitionSource,
} from '../types';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentsContext';
import { useToast } from '../context/ToastContext';
import { canViewTechnicalNotes } from '../lib/permissions';
import { ATHLETE_STATUS_MAP, PAYMENT_STATUS_MAP } from '../lib/athleteHelpers';

export type TabKey =
  | 'riepilogo'
  | 'dati_personali'
  | 'abbonamenti'
  | 'pagamenti'
  | 'documenti'
  | 'attivita'
  | 'comunicazioni'
  | 'note'
  | 'cronologia';

interface AthleteDetailPageProps {
  athleteId: string;
  onBack: () => void;
  initialTab?: TabKey;
}

export const AthleteDetailPage: React.FC<AthleteDetailPageProps> = ({
  athleteId,
  onBack,
  initialTab = 'riepilogo',
}) => {
  const { athletes, updateAthlete, updateAthleteStatus } = useAthletes();
  const { user, members } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { openQuickRegisterModal } = usePayments();

  const athlete = useMemo(() => athletes.find((a) => a.id === athleteId), [athletes, athleteId]);

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // local persistent state keys for sub-entities
  const storagePrefix = `b_athlete_detail_${athleteId}`;

  // --------------------------------------------------------------------------
  // MOCK SUB-ENTITIES INITIALIZATION
  // --------------------------------------------------------------------------
  const [notes, setNotes] = useState<AthleteNote[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_notes`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return [
      {
        id: `note-1`,
        athleteId,
        authorName: user?.fullName || 'Proprietario',
        authorRole: 'proprietario',
        date: '2026-07-20',
        time: '11:30',
        category: 'generali',
        text: 'Atleta molto motivato. Ha confermato disponibilità per allenarsi 4 volte a settimana.',
        visibilityLevel: 'tutti',
        createdAt: '2026-07-20T11:30:00.000Z',
      },
      {
        id: `note-2`,
        athleteId,
        authorName: 'Luca Bianchi (Coach)',
        authorRole: 'coach',
        date: '2026-07-22',
        time: '14:15',
        category: 'tecniche',
        text: 'Scheda Tecnica: Squat 3x5 @ 140kg con fermo in buca. Lieve valgismo dinamico del ginocchio sinistro sotto carico elevato. Applicati elastici per abduzione.',
        visibilityLevel: 'coach_admin',
        createdAt: '2026-07-22T14:15:00.000Z',
      },
      {
        id: `note-3`,
        athleteId,
        authorName: 'Segreteria',
        authorRole: 'segreteria',
        date: '2026-07-25',
        time: '09:45',
        category: 'amministrative',
        text: 'Richiesta ricevuta fiscale intestata a P.IVA per detrazione sportiva.',
        visibilityLevel: 'segreteria_admin',
        createdAt: '2026-07-25T09:45:00.000Z',
      },
      {
        id: `note-4`,
        athleteId,
        authorName: user?.fullName || 'Proprietario',
        authorRole: 'proprietario',
        date: '2026-07-26',
        time: '18:00',
        category: 'riservate',
        text: 'Note Riservate Direzione: Accordo speciale sconto 10% per rinnovo anticipato concordato verbalmente.',
        visibilityLevel: 'riservato_direzione',
        createdAt: '2026-07-26T18:00:00.000Z',
      },
    ];
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_timeline`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return [
      {
        id: 'evt-1',
        athleteId,
        type: 'creazione',
        title: 'Creazione Scheda Atleta',
        description: 'Registrazione anagrafica iniziale e creazione profilo',
        authorName: 'Segreteria',
        date: '2024-01-15',
        time: '09:00',
        createdAt: '2024-01-15T09:00:00.000Z',
      },
      {
        id: 'evt-2',
        athleteId,
        type: 'assegnazione_coach',
        title: 'Assegnazione Coach',
        description: `Assegnato il coach ${user?.fullName || 'Proprietario'}`,
        authorName: 'Amministratore',
        date: '2024-01-15',
        time: '09:15',
        createdAt: '2024-01-15T09:15:00.000Z',
      },
      {
        id: 'evt-3',
        athleteId,
        type: 'acquisto_pacchetto',
        title: 'Acquisto Pacchetto',
        description: `Attivato pacchetto "${athlete?.activePackage || 'Annuale Gold'}"`,
        authorName: 'Segreteria',
        date: '2024-01-15',
        time: '10:00',
        createdAt: '2024-01-15T10:00:00.000Z',
      },
      {
        id: 'evt-4',
        athleteId,
        type: 'pagamento',
        title: 'Pagamento Ricevuto',
        description: 'Incassata prima rata abbonamento (€150,00 - Bonifico)',
        authorName: 'Segreteria',
        date: '2024-01-15',
        time: '10:05',
        createdAt: '2024-01-15T10:05:00.000Z',
      },
      {
        id: 'evt-5',
        athleteId,
        type: 'caricamento_documento',
        title: 'Documento Caricato',
        description: 'Caricato Certificato Medico Agonistico con scadenza a Novembre 2026',
        authorName: 'Segreteria',
        date: '2024-01-18',
        time: '16:20',
        createdAt: '2024-01-18T16:20:00.000Z',
      },
      {
        id: 'evt-6',
        athleteId,
        type: 'modifica_stato',
        title: 'Modifica Stato',
        description: 'Stato aggiornato in ATTIVO',
        authorName: user?.fullName || 'Proprietario',
        date: '2024-01-20',
        time: '11:00',
        createdAt: '2024-01-20T11:00:00.000Z',
      },
    ];
  });

  const [subscriptions, setSubscriptions] = useState<AthleteSubscription[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_subscriptions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'sub-1',
        athleteId,
        packageName: athlete?.activePackage || 'Abbonamento Annuale Gold Power',
        startDate: '2025-12-01',
        durationValue: 12,
        durationUnit: 'mensile',
        endDate: athlete?.expirationDate || '2026-11-30',
        listPrice: 780,
        discountFixed: 0,
        discountPercent: 0,
        agreedPrice: 780,
        status: 'attivo',
        paymentFrequency: 'trimestrale',
        installmentCount: 4,
        downPayment: 0,
        firstInstallmentDate: '2025-12-01',
        preferredPaymentMethod: 'bonifico',
        renewalType: 'manuale',
        gracePeriodDays: 10,
        notes: 'Accesso completo + schede di allenamento mensili',
        installments: [],
        createdAt: '2025-12-01T09:00:00.000Z',
        updatedAt: '2025-12-01T09:00:00.000Z',
      },
      {
        id: 'sub-2',
        athleteId,
        packageName: 'Pacchetto Trimestrale Invernale',
        startDate: '2024-09-01',
        durationValue: 3,
        durationUnit: 'mensile',
        endDate: '2024-11-30',
        listPrice: 240,
        discountFixed: 0,
        discountPercent: 0,
        agreedPrice: 240,
        status: 'scaduto',
        paymentFrequency: 'unica_soluzione',
        installmentCount: 1,
        downPayment: 0,
        firstInstallmentDate: '2024-09-01',
        preferredPaymentMethod: 'contanti',
        renewalType: 'manuale',
        gracePeriodDays: 5,
        notes: 'Completato regolarmente',
        installments: [],
        createdAt: '2024-09-01T09:00:00.000Z',
        updatedAt: '2024-09-01T09:00:00.000Z',
      },
    ];
  });

  const [payments, setPayments] = useState<AthletePayment[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_payments`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'pay-1',
        athleteId,
        description: 'Rata 1/4 - Abbonamento Annuale Gold',
        amount: 195,
        dueDate: '2025-12-01',
        paidDate: '2025-12-01',
        status: 'pagato',
        method: 'bonifico',
        receiptNumber: 'REC-2025-0891',
      },
      {
        id: 'pay-2',
        athleteId,
        description: 'Rata 2/4 - Abbonamento Annuale Gold',
        amount: 195,
        dueDate: '2026-03-01',
        paidDate: '2026-03-02',
        status: 'pagato',
        method: 'carta',
        receiptNumber: 'REC-2026-0112',
      },
      {
        id: 'pay-3',
        athleteId,
        description: 'Rata 3/4 - Abbonamento Annuale Gold',
        amount: 195,
        dueDate: '2026-06-01',
        paidDate: '2026-06-05',
        status: 'pagato',
        method: 'pos',
        receiptNumber: 'REC-2026-0422',
      },
      {
        id: 'pay-4',
        athleteId,
        description: 'Rata 4/4 - Prossimo Saldo Finale',
        amount: 195,
        dueDate: '2026-09-01',
        status: athlete?.paymentStatus === 'moroso' ? 'moroso' : athlete?.paymentStatus === 'in_scadenza' ? 'in_scadenza' : 'in_attesa',
      },
    ];
  });

  const [documents, setDocuments] = useState<AthleteDocument[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_documents`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'doc-1',
        athleteId,
        title: 'Certificato Medico Agonistico',
        type: 'certificato_medico',
        expiryDate: athlete?.medicalCertificateExpiry || '2026-11-30',
        status: 'valido',
        fileUrl: '#',
        uploadedAt: '2024-01-18',
      },
      {
        id: 'doc-2',
        athleteId,
        title: 'Modulo Iscrizione & Consenso Privacy GDPR',
        type: 'privacy',
        status: 'valido',
        fileUrl: '#',
        uploadedAt: '2024-01-15',
      },
      {
        id: 'doc-3',
        athleteId,
        title: 'Regolamento Interno Firmato',
        type: 'regolamento',
        status: 'valido',
        fileUrl: '#',
        uploadedAt: '2024-01-15',
      },
      {
        id: 'doc-4',
        athleteId,
        title: 'Documento d\'Identità (CI)',
        type: 'carta_identita',
        expiryDate: '2028-05-14',
        status: 'valido',
        uploadedAt: '2024-01-15',
      },
      {
        id: 'doc-5',
        athleteId,
        title: 'Scheda Anamnesi Iniziale & Posturale',
        type: 'anamnesi',
        status: 'valido',
        uploadedAt: '2024-01-20',
      },
    ];
  });

  const [activities, setActivities] = useState<AthleteActivity[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_activities`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'act-1',
        athleteId,
        title: 'Aggiornamento scheda di allenamento Mesociclo 4',
        dueDate: '2026-08-05',
        assignedToName: athlete?.assignedCoachName || user?.fullName || 'Proprietario',
        completed: false,
        category: 'scheda',
      },
      {
        id: 'act-2',
        athleteId,
        title: 'Verifica saldo rata in scadenza',
        dueDate: '2026-08-10',
        assignedToName: 'Segreteria',
        completed: false,
        category: 'amministrazione',
      },
      {
        id: 'act-3',
        athleteId,
        title: 'Check telefonico motivazionale e feedback sensazioni',
        dueDate: '2026-07-18',
        assignedToName: athlete?.assignedCoachName || user?.fullName || 'Proprietario',
        completed: true,
        completedAt: '2026-07-18T15:30:00.000Z',
        category: 'chiamata',
      },
    ];
  });

  const [communications, setCommunications] = useState<AthleteCommunication[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_communications`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'com-1',
        athleteId,
        channel: 'whatsapp',
        subject: 'Promemoria Appuntamento Check',
        message: 'Ciao! Ti ricordiamo l\'appuntamento di domani per la misurazione plicometrica e il check mensile.',
        sentBy: 'Segreteria',
        date: '2026-07-17',
        time: '10:00',
        status: 'letto',
      },
      {
        id: 'com-2',
        athleteId,
        channel: 'email',
        subject: 'Invio Nuova Scheda di Allenamento',
        message: 'Gentile atleta, la tua nuova scheda personalizzata è pronta nella tua area riservata.',
        sentBy: 'Luca Bianchi (Coach)',
        date: '2026-06-30',
        time: '18:20',
        status: 'consegnato',
      },
    ];
  });

  // Persist local states
  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_notes`, JSON.stringify(notes));
  }, [notes, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_timeline`, JSON.stringify(timelineEvents));
  }, [timelineEvents, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_subscriptions`, JSON.stringify(subscriptions));
  }, [subscriptions, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_payments`, JSON.stringify(payments));
  }, [payments, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_documents`, JSON.stringify(documents));
  }, [documents, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_activities`, JSON.stringify(activities));
  }, [activities, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_communications`, JSON.stringify(communications));
  }, [communications, storagePrefix]);

  // Helper to log timeline dynamically
  const logTimelineEvent = (type: TimelineEventType, title: string, description: string) => {
    const now = new Date();
    const newEvt: TimelineEvent = {
      id: `evt-${Date.now()}`,
      athleteId,
      type,
      title,
      description,
      authorName: user?.fullName || 'Operatore',
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      createdAt: now.toISOString(),
    };
    setTimelineEvents((prev) => [newEvt, ...prev]);
  };

  if (!athlete) {
    return (
      <div className="p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Atleta Non Trovato</h2>
        <p className="text-zinc-400 text-sm">L'atleta richiesto non esiste o è stato rimosso.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all"
        >
          Torna all'Elenco Atleti
        </button>
      </div>
    );
  }

  const statusConfig = ATHLETE_STATUS_MAP[athlete.status] || ATHLETE_STATUS_MAP.attivo;
  const paymentConfig = PAYMENT_STATUS_MAP[athlete.paymentStatus] || PAYMENT_STATUS_MAP.regolare;

  // Modals & form state inside tabs
  // Personal data edit form
  const [personalFormData, setPersonalFormData] = useState({
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    birthDate: athlete.birthDate || '',
    gender: athlete.gender || 'M',
    phone: athlete.phone,
    email: athlete.email,
    fiscalCode: athlete.fiscalCode || '',
    address: athlete.address || '',
    city: athlete.city || '',
    province: athlete.province || '',
    profession: athlete.profession || '',
    emergencyContactName: athlete.emergencyContact?.name || '',
    emergencyContactPhone: athlete.emergencyContact?.phone || '',
    emergencyContactRelation: athlete.emergencyContact?.relation || '',
    preferredChannel: athlete.preferredChannel || 'whatsapp',
    joinDate: athlete.joinDate,
    acquisitionSource: athlete.acquisitionSource || 'social',
    assignedCoachId: athlete.assignedCoachId || '',
    assignedCoachName: athlete.assignedCoachName || '',
    goal: athlete.goal || '',
    discipline: athlete.discipline || '',
    notes: athlete.notes || '',
    labelsText: athlete.labels.join(', '),
  });

  const handleSavePersonalData = (e: React.FormEvent) => {
    e.preventDefault();
    const labels = personalFormData.labelsText
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    updateAthlete(athlete.id, {
      firstName: personalFormData.firstName,
      lastName: personalFormData.lastName,
      birthDate: personalFormData.birthDate,
      gender: personalFormData.gender as any,
      phone: personalFormData.phone,
      email: personalFormData.email,
      address: personalFormData.address,
      city: personalFormData.city,
      province: personalFormData.province,
      profession: personalFormData.profession,
      emergencyContactName: personalFormData.emergencyContactName,
      emergencyContactPhone: personalFormData.emergencyContactPhone,
      emergencyContactRelation: personalFormData.emergencyContactRelation,
      preferredChannel: personalFormData.preferredChannel as any,
      joinDate: personalFormData.joinDate,
      acquisitionSource: personalFormData.acquisitionSource as any,
      assignedCoachId: personalFormData.assignedCoachId,
      assignedCoachName: personalFormData.assignedCoachName,
      goal: personalFormData.goal,
      discipline: personalFormData.discipline,
      notes: personalFormData.notes,
      labels,
    });

    logTimelineEvent('creazione', 'Aggiornamento Dati Personali', 'Modificati i dati anagrafici e contatti');
    showSuccess('Salvato', 'Dati personali aggiornati con successo.');
  };

  // Add Note Modal / Form
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<NoteCategory>('generali');
  const [newNoteVisibility, setNewNoteVisibility] = useState<VisibilityLevel>('tutti');
  const [selectedNoteCategoryFilter, setSelectedNoteCategoryFilter] = useState<string>('all');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const now = new Date();
    const note: AthleteNote = {
      id: `note-${Date.now()}`,
      athleteId,
      authorName: user?.fullName || 'Operatore',
      authorRole: user?.role || 'admin',
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      category: newNoteCategory,
      text: newNoteText.trim(),
      visibilityLevel: newNoteVisibility,
      createdAt: now.toISOString(),
    };

    setNotes((prev) => [note, ...prev]);
    setNewNoteText('');
    logTimelineEvent('nota', `Nuova Nota (${newNoteCategory.toUpperCase()})`, note.text);
    showSuccess('Nota Aggiunta', 'La nota è stata registrata con successo.');
  };

  // Renew Package Modal state
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewPackageName, setRenewPackageName] = useState('Abbonamento Annuale Gold Power');
  const [renewPrice, setRenewPrice] = useState(780);
  const [renewDurationMonths, setRenewDurationMonths] = useState(12);

  const handleRenewPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const startDateStr = today.toISOString().slice(0, 10);
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + Number(renewDurationMonths));
    const expDateStr = expDate.toISOString().slice(0, 10);

    const newSub: AthleteSubscription = {
      id: `sub-${Date.now()}`,
      athleteId,
      packageName: renewPackageName,
      startDate: startDateStr,
      durationValue: Number(renewDurationMonths) || 1,
      durationUnit: 'mensile',
      endDate: expDateStr,
      listPrice: Number(renewPrice) || 0,
      discountFixed: 0,
      discountPercent: 0,
      agreedPrice: Number(renewPrice) || 0,
      paymentFrequency: renewDurationMonths >= 12 ? 'trimestrale' : 'unica_soluzione',
      installmentCount: 1,
      downPayment: 0,
      firstInstallmentDate: startDateStr,
      preferredPaymentMethod: 'bonifico',
      renewalType: 'manuale',
      gracePeriodDays: 10,
      status: 'attivo',
      notes: 'Rinnovo registrato dal portale',
      installments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    updateAthlete(athlete.id, {
      activePackage: renewPackageName,
      expirationDate: expDateStr,
      status: 'attivo',
      paymentStatus: 'regolare',
    });

    logTimelineEvent(
      'rinnovo',
      'Rinnovo Pacchetto / Abbonamento',
      `Attivato "${renewPackageName}" fino al ${expDateStr} (€${renewPrice})`
    );

    setIsRenewModalOpen(false);
    showSuccess('Pacchetto Rinnovato', `Nuovo pacchetto attivo fino al ${expDateStr}`);
  };

  // Add Payment Modal state
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [paymentDesc, setPaymentDesc] = useState('Saldo Rata Pacchetto');
  const [paymentAmount, setPaymentAmount] = useState(150);
  const [paymentDueDate, setPaymentDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'contanti' | 'carta' | 'bonifico' | 'pos' | 'sdd'>('pos');
  const [paymentReceipt, setPaymentReceipt] = useState(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().slice(0, 10);
    const newPay: AthletePayment = {
      id: `pay-${Date.now()}`,
      athleteId,
      description: paymentDesc,
      amount: Number(paymentAmount),
      dueDate: paymentDueDate,
      paidDate: todayStr,
      status: 'pagato',
      method: paymentMethod,
      receiptNumber: paymentReceipt,
    };

    setPayments((prev) => [newPay, ...prev]);
    updateAthlete(athlete.id, { paymentStatus: 'regolare' });
    logTimelineEvent(
      'pagamento',
      'Pagamento Registrato',
      `Incassati €${paymentAmount} (${paymentDesc}) via ${paymentMethod.toUpperCase()} - Ricevuta: ${paymentReceipt}`
    );

    setIsAddPaymentModalOpen(false);
    showSuccess('Pagamento Registrato', `Incassato importo di €${paymentAmount}`);
  };

  // Add Document Modal state
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('Certificato Medico Agonistico');
  const [docType, setDocType] = useState<AthleteDocument['type']>('certificato_medico');
  const [docExpiryDate, setDocExpiryDate] = useState('2027-12-31');

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: AthleteDocument = {
      id: `doc-${Date.now()}`,
      athleteId,
      title: docTitle,
      type: docType,
      expiryDate: docExpiryDate || undefined,
      status: 'valido',
      uploadedAt: new Date().toISOString().slice(0, 10),
      fileUrl: '#',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    if (docType === 'certificato_medico' && docExpiryDate) {
      updateAthlete(athlete.id, { medicalCertificateExpiry: docExpiryDate });
    }

    logTimelineEvent(
      'caricamento_documento',
      'Documento Caricato',
      `Caricato "${docTitle}" (${docType})`
    );

    setIsAddDocModalOpen(false);
    showSuccess('Documento Salvato', 'Documento aggiunto alla cartella dell\'atleta.');
  };

  // Add Activity Modal state
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actDueDate, setActDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [actCategory, setActCategory] = useState<AthleteActivity['category']>('scheda');

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    const newAct: AthleteActivity = {
      id: `act-${Date.now()}`,
      athleteId,
      title: actTitle.trim(),
      dueDate: actDueDate,
      assignedToName: athlete.assignedCoachName || user?.fullName || 'Coach',
      completed: false,
      category: actCategory,
    };

    setActivities((prev) => [newAct, ...prev]);
    setActTitle('');
    setIsAddActivityModalOpen(false);
    showSuccess('Attività Creata', 'Attività programmata per l\'atleta.');
  };

  const handleToggleActivity = (actId: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === actId) {
          const nextState = !a.completed;
          if (nextState) {
            logTimelineEvent('attivita_completata', 'Attività Completata', a.title);
          }
          return {
            ...a,
            completed: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return a;
      })
    );
  };

  // Add Communication Modal state
  const [isAddCommModalOpen, setIsAddCommModalOpen] = useState(false);
  const [commChannel, setCommChannel] = useState<ContactChannel>('whatsapp');
  const [commSubject, setCommSubject] = useState('Sollecito / Promemoria');
  const [commMessage, setCommMessage] = useState('');

  const handleSendCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commMessage.trim()) return;

    const now = new Date();
    const newComm: AthleteCommunication = {
      id: `com-${Date.now()}`,
      athleteId,
      channel: commChannel,
      subject: commSubject,
      message: commMessage.trim(),
      sentBy: user?.fullName || 'Operatore',
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      status: 'inviato',
    };

    setCommunications((prev) => [newComm, ...prev]);

    if (commChannel === 'whatsapp') {
      const cleanPhone = athlete.phone.replace(/[^0-9]/g, '');
      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(commMessage)}`,
        '_blank'
      );
    }

    logTimelineEvent(
      'comunicazione',
      `Comunicazione Inviata (${commChannel.toUpperCase()})`,
      `${commSubject}: "${commMessage}"`
    );

    setCommMessage('');
    setIsAddCommModalOpen(false);
    showSuccess('Comunicazione Registrata', 'Messaggio salvato nella cronologia comunicazioni.');
  };

  // Timeline Filter & Search state
  const [timelineFilterType, setTimelineFilterType] = useState<string>('all');
  const [timelineSearchQuery, setTimelineSearchQuery] = useState<string>('');

  const filteredTimeline = useMemo(() => {
    return timelineEvents.filter((evt) => {
      if (timelineFilterType !== 'all' && evt.type !== timelineFilterType) {
        return false;
      }
      if (timelineSearchQuery.trim()) {
        const q = timelineSearchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesAuthor = evt.authorName.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesAuthor;
      }
      return true;
    });
  }, [timelineEvents, timelineFilterType, timelineSearchQuery]);

  // Open activities preview
  const openActivities = activities.filter((a) => !a.completed);

  // Missing or expiring documents check
  const missingDocs = [
    ...documents.filter((d) => d.status === 'scaduto' || d.status === 'mancante'),
    ...(athlete.medicalCertificateExpiry && new Date(athlete.medicalCertificateExpiry) < new Date()
      ? [{ title: 'Certificato Medico Scaduto', status: 'scaduto' }]
      : []),
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Navigation Header Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna agli Atleti</span>
          </button>
          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Scheda Dettagliata Atleta</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-white font-bold">{athlete.firstName} {athlete.lastName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const phoneClean = athlete.phone.replace(/[^0-9]/g, '');
              window.open(
                `https://wa.me/${phoneClean}?text=Ciao%20${encodeURIComponent(athlete.firstName)},%20ti%20contatto%20da%20Doctor%20Strength`,
                '_blank'
              );
            }}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">WhatsApp Quick</span>
          </button>
          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rinnova Pacchetto</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={athlete.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={`${athlete.firstName} ${athlete.lastName}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/30 shadow-xl ring-4 ring-zinc-900/50"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 ${
                  athlete.status === 'attivo'
                    ? 'bg-emerald-500'
                    : athlete.status === 'moroso'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {athlete.firstName} {athlete.lastName}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${statusConfig.badgeColor}`}>
                    {statusConfig.label}
                  </span>
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${paymentConfig.badgeColor}`}>
                    {paymentConfig.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Coach: <strong className="text-zinc-200">{athlete.assignedCoachName || 'Non assegnato'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Disciplina: <strong className="text-zinc-200">{athlete.discipline || 'Generale'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ingresso: <strong className="text-zinc-200">{athlete.joinDate}</strong></span>
                </div>
              </div>

              {athlete.labels.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {athlete.labels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 rounded-md text-[11px] font-medium flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-amber-400" />
                      {lbl}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap lg:self-center">
            <select
              value={athlete.status}
              onChange={(e) => {
                const newSt = e.target.value as AthleteStatus;
                updateAthleteStatus(athlete.id, newSt);
                logTimelineEvent('modifica_stato', 'Cambio Stato Atleta', `Stato modificato in ${newSt.toUpperCase()}`);
              }}
              className="px-3 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/50 outline-none"
            >
              {Object.entries(ATHLETE_STATUS_MAP).map(([key, val]) => (
                <option key={key} value={key}>
                  Stato: {val.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddCommModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invia Comunicazione</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9 Tabs Navigation Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { key: 'riepilogo', label: 'Riepilogo', icon: Sparkles },
          { key: 'dati_personali', label: 'Dati Personali', icon: User },
          { key: 'abbonamenti', label: 'Abbonamenti', icon: Award },
          { key: 'pagamenti', label: 'Pagamenti', icon: DollarSign },
          { key: 'documenti', label: 'Documenti', icon: FileText, badge: missingDocs.length },
          { key: 'attivita', label: 'Attività', icon: CheckSquare, badge: openActivities.length },
          { key: 'comunicazioni', label: 'Comunicazioni', icon: MessageSquare },
          { key: 'note', label: 'Note', icon: Lock },
          { key: 'cronologia', label: 'Cronologia', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-zinc-950 text-amber-400' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 1: RIEPILOGO */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'riepilogo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Package Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
                  Pacchetto Attivo
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white truncate">{athlete.activePackage || 'Nessun Pacchetto'}</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Scadenza: <strong className="text-amber-400">{athlete.expirationDate || 'N.D.'}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(true)}
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rinnova Pacchetto</span>
              </button>
            </div>

            {/* Next Payment Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
                  Prossimo Pagamento
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-white">€195,00</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${paymentConfig.badgeColor}`}>
                    {paymentConfig.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Scadenza: <strong className="text-zinc-200">01 Settembre 2026</strong>
                </p>
              </div>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Registra Pagamento</span>
              </button>
            </div>

            {/* Open Activities Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                  <CheckSquare className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
                  Attività Aperte
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{openActivities.length}</h3>
                <p className="text-xs text-zinc-400 mt-1">Compiti e verifiche da completare</p>
              </div>
              <button
                onClick={() => setActiveTab('attivita')}
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Gestisci Attività</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>

            {/* Missing Documents Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
                  Documenti Mancanti
                </span>
              </div>
              <div>
                <h3 className={`text-2xl font-black ${missingDocs.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {missingDocs.length}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {missingDocs.length > 0 ? 'Richiede attenzione amministrativa' : 'Tutti i documenti in regola'}
                </p>
              </div>
              <button
                onClick={() => setIsAddDocModalOpen(true)}
                className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Carica Documento</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Goals & Notes summary */}
            <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Obiettivo Primario & Note Clinico-Sportive
              </h3>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <p className="text-xs font-semibold text-amber-400">Obiettivo Dichiarato:</p>
                <p className="text-sm text-zinc-200 font-medium">{athlete.goal || 'Nessun obiettivo specificato'}</p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <p className="text-xs font-semibold text-zinc-400">Note Anamnestiche e Cliniche:</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{athlete.notes || 'Nessuna nota iniziale salvata.'}</p>
              </div>

              {/* Open Tasks Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Compiti Imminenti:</h4>
                  <button
                    onClick={() => setIsAddActivityModalOpen(true)}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Nuova Attività
                  </button>
                </div>
                {openActivities.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Nessuna attività in sospeso per questo atleta.</p>
                ) : (
                  <div className="space-y-2">
                    {openActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleActivity(act.id)}
                            className="p-1 text-zinc-500 hover:text-amber-400 transition-all"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{act.title}</p>
                            <p className="text-[11px] text-zinc-400">
                              Scade: {act.dueDate} • Assegnato a: {act.assignedToName}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px] font-bold uppercase">
                          {act.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact & Emergency Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                Contatti & Emergenza
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400">Telefono:</span>
                  <strong className="text-zinc-200">{athlete.phone}</strong>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400">Email:</span>
                  <strong className="text-zinc-200 truncate max-w-[160px]">{athlete.email}</strong>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400">Città:</span>
                  <strong className="text-zinc-200">{athlete.city || 'N.D.'} ({athlete.province || 'RM'})</strong>
                </div>

                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                  <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Contatto ICE di Emergenza
                  </p>
                  <p className="text-xs font-semibold text-zinc-200">
                    {athlete.emergencyContact?.name || 'Non specificato'}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Tel: {athlete.emergencyContact?.phone || 'N.D.'} ({athlete.emergencyContact?.relation || 'Parente'})
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Azione Rapida:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const cleanPhone = athlete.phone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${cleanPhone}`, '_blank');
                    }}
                    className="py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `mailto:${athlete.email}`;
                    }}
                    className="py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 2: DATI PERSONALI */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'dati_personali' && (
        <form onSubmit={handleSavePersonalData} className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Anagrafica & Scheda Personale Complete</h3>
              <p className="text-xs text-zinc-400">Modifica e aggiorna le informazioni dell'atleta</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Salva Modifiche
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Nome *</label>
              <input
                type="text"
                required
                value={personalFormData.firstName}
                onChange={(e) => setPersonalFormData({ ...personalFormData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Cognome *</label>
              <input
                type="text"
                required
                value={personalFormData.lastName}
                onChange={(e) => setPersonalFormData({ ...personalFormData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Codice Fiscale</label>
              <input
                type="text"
                value={personalFormData.fiscalCode}
                onChange={(e) => setPersonalFormData({ ...personalFormData, fiscalCode: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Data di Nascita</label>
              <input
                type="date"
                value={personalFormData.birthDate}
                onChange={(e) => setPersonalFormData({ ...personalFormData, birthDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Sesso</label>
              <select
                value={personalFormData.gender}
                onChange={(e) => setPersonalFormData({ ...personalFormData, gender: e.target.value as any })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              >
                <option value="M">Maschio (M)</option>
                <option value="F">Femmina (F)</option>
                <option value="Altro">Altro / Non specificato</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Professione</label>
              <input
                type="text"
                value={personalFormData.profession}
                onChange={(e) => setPersonalFormData({ ...personalFormData, profession: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Telefono *</label>
              <input
                type="text"
                required
                value={personalFormData.phone}
                onChange={(e) => setPersonalFormData({ ...personalFormData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Email *</label>
              <input
                type="email"
                required
                value={personalFormData.email}
                onChange={(e) => setPersonalFormData({ ...personalFormData, email: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Canale Preferito</label>
              <select
                value={personalFormData.preferredChannel}
                onChange={(e) => setPersonalFormData({ ...personalFormData, preferredChannel: e.target.value as any })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="telefono">Telefono</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Indirizzo Residenziale</label>
              <input
                type="text"
                value={personalFormData.address}
                onChange={(e) => setPersonalFormData({ ...personalFormData, address: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Città e Provincia</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Città"
                  value={personalFormData.city}
                  onChange={(e) => setPersonalFormData({ ...personalFormData, city: e.target.value })}
                  className="col-span-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="PR"
                  value={personalFormData.province}
                  onChange={(e) => setPersonalFormData({ ...personalFormData, province: e.target.value })}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Contatto di Emergenza (ICE)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nome Referente</label>
                <input
                  type="text"
                  value={personalFormData.emergencyContactName}
                  onChange={(e) => setPersonalFormData({ ...personalFormData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Telefono Emergenza</label>
                <input
                  type="text"
                  value={personalFormData.emergencyContactPhone}
                  onChange={(e) => setPersonalFormData({ ...personalFormData, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Relazione / Parentela</label>
                <input
                  type="text"
                  value={personalFormData.emergencyContactRelation}
                  onChange={(e) => setPersonalFormData({ ...personalFormData, emergencyContactRelation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Classification & Goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Coach Assegnato</label>
              <select
                value={personalFormData.assignedCoachName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const foundMem = members.find((m) => m.profile.fullName === selectedName);
                  setPersonalFormData({
                    ...personalFormData,
                    assignedCoachName: selectedName,
                    assignedCoachId: foundMem ? foundMem.userId : '',
                  });
                }}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              >
                <option value="">Nessun Coach</option>
                {members.map((m) => (
                  <option key={m.id} value={m.profile.fullName}>
                    {m.profile.fullName} ({m.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Disciplina Primaria</label>
              <input
                type="text"
                value={personalFormData.discipline}
                onChange={(e) => setPersonalFormData({ ...personalFormData, discipline: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Fonte Acquisizione</label>
              <select
                value={personalFormData.acquisitionSource}
                onChange={(e) => setPersonalFormData({ ...personalFormData, acquisitionSource: e.target.value as any })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              >
                <option value="social">Social Media (Instagram/FB)</option>
                <option value="sito_web">Sito Web / Google Search</option>
                <option value="passaparola">Passaparola / Amico</option>
                <option value="pubblicita">Pubblicità Diretta</option>
                <option value="evento">Evento / Fiera</option>
                <option value="altro">Altro</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Etichette / Tag (separate da virgola)</label>
              <input
                type="text"
                value={personalFormData.labelsText}
                onChange={(e) => setPersonalFormData({ ...personalFormData, labelsText: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 3: ABBONAMENTI */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'abbonamenti' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pacchetti & Abbonamenti dell'Atleta</h3>
              <p className="text-xs text-zinc-400">Storico e pacchetto contrattuale attivo</p>
            </div>
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Pacchetto / Rinnovo</span>
            </button>
          </div>

          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition-all ${
                  sub.status === 'attivo'
                    ? 'bg-zinc-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-900/60 border-zinc-800 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                          sub.status === 'attivo'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                      <h4 className="text-lg font-bold text-white">{sub.packageName}</h4>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Valido dal <strong className="text-zinc-200">{sub.startDate}</strong> al{' '}
                      <strong className="text-amber-400">{sub.endDate}</strong>
                    </p>
                    {sub.notes && <p className="text-xs text-zinc-500 italic pt-1">{sub.notes}</p>}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Importo Totale</p>
                      <p className="text-xl font-black text-amber-400">€{sub.agreedPrice.toFixed(2)}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">{sub.paymentFrequency}</p>
                    </div>

                    {sub.status === 'attivo' && (
                      <button
                        onClick={() => setIsRenewModalOpen(true)}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Estendi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 4: PAGAMENTI */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'pagamenti' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Situazione Economica & Rate</h3>
              <p className="text-xs text-zinc-400">Storico pagamenti, scadenze e incassi</p>
            </div>
            <button
              onClick={() => openQuickRegisterModal({ atletaId: athlete?.id })}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registra Pagamento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-400">Totale Incassato:</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                €
                {payments
                  .filter((p) => p.status === 'pagato')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-400">Prossimo Saldo In Sospeso:</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                €
                {payments
                  .filter((p) => p.status !== 'pagato')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-400">Stato Amministrativo:</p>
              <p className={`text-xl font-bold mt-1 ${paymentConfig.color}`}>
                {paymentConfig.label}
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Descrizione</th>
                    <th className="p-4">Importo</th>
                    <th className="p-4">Data Scadenza</th>
                    <th className="p-4">Data Incasso</th>
                    <th className="p-4">Metodo</th>
                    <th className="p-4">Ricevuta</th>
                    <th className="p-4">Stato</th>
                    <th className="p-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{p.description}</td>
                      <td className="p-4 font-black text-amber-400">€{p.amount.toFixed(2)}</td>
                      <td className="p-4 font-medium">{p.dueDate}</td>
                      <td className="p-4">{p.paidDate || '-'}</td>
                      <td className="p-4 font-semibold uppercase">{p.method || '-'}</td>
                      <td className="p-4 font-mono text-zinc-400">{p.receiptNumber || '-'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            p.status === 'pagato'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'moroso'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {p.status !== 'pagato' && (
                          <button
                            onClick={() => {
                              setPayments((prev) =>
                                prev.map((item) =>
                                  item.id === p.id
                                    ? {
                                        ...item,
                                        status: 'pagato',
                                        paidDate: new Date().toISOString().slice(0, 10),
                                        receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                                      }
                                    : item
                                )
                              );
                              logTimelineEvent('pagamento', 'Rata Segnata Come Pagata', `Incassati €${p.amount} per ${p.description}`);
                              showSuccess('Aggiornato', 'Rata segnata come incassata.');
                            }}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold"
                          >
                            Incassa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 5: DOCUMENTI */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'documenti' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Documentazione Amministrativa & Certificati</h3>
              <p className="text-xs text-zinc-400">Verifica validità certificati medici e consensi GDPR</p>
            </div>
            <button
              onClick={() => setIsAddDocModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Carica Documento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      doc.status === 'valido'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : doc.status === 'in_scadenza'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                  {doc.expiryDate && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Scadenza: <strong className="text-zinc-200">{doc.expiryDate}</strong>
                    </p>
                  )}
                  {doc.uploadedAt && <p className="text-[11px] text-zinc-500 mt-0.5">Caricato il: {doc.uploadedAt}</p>}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
                  <button
                    onClick={() => showInfo('Visualizzatore', 'Anteprima documento aperta.')}
                    className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Anteprima
                  </button>
                  <button
                    onClick={() => {
                      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                      showInfo('Eliminato', 'Documento rimosso.');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 6: ATTIVITÀ */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'attivita' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Gestione Attività & Task Atleta</h3>
              <p className="text-xs text-zinc-400">Verifiche programmate, chiamate e schede</p>
            </div>
            <button
              onClick={() => setIsAddActivityModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuova Attività</span>
            </button>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Nessuna attività inserita.</p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    act.completed
                      ? 'bg-zinc-950/60 border-zinc-800/80 opacity-60'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActivity(act.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        act.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-amber-400'
                      }`}
                    >
                      {act.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${act.completed ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Scadenza: <strong className="text-zinc-300">{act.dueDate}</strong> • Assegnato a:{' '}
                        <strong className="text-zinc-300">{act.assignedToName}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-extrabold uppercase">
                    {act.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 7: COMUNICAZIONI */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'comunicazioni' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Registro Comunicazioni</h3>
              <p className="text-xs text-zinc-400">Messaggi inviati via WhatsApp, Email e Telefonate</p>
            </div>
            <button
              onClick={() => setIsAddCommModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Nuovo Messaggio / Registro</span>
            </button>
          </div>

          <div className="space-y-3">
            {communications.map((com) => (
              <div key={com.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-black uppercase">
                      {com.channel}
                    </span>
                    <h4 className="text-xs font-bold text-white">{com.subject}</h4>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {com.date} {com.time} • Inviato da: <strong className="text-zinc-400">{com.sentBy}</strong>
                  </span>
                </div>
                <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                  "{com.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 8: NOTE CON AUTORIZZAZIONE E CATEGORIE */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'note' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Note & Diari di Bordo Riservati
              </h3>
              <p className="text-xs text-zinc-400">Suddivise in Generali, Amministrative, Tecniche e Riservate</p>
            </div>

            {/* Note category filter pills */}
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {[
                { id: 'all', label: 'Tutte' },
                { id: 'generali', label: 'Generali' },
                { id: 'amministrative', label: 'Amministrative' },
                { id: 'tecniche', label: 'Tecniche' },
                { id: 'riservate', label: 'Riservate' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedNoteCategoryFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedNoteCategoryFilter === f.id
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4" /> Aggiungi Nuova Nota
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoria Nota</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as NoteCategory)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="generali">Generali (Accessibile a tutti)</option>
                  <option value="amministrative">Amministrative (Segreteria & Admin)</option>
                  <option value="tecniche">Tecniche (Coach & Admin - Riservate)</option>
                  <option value="riservate">Riservate Direzione (Proprietario / Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Livello di Visibilità</label>
                <select
                  value={newNoteVisibility}
                  onChange={(e) => setNewNoteVisibility(e.target.value as VisibilityLevel)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="tutti">Tutto lo Staff</option>
                  <option value="segreteria_admin">Segreteria & Amministrazione</option>
                  <option value="coach_admin">Solo Coach e Direzione</option>
                  <option value="riservato_direzione">Riservato Direzione</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                required
                placeholder="Scrivi il testo della nota..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                Registra Nota
              </button>
            </div>
          </form>

          {/* Notes list with authorization check */}
          <div className="space-y-3">
            {notes
              .filter((n) => selectedNoteCategoryFilter === 'all' || n.category === selectedNoteCategoryFilter)
              .map((note) => {
                // Check user authorization for restricted notes
                const isTechnicalOrReserved = note.category === 'tecniche' || note.category === 'riservate';
                const userCanViewTech = canViewTechnicalNotes(user);

                const isProtectedForSegreteria = user?.role === 'segreteria' && isTechnicalOrReserved;
                const isProtectedForAtleta = user?.role === 'atleta' && isTechnicalOrReserved;

                const isBlocked = isProtectedForSegreteria || isProtectedForAtleta;

                return (
                  <div
                    key={note.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      note.category === 'riservate'
                        ? 'bg-rose-950/20 border-rose-800/40'
                        : note.category === 'tecniche'
                        ? 'bg-purple-950/20 border-purple-800/40'
                        : note.category === 'amministrative'
                        ? 'bg-blue-950/20 border-blue-800/40'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            note.category === 'riservate'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : note.category === 'tecniche'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : note.category === 'amministrative'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {note.category}
                        </span>

                        <span className="text-xs font-bold text-white">{note.authorName}</span>
                        <span className="text-[11px] text-zinc-500">({note.authorRole})</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{note.date} alle {note.time}</span>
                      </div>
                    </div>

                    {isBlocked ? (
                      <div className="p-3 bg-zinc-950 rounded-xl border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 font-semibold">
                        <Lock className="w-4 h-4 text-rose-400" />
                        <span>Nota Riservata / Tecnica - Accesso protetto non autorizzato per il tuo ruolo ({user?.role?.toUpperCase()})</span>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                        {note.text}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 9: CRONOLOGIA TIMELINE */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'cronologia' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Timeline Eventi & Audit Trail</h3>
              <p className="text-xs text-zinc-400">Registro cronologico completo delle attività dell'atleta</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cerca nella cronologia..."
                  value={timelineSearchQuery}
                  onChange={(e) => setTimelineSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <select
                value={timelineFilterType}
                onChange={(e) => setTimelineFilterType(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              >
                <option value="all">Tutti gli Eventi</option>
                <option value="creazione">Creazione</option>
                <option value="modifica_stato">Modifiche Stato</option>
                <option value="assegnazione_coach">Assegnazione Coach</option>
                <option value="acquisto_pacchetto">Acquisto Pacchetto</option>
                <option value="rinnovo">Rinnovi</option>
                <option value="pagamento">Pagamenti</option>
                <option value="caricamento_documento">Documenti</option>
                <option value="comunicazione">Comunicazioni</option>
                <option value="nota">Note</option>
              </select>
            </div>
          </div>

          <div className="relative border-l-2 border-zinc-800 ml-4 pl-6 space-y-6">
            {filteredTimeline.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-[31px] top-0 p-1.5 bg-zinc-900 border border-amber-500/40 text-amber-400 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                </div>

                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {evt.date} alle {evt.time} • Autore: <strong className="text-zinc-400">{evt.authorName}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* RENEW PACKAGE MODAL */}
      {/* -------------------------------------------------------------------------- */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" /> Rinnova / Acquista Pacchetto
            </h3>

            <form onSubmit={handleRenewPackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nome Pacchetto</label>
                <input
                  type="text"
                  required
                  value={renewPackageName}
                  onChange={(e) => setRenewPackageName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Prezzo (€)</label>
                  <input
                    type="number"
                    required
                    value={renewPrice}
                    onChange={(e) => setRenewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Durata (Mesi)</label>
                  <input
                    type="number"
                    required
                    value={renewDurationMonths}
                    onChange={(e) => setRenewDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  Conferma Rinnovo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* ADD PAYMENT MODAL */}
      {/* -------------------------------------------------------------------------- */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Registra Incasso / Pagamento
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Causale / Descrizione</label>
                <input
                  type="text"
                  required
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Importo (€)</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Metodo</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="pos">POS / Carta</option>
                    <option value="contanti">Contanti</option>
                    <option value="bonifico">Bonifico Bancario</option>
                    <option value="sdd">RID / SDD Direct Debit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Numero Ricevuta / Fiscale</label>
                <input
                  type="text"
                  value={paymentReceipt}
                  onChange={(e) => setPaymentReceipt(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20"
                >
                  Registra Incasso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* ADD DOCUMENT MODAL */}
      {/* -------------------------------------------------------------------------- */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Carica Nuovo Documento
            </h3>

            <form onSubmit={handleUploadDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Titolo Documento</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Tipo Documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="certificato_medico">Certificato Medico</option>
                    <option value="privacy">Modulo Privacy GDPR</option>
                    <option value="regolamento">Regolamento Interno</option>
                    <option value="carta_identita">Carta Identità</option>
                    <option value="anamnesi">Anamnesi Posturale</option>
                    <option value="altro">Altro Documento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Data Scadenza</label>
                  <input
                    type="date"
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  Salva Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* ADD ACTIVITY MODAL */}
      {/* -------------------------------------------------------------------------- */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" /> Programma Attività / Task
            </h3>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Titolo Attività</label>
                <input
                  type="text"
                  required
                  placeholder="es. Verifica video esecuzione stacco"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Categoria</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="scheda">Scheda Allenamento</option>
                    <option value="chiamata">Chiamata / Check</option>
                    <option value="amministrazione">Amministrazione</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Data Scadenza</label>
                  <input
                    type="date"
                    required
                    value={actDueDate}
                    onChange={(e) => setActDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-black"
                >
                  Crea Attività
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* ADD COMMUNICATION MODAL */}
      {/* -------------------------------------------------------------------------- */}
      {isAddCommModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" /> Invia / Registra Comunicazione
            </h3>

            <form onSubmit={handleSendCommunication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Canale</label>
                  <select
                    value={commChannel}
                    onChange={(e) => setCommChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="telefono">Telefonata</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Oggetto</label>
                  <input
                    type="text"
                    required
                    value={commSubject}
                    onChange={(e) => setCommSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Testo del Messaggio</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Scrivi il messaggio..."
                  value={commMessage}
                  onChange={(e) => setCommMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCommModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-black"
                >
                  Invia / Salva Messaggio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
