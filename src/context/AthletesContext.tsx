import React, { createContext, useContext, useState, useEffect } from 'react';
import { Athlete, AthleteFormData, AthleteStatus, AthletePaymentStatus, TimelineEvent } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { STORAGE_KEYS, ATHLETE_SUBKEYS } from '../config/storageKeys';

interface AthletesContextType {
  athletes: Athlete[];
  addAthlete: (data: AthleteFormData) => Athlete;
  updateAthlete: (id: string, data: Partial<AthleteFormData>) => void;
  deleteAthlete: (id: string) => void;
  archiveAthlete: (id: string) => void;
  bulkArchiveAthletes: (ids: string[]) => void;
  bulkDeleteAthletes: (ids: string[]) => void;
  bulkUpdateCoach: (ids: string[], coachId: string, coachName: string) => void;
  updateAthleteStatus: (id: string, status: AthleteStatus) => void;
  updateAthletePaymentStatus: (id: string, paymentStatus: AthletePaymentStatus) => void;
  bulkSetAthletes: (athletes: Athlete[]) => void;
  exportToCSV: (selectedIds?: string[]) => void;
  addTimelineEvent: (athleteId: string, eventData: Omit<TimelineEvent, 'id' | 'athleteId' | 'createdAt'>) => void;
}

const AthletesContext = createContext<AthletesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = STORAGE_KEYS.ATHLETES;

const INITIAL_ATHLETES: Athlete[] = [
  {
    id: 'ath-1',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    firstName: 'Marco',
    lastName: 'Rossi',
    birthDate: '1990-05-14',
    gender: 'M',
    phone: '+39 333 1234567',
    email: 'marco.rossi@gmail.com',
    address: 'Via Garibaldi 12',
    city: 'Roma',
    province: 'RM',
    profession: 'Ingegnere Informatico',
    emergencyContact: { name: 'Laura Rossi', phone: '+39 333 9998877', relation: 'Moglie' },
    preferredChannel: 'whatsapp',
    joinDate: '2024-01-15',
    acquisitionSource: 'social',
    assignedCoachId: 'demo-user-owner',
    assignedCoachName: 'Salvatore Carotenuto',
    goal: 'Aumento massa muscolare e forza nello squat',
    discipline: 'Powerlifting',
    status: 'attivo',
    activePackage: 'Annuale Gold Power (12 Mesi)',
    expirationDate: '2026-11-30',
    paymentStatus: 'regolare',
    notes: 'Anamnesi: intervento LCA sinistro nel 2021. Nessun dolore residuo. Evitare iperestensione al leg extension.',
    labels: ['Powerlifting', 'Agonista', 'Squat 200kg'],
    medicalCertificateExpiry: '2026-11-30',
    fiscalCode: 'RSSMRC90M14H501Z',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'ath-2',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    firstName: 'Elena',
    lastName: 'Bianchi',
    birthDate: '1995-08-22',
    gender: 'F',
    phone: '+39 340 9876543',
    email: 'elena.bianchi@gmail.com',
    address: 'Corso Buenos Aires 45',
    city: 'Milano',
    province: 'MI',
    profession: 'Architectural Designer',
    emergencyContact: { name: 'Giuseppe Bianchi', phone: '+39 340 1112233', relation: 'Padre' },
    preferredChannel: 'email',
    joinDate: '2024-03-10',
    acquisitionSource: 'passaparola',
    assignedCoachId: 'demo-user-coach',
    assignedCoachName: 'Luca Bianchi (Coach)',
    goal: 'Preparazione Gara Bikini cat. -163cm',
    discipline: 'Bikini Fitness',
    status: 'in_scadenza',
    activePackage: 'Pacchetto 10 Personal Training',
    expirationDate: '2026-08-05',
    paymentStatus: 'in_scadenza',
    notes: 'Focus su glutei e spalle. Dieta ipocalorica ciclica con rifeed nei giorni di leg day.',
    labels: ['Bikini Fitness', 'Gara Settembre', 'Personal Training'],
    medicalCertificateExpiry: '2026-09-15',
    fiscalCode: 'BNCHLN95T62F205X',
    createdAt: '2024-03-10T11:30:00.000Z',
    updatedAt: '2026-07-22T14:15:00.000Z',
  },
  {
    id: 'ath-3',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    firstName: 'Giuseppe',
    lastName: 'Verdi',
    birthDate: '1988-12-05',
    gender: 'M',
    phone: '+39 328 5554433',
    email: 'g.verdi@gmail.com',
    address: 'Via Toledo 102',
    city: 'Napoli',
    province: 'NA',
    profession: 'Commercialista',
    emergencyContact: { name: 'Maria Verdi', phone: '+39 328 0001122', relation: 'Sorella' },
    preferredChannel: 'telefono',
    joinDate: '2024-02-01',
    acquisitionSource: 'sito_web',
    assignedCoachId: 'demo-user-owner',
    assignedCoachName: 'Salvatore Carotenuto',
    goal: 'Ricomposizione corporea e mobilità',
    discipline: 'Bodybuilding',
    status: 'moroso',
    activePackage: 'Semestrale Forza & Massa',
    expirationDate: '2026-07-15',
    paymentStatus: 'moroso',
    notes: 'Rata scaduta il 15 Luglio. Inviato primo sollecito cortese tramite whatsapp. Lombalgia da flessione prolungata da ufficio.',
    labels: ['Sollecito Rata', 'Lombalgia', 'Richiesta Fattura'],
    medicalCertificateExpiry: '2026-10-01',
    fiscalCode: 'VRDGPP88T05F839W',
    createdAt: '2024-02-01T15:00:00.000Z',
    updatedAt: '2026-07-25T16:00:00.000Z',
  },
  {
    id: 'ath-4',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    firstName: 'Sofia',
    lastName: 'Moretti',
    birthDate: '1998-03-18',
    gender: 'F',
    phone: '+39 347 1122334',
    email: 'sofia.moretti@outlook.it',
    address: 'Via Roma 88',
    city: 'Torino',
    province: 'TO',
    profession: 'Social Media Manager',
    emergencyContact: { name: 'Paolo Moretti', phone: '+39 347 8899000', relation: 'Fratello' },
    preferredChannel: 'whatsapp',
    joinDate: '2026-07-28',
    acquisitionSource: 'pubblicita',
    assignedCoachId: 'demo-user-admin',
    assignedCoachName: 'Marco Rossi (Admin)',
    goal: 'Tonificazione e primo approccio ai pesi',
    discipline: 'Fitness Generale',
    status: 'potenziale_cliente',
    activePackage: 'Richiesta Info / Consulenza',
    expirationDate: '2026-08-15',
    paymentStatus: 'in_attesa',
    notes: 'Contattato tramite inserzione Instagram. Interessata a abbonamento semestrale con personal trainer.',
    labels: ['Lead Instagram', 'Contattare WhatsApp', 'Consulenza In Arrivo'],
    medicalCertificateExpiry: '2026-12-31',
    fiscalCode: 'MRTSFA98C58L219K',
    createdAt: '2026-07-28T10:00:00.000Z',
    updatedAt: '2026-07-28T10:00:00.000Z',
  },
  {
    id: 'ath-5',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    firstName: 'Alessandro',
    lastName: 'Conti',
    birthDate: '1992-11-30',
    gender: 'M',
    phone: '+39 338 9988776',
    email: 'a.conti@gmail.com',
    address: 'Via Indipendenza 14',
    city: 'Bologna',
    province: 'BO',
    profession: 'Sviluppatore Web',
    emergencyContact: { name: 'Serena Conti', phone: '+39 338 1234123', relation: 'Moglie' },
    preferredChannel: 'whatsapp',
    joinDate: '2026-07-25',
    acquisitionSource: 'social',
    assignedCoachId: 'demo-user-coach',
    assignedCoachName: 'Luca Bianchi (Coach)',
    goal: 'Skill Calisthenics (Human Flag & Muscle Up)',
    discipline: 'Calisthenics',
    status: 'prova',
    activePackage: 'Prova Gratuita 1 Settimana',
    expirationDate: '2026-08-02',
    paymentStatus: 'regolare',
    notes: 'Ha fatto la prima lezione di prova giovedì. Ottima forza negli arti superiori, da curare la postura delle spalle.',
    labels: ['In Prova', 'Calisthenics', 'Valutazione Veloce'],
    medicalCertificateExpiry: '2026-12-01',
    fiscalCode: 'CNTLSN92S30A944J',
    createdAt: '2026-07-25T14:20:00.000Z',
    updatedAt: '2026-07-25T14:20:00.000Z',
  },
  {
    id: 'ath-6',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    firstName: 'Chiara',
    lastName: 'Santoro',
    birthDate: '1997-04-12',
    gender: 'F',
    phone: '+39 366 4433221',
    email: 'chiara.santoro@yahoo.it',
    address: 'Via dei Calzaiuoli 8',
    city: 'Firenze',
    province: 'FI',
    profession: 'Farmacista',
    emergencyContact: { name: 'Stefano Santoro', phone: '+39 366 9988112', relation: 'Padre' },
    preferredChannel: 'email',
    joinDate: '2026-07-27',
    acquisitionSource: 'passaparola',
    assignedCoachId: 'demo-user-owner',
    assignedCoachName: 'Salvatore Carotenuto',
    goal: 'Ricondizionamento fisico post-gravidanza',
    discipline: 'Fitness & Posturale',
    status: 'onboarding',
    activePackage: 'Coaching Online Trimestrale',
    expirationDate: '2026-10-27',
    paymentStatus: 'regolare',
    notes: 'In attesa del video di anamnesi posturale. Inviata scheda introduttiva per mobilità e core stability.',
    labels: ['Nuova Iscrizione', 'Anamnesi da Completare', 'Coaching Online'],
    medicalCertificateExpiry: '2027-01-15',
    fiscalCode: 'SNTRCH97D52D612P',
    createdAt: '2026-07-27T16:45:00.000Z',
    updatedAt: '2026-07-27T16:45:00.000Z',
  },
  {
    id: 'ath-7',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    firstName: 'Matteo',
    lastName: 'Ferrara',
    birthDate: '1985-09-09',
    gender: 'M',
    phone: '+39 331 6677889',
    email: 'matteo.ferrara@gmail.com',
    address: 'Corso Porta Nuova 22',
    city: 'Verona',
    province: 'VR',
    profession: 'Imprenditore',
    emergencyContact: { name: 'Elena Ferrara', phone: '+39 331 0000111', relation: 'Moglie' },
    preferredChannel: 'whatsapp',
    joinDate: '2023-11-10',
    acquisitionSource: 'sito_web',
    assignedCoachId: 'demo-user-coach',
    assignedCoachName: 'Luca Bianchi (Coach)',
    goal: 'Mantenimento massa magra e benessere',
    discipline: 'Bodybuilding',
    status: 'in_pausa',
    activePackage: 'Abbonamento Annuale VIP',
    expirationDate: '2026-12-15',
    paymentStatus: 'regolare',
    notes: 'Sospensione estiva concordata dal 15 Luglio al 31 Agosto. Ripartenza piano a Settembre.',
    labels: ['Pausa Estiva', 'Rientro Settembre', 'Cliente Storico'],
    medicalCertificateExpiry: '2026-11-10',
    fiscalCode: 'FRRMTT85P09L781X',
    createdAt: '2023-11-10T08:30:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z',
  },
  {
    id: 'ath-8',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    firstName: 'Francesca',
    lastName: 'Rizzo',
    birthDate: '1993-06-25',
    gender: 'F',
    phone: '+39 349 7788990',
    email: 'francesca.rizzo@gmail.com',
    address: 'Via Maqueda 150',
    city: 'Palermo',
    province: 'PA',
    profession: 'Avvocato',
    emergencyContact: { name: 'Giovanni Rizzo', phone: '+39 349 2223344', relation: 'Padre' },
    preferredChannel: 'email',
    joinDate: '2024-03-01',
    acquisitionSource: 'passaparola',
    assignedCoachId: 'demo-user-owner',
    assignedCoachName: 'Salvatore Carotenuto',
    goal: 'Ipertrofia arti inferiori',
    discipline: 'Bodybuilding',
    status: 'non_rinnovato',
    activePackage: 'Trimestrale Bodybuilding',
    expirationDate: '2026-06-30',
    paymentStatus: 'scaduto',
    notes: 'Ha comunicato di non poter rinnovare per trasferimento lavorativo a Londra. Rimane in contatto.',
    labels: ['Trasferimento Estero', 'Feedback Positivo'],
    medicalCertificateExpiry: '2026-03-01',
    fiscalCode: 'RZZFNC93H65G273B',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2026-07-01T11:00:00.000Z',
  },
  {
    id: 'ath-9',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    firstName: 'Davide',
    lastName: 'Galli',
    birthDate: '1991-01-14',
    gender: 'M',
    phone: '+39 320 1122445',
    email: 'davide.galli@libero.it',
    address: 'Via Sparano 50',
    city: 'Bari',
    province: 'BA',
    profession: 'Consulente Finanziario',
    emergencyContact: { name: 'Anna Galli', phone: '+39 320 9988776', relation: 'Madre' },
    preferredChannel: 'telefono',
    joinDate: '2024-05-15',
    acquisitionSource: 'pubblicita',
    assignedCoachId: 'demo-user-admin',
    assignedCoachName: 'Marco Rossi (Admin)',
    goal: 'Preparazione atletica tennis',
    discipline: 'Preparazione Atletica',
    status: 'sospeso',
    activePackage: 'Mensile Open',
    expirationDate: '2026-07-20',
    paymentStatus: 'scaduto',
    notes: 'Sospeso per mancata presentazione del certificato medico agonistico rinnovato.',
    labels: ['Certificato Medico Scaduto', 'Sospeso Temporaneo'],
    medicalCertificateExpiry: '2026-06-30',
    fiscalCode: 'GLLDVD91A14A662O',
    createdAt: '2024-05-15T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'ath-10',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    firstName: 'Valentina',
    lastName: 'De Luca',
    birthDate: '1989-10-02',
    gender: 'F',
    phone: '+39 335 8877665',
    email: 'v.deluca@gmail.com',
    address: 'Via XX Settembre 3',
    city: 'Genova',
    province: 'GE',
    profession: 'Insegnante',
    emergencyContact: { name: 'Fabio De Luca', phone: '+39 335 1231231', relation: 'Marito' },
    preferredChannel: 'email',
    joinDate: '2023-05-01',
    acquisitionSource: 'altro',
    assignedCoachId: undefined,
    assignedCoachName: 'Non Assegnato',
    goal: 'Mantenimento tonicità',
    discipline: 'Fitness',
    status: 'inattivo',
    activePackage: 'Nessun Pacchetto Attivo',
    expirationDate: '2025-12-31',
    paymentStatus: 'regolare',
    notes: 'Ex atleta storica. Proposta offerta rientro promozionale inviata via email.',
    labels: ['Ex Atleta', 'Proposta Re-Engagement'],
    medicalCertificateExpiry: '2025-12-31',
    fiscalCode: 'DLCVNT89R42D969Y',
    createdAt: '2023-05-01T09:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'ath-11',
    organizationId: 'org-doctor-strength',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    firstName: 'Roberto',
    lastName: 'Marino',
    birthDate: '1982-07-07',
    gender: 'M',
    phone: '+39 348 2233445',
    email: 'roberto.marino@gmail.com',
    address: 'Via Etnea 200',
    city: 'Catania',
    province: 'CT',
    profession: 'Medico Chirurgo',
    emergencyContact: { name: 'Silvia Marino', phone: '+39 348 9988221', relation: 'Moglie' },
    preferredChannel: 'whatsapp',
    joinDate: '2022-09-01',
    acquisitionSource: 'passaparola',
    assignedCoachId: undefined,
    assignedCoachName: 'Non Assegnato',
    goal: 'Post-riabilitazione spalla',
    discipline: 'Fitness & Health',
    status: 'archiviato',
    activePackage: 'Storico Iscrizione 2022-2024',
    expirationDate: '2024-12-31',
    paymentStatus: 'regolare',
    notes: 'Scheda archiviata su richiesta dell\'utente per fine percorso fisioterapico.',
    labels: ['Archiviato', 'Storico Concluso'],
    medicalCertificateExpiry: '2024-12-31',
    fiscalCode: 'MRNRBT82L07C351U',
    createdAt: '2022-09-01T10:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  }
];

export const AthletesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load athletes from localStorage', e);
    }
    return INITIAL_ATHLETES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(athletes));
    } catch (e) {
      console.error('Failed to save athletes to localStorage', e);
    }
  }, [athletes]);

  // Filter athletes by current organization
  const currentOrgAthletes = athletes.filter(
    (a) => !user?.organizationId || a.organizationId === user.organizationId
  );

  const addAthlete = (data: AthleteFormData): Athlete => {
    const orgId = user?.organizationId || 'org-doctor-strength';
    const newAthlete: Athlete = {
      id: `ath-${Date.now()}`,
      organizationId: orgId,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate || '',
      gender: data.gender || 'M',
      phone: data.phone,
      email: data.email,
      address: data.address || '',
      city: data.city || '',
      province: data.province || '',
      profession: data.profession || '',
      emergencyContact: data.emergencyContactName
        ? {
            name: data.emergencyContactName,
            phone: data.emergencyContactPhone || '',
            relation: data.emergencyContactRelation || '',
          }
        : undefined,
      preferredChannel: data.preferredChannel || 'whatsapp',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      acquisitionSource: data.acquisitionSource || 'passaparola',
      assignedCoachId: data.assignedCoachId || user?.id,
      assignedCoachName: data.assignedCoachName || user?.fullName || 'Coach Unassigned',
      goal: data.goal || '',
      discipline: data.discipline || 'Fitness',
      status: data.status || 'attivo',
      activePackage: data.activePackage || 'In Attesa di Assegnazione',
      expirationDate: data.expirationDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      paymentStatus: data.paymentStatus || 'regolare',
      notes: data.notes || '',
      labels: data.labels || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAthletes((prev) => [newAthlete, ...prev]);
    showSuccess('Atleta Registrato', `${newAthlete.firstName} ${newAthlete.lastName} è stato aggiunto con successo.`);
    return newAthlete;
  };

  const updateAthlete = (id: string, data: Partial<AthleteFormData>) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updatedEmergency =
            data.emergencyContactName !== undefined
              ? {
                  name: data.emergencyContactName,
                  phone: data.emergencyContactPhone || a.emergencyContact?.phone || '',
                  relation: data.emergencyContactRelation || a.emergencyContact?.relation || '',
                }
              : a.emergencyContact;

          return {
            ...a,
            ...data,
            emergencyContact: updatedEmergency,
            updatedAt: new Date().toISOString(),
          } as Athlete;
        }
        return a;
      })
    );
    showSuccess('Atleta Aggiornato', 'Le modifiche sono state salvate correttamente.');
  };

  const deleteAthlete = (id: string) => {
    setAthletes((prev) => prev.filter((a) => a.id !== id));
    showSuccess('Atleta Eliminato', 'Anagrafica atleta rimossa dal sistema.');
  };

  const archiveAthlete = (id: string) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'archiviato', updatedAt: new Date().toISOString() } : a))
    );
    showInfo('Atleta Archiviato', 'L\'atleta è stato spostato negli archivi.');
  };

  const bulkArchiveAthletes = (ids: string[]) => {
    setAthletes((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, status: 'archiviato', updatedAt: new Date().toISOString() } : a))
    );
    showSuccess('Archiviazione Completata', `${ids.length} atleti archiviati con successo.`);
  };

  const bulkDeleteAthletes = (ids: string[]) => {
    setAthletes((prev) => prev.filter((a) => !ids.includes(a.id)));
    showSuccess('Eliminazione In Blocco', `${ids.length} atleti eliminati.`);
  };

  const bulkUpdateCoach = (ids: string[], coachId: string, coachName: string) => {
    setAthletes((prev) =>
      prev.map((a) =>
        ids.includes(a.id)
          ? { ...a, assignedCoachId: coachId, assignedCoachName: coachName, updatedAt: new Date().toISOString() }
          : a
      )
    );
    showSuccess('Coach Riassegnato', `Assegnato ${coachName} a ${ids.length} atleti.`);
  };

  const updateAthleteStatus = (id: string, status: AthleteStatus) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
    showInfo('Stato Aggiornato', `Stato modificato in ${status.replace('_', ' ').toUpperCase()}`);
  };

  const updateAthletePaymentStatus = (id: string, paymentStatus: AthletePaymentStatus) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, paymentStatus, updatedAt: new Date().toISOString() } : a))
    );
  };

  const bulkSetAthletes = (newAthletesList: Athlete[]) => {
    setAthletes(newAthletesList);
  };

  const exportToCSV = (selectedIds?: string[]) => {
    const targetAthletes = selectedIds && selectedIds.length > 0
      ? currentOrgAthletes.filter((a) => selectedIds.includes(a.id))
      : currentOrgAthletes;

    if (targetAthletes.length === 0) {
      showError('Nessun Dato', 'Nessun atleta selezionato da esportare.');
      return;
    }

    const headers = [
      'ID',
      'Nome',
      'Cognome',
      'Telefono',
      'Email',
      'Data Nascita',
      'Sesso',
      'Città',
      'Provincia',
      'Coach Assegnato',
      'Data Ingresso',
      'Stato',
      'Pacchetto Attivo',
      'Data Scadenza',
      'Situazione Pagamenti',
      'Disciplina',
      'Etichette',
      'Fonte Acquisizione',
      'Canale Preferito',
    ];

    const rows = targetAthletes.map((a) => [
      a.id,
      `"${a.firstName.replace(/"/g, '""')}"`,
      `"${a.lastName.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      a.birthDate || '',
      a.gender || '',
      `"${a.city || ''}"`,
      `"${a.province || ''}"`,
      `"${a.assignedCoachName || ''}"`,
      a.joinDate,
      a.status,
      `"${a.activePackage || ''}"`,
      a.expirationDate || '',
      a.paymentStatus,
      `"${a.discipline || ''}"`,
      `"${a.labels.join(', ')}"`,
      a.acquisitionSource || '',
      a.preferredChannel || '',
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Esportazione_Atleti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Export Completato', `Scaricato CSV con ${targetAthletes.length} atleti.`);
  };

  const addTimelineEvent = (athleteId: string, eventData: Omit<TimelineEvent, 'id' | 'athleteId' | 'createdAt'>) => {
    try {
      const storageKey = ATHLETE_SUBKEYS.timeline(athleteId);
      const existingStr = localStorage.getItem(storageKey);
      const existingEvents: TimelineEvent[] = existingStr ? JSON.parse(existingStr) : [];
      const newEvent: TimelineEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        athleteId,
        createdAt: new Date().toISOString(),
      };
      const updatedEvents = [newEvent, ...existingEvents];
      localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
    } catch (err) {
      console.error('Error saving timeline event:', err);
    }
  };

  return (
    <AthletesContext.Provider
      value={{
        athletes: currentOrgAthletes,
        addAthlete,
        updateAthlete,
        deleteAthlete,
        archiveAthlete,
        bulkArchiveAthletes,
        bulkDeleteAthletes,
        bulkUpdateCoach,
        updateAthleteStatus,
        updateAthletePaymentStatus,
        bulkSetAthletes,
        exportToCSV,
        addTimelineEvent,
      }}
    >
      {children}
    </AthletesContext.Provider>
  );
};

export const useAthletes = () => {
  const context = useContext(AthletesContext);
  if (!context) {
    throw new Error('useAthletes deve essere utilizzato all\'interno di un AthletesProvider');
  }
  return context;
};
