import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AthleteDocument,
  AthleteConsent,
  DocumentAlert,
  DocumentCategory,
  DocumentVisibility,
  ConsentType,
  ConsentStatus,
  StoredFile,
} from '../types';
import { useAthletes } from './AthletesContext';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface DocumentsContextType {
  documents: AthleteDocument[];
  consents: AthleteConsent[];
  alerts: DocumentAlert[];
  addDocument: (data: {
    athleteId: string;
    athleteName: string;
    category: DocumentCategory;
    title: string;
    file: StoredFile;
    uploadDate?: string;
    expiryDate?: string;
    author?: string;
    authorRole?: string;
    visibility?: DocumentVisibility;
    notes?: string;
  }) => AthleteDocument;
  updateDocument: (id: string, data: Partial<AthleteDocument>) => void;
  deleteDocument: (id: string) => void;
  addConsent: (data: {
    athleteId: string;
    athleteName: string;
    consentType: ConsentType | string;
    date?: string;
    status: ConsentStatus;
    linkedDocumentId?: string;
    linkedDocumentTitle?: string;
    notes?: string;
  }) => AthleteConsent;
  updateConsent: (id: string, data: Partial<AthleteConsent>) => void;
  revokeConsent: (id: string, revocationReason: string, revocationDate?: string) => void;
  deleteConsent: (id: string) => void;
  uploadFileToSupabaseStorage: (file: File, category: DocumentCategory, athleteId: string) => Promise<StoredFile>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

const LOCAL_DOCS_KEY = 'builder_athlete_manager_documents_v1';
const LOCAL_CONSENTS_KEY = 'builder_athlete_manager_consents_v1';

// Sample dummy PDF file generator for seed data
const createSampleFile = (name: string, type: string, size: number, bucket: string, path: string): StoredFile => {
  return {
    name,
    size,
    mimeType: type,
    url: '#', // Handled visually or simulated preview
    bucket,
    path,
  };
};

const INITIAL_DOCUMENTS: AthleteDocument[] = [
  {
    id: 'doc-1',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    category: 'contratto',
    title: 'Contratto Iscrizione Annuale Gold 2024-2026',
    file: createSampleFile('Contratto_Marco_Rossi_Gold.pdf', 'application/pdf', 1048576, 'documents', 'athletes/ath-1/contratto_gold.pdf'),
    uploadDate: '2024-01-15',
    expiryDate: '2026-11-30',
    author: 'Salvatore Carotenuto',
    authorRole: 'Owner / Amministratore',
    visibility: 'pubblico',
    notes: 'Firmato in sede con allegata ricevuta prima rata.',
    createdAt: '2024-01-15T09:30:00.000Z',
    updatedAt: '2024-01-15T09:30:00.000Z',
  },
  {
    id: 'doc-2',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    category: 'certificato medico',
    title: 'Certificato Medico Agonistico Powerlifting (FIPL)',
    file: createSampleFile('Certificato_Agonistico_Rossi.pdf', 'application/pdf', 850000, 'medical', 'athletes/ath-1/cert_agonistico.pdf'),
    uploadDate: '2025-11-30',
    expiryDate: '2026-11-30',
    author: 'Salvatore Carotenuto',
    authorRole: 'Owner',
    visibility: 'solo_staff',
    notes: 'Rilasciato dal Dr. Mantovani - Istituto Medicina dello Sport Roma.',
    createdAt: '2025-11-30T10:00:00.000Z',
    updatedAt: '2025-11-30T10:00:00.000Z',
  },
  {
    id: 'doc-3',
    athleteId: 'ath-2',
    athleteName: 'Elena Bianchi',
    category: 'certificato medico',
    title: 'Certificato Medico Non Agonistico con ECG',
    file: createSampleFile('Certificato_Non_Agonistico_Bianchi.pdf', 'application/pdf', 620000, 'medical', 'athletes/ath-2/cert_medico.pdf'),
    uploadDate: '2025-08-20',
    expiryDate: '2026-08-20', // In scadenza entro 30 giorni!
    author: 'Luca Bianchi',
    authorRole: 'Coach',
    visibility: 'atleta_coach',
    notes: 'Certificato con ECG a riposo allegato. In scadenza prossimi giorni.',
    createdAt: '2025-08-20T11:00:00.000Z',
    updatedAt: '2025-08-20T11:00:00.000Z',
  },
  {
    id: 'doc-4',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    category: 'fattura',
    title: 'Fattura n. 2026-0042 - Semestrale Forza & Massa',
    file: createSampleFile('Fattura_2026_0042_Verdi.pdf', 'application/pdf', 312000, 'documents', 'athletes/ath-3/fattura_0042.pdf'),
    uploadDate: '2026-02-01',
    author: 'Salvatore Carotenuto',
    authorRole: 'Owner',
    visibility: 'riservato',
    notes: 'Prima rata saldata, seconda rata in sollecito.',
    createdAt: '2026-02-01T14:20:00.000Z',
    updatedAt: '2026-02-01T14:20:00.000Z',
  },
  {
    id: 'doc-5',
    athleteId: 'ath-9',
    athleteName: 'Davide Galli',
    category: 'certificato medico',
    title: 'Certificato Medico Agonistico Tennis (Scaduto)',
    file: createSampleFile('Certificato_Galli_2025.pdf', 'application/pdf', 540000, 'medical', 'athletes/ath-9/cert_scaduto.pdf'),
    uploadDate: '2025-06-30',
    expiryDate: '2026-06-30', // SCADUTO!
    author: 'Marco Rossi (Admin)',
    authorRole: 'Admin',
    visibility: 'solo_staff',
    notes: 'SCADUTO IL 30 GIUGNO 2026. Sollecito inviato via WhatsApp.',
    createdAt: '2025-06-30T09:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'doc-6',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    category: 'consenso privacy',
    title: 'Modulo GDPR Privacy & Trattamento Dati Personali',
    file: createSampleFile('Modulo_GDPR_Marco_Rossi.pdf', 'application/pdf', 450000, 'consents', 'athletes/ath-1/gdpr.pdf'),
    uploadDate: '2024-01-15',
    author: 'Salvatore Carotenuto',
    authorRole: 'Owner',
    visibility: 'pubblico',
    notes: 'Accettato consenso marketing e foto.',
    createdAt: '2024-01-15T09:35:00.000Z',
    updatedAt: '2024-01-15T09:35:00.000Z',
  },
  {
    id: 'doc-7',
    athleteId: 'ath-5',
    athleteName: 'Alessandro Conti',
    category: 'fotografia',
    title: 'Foto Valutazione Posturale Iniziale (Frontale & Sagittale)',
    file: createSampleFile('Foto_Posturale_Conti.jpg', 'image/jpeg', 2450000, 'documents', 'athletes/ath-5/foto_postura.jpg'),
    uploadDate: '2026-07-25',
    author: 'Luca Bianchi',
    authorRole: 'Coach',
    visibility: 'atleta_coach',
    notes: 'Rilevata leggera asimmetria spalla destra.',
    createdAt: '2026-07-25T15:00:00.000Z',
    updatedAt: '2026-07-25T15:00:00.000Z',
  }
];

const INITIAL_CONSENTS: AthleteConsent[] = [
  {
    id: 'cons-1',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    consentType: 'Privacy GDPR & Trattamento Dati',
    date: '2024-01-15',
    status: 'attivo',
    linkedDocumentId: 'doc-6',
    linkedDocumentTitle: 'Modulo GDPR Privacy & Trattamento Dati Personali',
    notes: 'Firmato digitalmente all\'iscrizione.',
    createdAt: '2024-01-15T09:35:00.000Z',
    updatedAt: '2024-01-15T09:35:00.000Z',
  },
  {
    id: 'cons-2',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    consentType: 'Uso Immagini & Materiale Fotografico',
    date: '2024-01-15',
    status: 'attivo',
    linkedDocumentId: 'doc-6',
    linkedDocumentTitle: 'Modulo GDPR Privacy & Trattamento Dati Personali',
    notes: 'Autorizzata pubblicazione foto e video social per gare FIPL.',
    createdAt: '2024-01-15T09:35:00.000Z',
    updatedAt: '2024-01-15T09:35:00.000Z',
  },
  {
    id: 'cons-3',
    athleteId: 'ath-2',
    athleteName: 'Elena Bianchi',
    consentType: 'Privacy GDPR & Trattamento Dati',
    date: '2024-03-10',
    status: 'attivo',
    linkedDocumentId: 'doc-3',
    linkedDocumentTitle: 'Certificato Medico Non Agonistico con ECG',
    notes: 'Inclusa liberatoria per invio schede via email.',
    createdAt: '2024-03-10T11:30:00.000Z',
    updatedAt: '2024-03-10T11:30:00.000Z',
  },
  {
    id: 'cons-4',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    consentType: 'Uso Immagini & Materiale Fotografico',
    date: '2024-02-01',
    status: 'revocato',
    isRevoked: true,
    revocationDate: '2026-07-20',
    revocationReason: 'Richiesta esplicita dell\'atleta per cancellazione immagini promozionali.',
    notes: 'Consenso precedentemente attivo, revocato via email.',
    createdAt: '2024-02-01T15:00:00.000Z',
    updatedAt: '2026-07-20T16:00:00.000Z',
  },
  {
    id: 'cons-5',
    athleteId: 'ath-9',
    athleteName: 'Davide Galli',
    consentType: 'Privacy GDPR & Trattamento Dati',
    date: '2026-07-01',
    status: 'in attesa',
    notes: 'In attesa di firma della nuova informativa aggiornata.',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  }
];

export const DocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { athletes } = useAthletes();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useToast();

  const [documents, setDocuments] = useState<AthleteDocument[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DOCS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading documents from storage', e);
    }
    return INITIAL_DOCUMENTS;
  });

  const [consents, setConsents] = useState<AthleteConsent[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CONSENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading consents from storage', e);
    }
    return INITIAL_CONSENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(documents));
    } catch (e) {
      console.error('Error saving documents to storage', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CONSENTS_KEY, JSON.stringify(consents));
    } catch (e) {
      console.error('Error saving consents to storage', e);
    }
  }, [consents]);

  // Simulated Supabase Storage upload
  const uploadFileToSupabaseStorage = async (file: File, category: DocumentCategory, athleteId: string): Promise<StoredFile> => {
    const bucketName = category === 'certificato medico' ? 'medical' : category === 'consenso privacy' ? 'consents' : 'documents';
    const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `athletes/${athleteId}/${Date.now()}_${sanitizeName}`;

    // Convert file to Base64/DataURL for realistic local preview
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    return {
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: dataUrl,
      bucket: bucketName,
      path: path,
    };
  };

  const addDocument = (data: {
    athleteId: string;
    athleteName: string;
    category: DocumentCategory;
    title: string;
    file: StoredFile;
    uploadDate?: string;
    expiryDate?: string;
    author?: string;
    authorRole?: string;
    visibility?: DocumentVisibility;
    notes?: string;
  }): AthleteDocument => {
    const today = new Date().toISOString().split('T')[0];
    const newDoc: AthleteDocument = {
      id: `doc-${Date.now()}`,
      athleteId: data.athleteId,
      athleteName: data.athleteName,
      category: data.category,
      title: data.title,
      file: data.file,
      uploadDate: data.uploadDate || today,
      expiryDate: data.expiryDate || undefined,
      author: data.author || user?.fullName || 'Staff Administrator',
      authorRole: data.authorRole || user?.role || 'Staff',
      visibility: data.visibility || 'pubblico',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    showSuccess('Documento Caricato', `Salvato con successo su Supabase Storage (${newDoc.file.bucket}).`);
    return newDoc;
  };

  const updateDocument = (id: string, data: Partial<AthleteDocument>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d))
    );
    showSuccess('Documento Aggiornato', 'Le modifiche al documento sono state salvate.');
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showInfo('Documento Eliminato', 'Il file è stato rimosso dallo storage Supabase.');
  };

  const addConsent = (data: {
    athleteId: string;
    athleteName: string;
    consentType: ConsentType | string;
    date?: string;
    status: ConsentStatus;
    linkedDocumentId?: string;
    linkedDocumentTitle?: string;
    notes?: string;
  }): AthleteConsent => {
    const today = new Date().toISOString().split('T')[0];
    const newConsent: AthleteConsent = {
      id: `cons-${Date.now()}`,
      athleteId: data.athleteId,
      athleteName: data.athleteName,
      consentType: data.consentType,
      date: data.date || today,
      status: data.status,
      linkedDocumentId: data.linkedDocumentId,
      linkedDocumentTitle: data.linkedDocumentTitle,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConsents((prev) => [newConsent, ...prev]);
    showSuccess('Consenso Registrato', `Consenso "${newConsent.consentType}" registrato per ${newConsent.athleteName}.`);
    return newConsent;
  };

  const updateConsent = (id: string, data: Partial<AthleteConsent>) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
    showSuccess('Consenso Aggiornato', 'Stato del consenso modificato.');
  };

  const revokeConsent = (id: string, revocationReason: string, revocationDate?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setConsents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'revocato',
              isRevoked: true,
              revocationDate: revocationDate || today,
              revocationReason,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    showInfo('Consenso Revocato', 'La revoca è stata registrata correttamente.');
  };

  const deleteConsent = (id: string) => {
    setConsents((prev) => prev.filter((c) => c.id !== id));
    showInfo('Consenso Eliminato', 'Record di consenso rimosso.');
  };

  // Dynamic Alerts Computation:
  // 1. Certificati Scaduti
  // 2. Documenti in Scadenza (nei prossimi 30 giorni)
  // 3. Documenti Mancanti (Atleti attivi senza contratto o senza certificato o senza documenti)
  // 4. Consensi Mancanti (Atleti attivi senza consenso privacy o in attesa/revocato)
  const alerts = useMemo<DocumentAlert[]>(() => {
    const alertList: DocumentAlert[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    const thirtyDaysAhead = new Date(today.valueOf() + 30 * 86400000);

    // Filter non-archived athletes
    const activeAthletes = athletes.filter((a) => a.status !== 'archiviato' && a.status !== 'inattivo');

    // 1. Check Document Expiration & Expired Certificates
    documents.forEach((doc) => {
      if (doc.expiryDate) {
        const expDate = new Date(doc.expiryDate);

        if (expDate < today) {
          if (doc.category === 'certificato medico') {
            alertList.push({
              id: `alert-cert-scaduto-${doc.id}`,
              type: 'certificato_scaduto',
              severity: 'critico',
              athleteId: doc.athleteId,
              athleteName: doc.athleteName,
              title: `Certificato Medico Scaduto`,
              description: `Il certificato medico per ${doc.athleteName} è scaduto il ${doc.expiryDate}. L'atleta non può svolgere attività agonistica.`,
              documentCategory: 'certificato medico',
              dueDate: doc.expiryDate,
              actionLabel: 'Carica Nuovo Certificato',
            });
          } else {
            alertList.push({
              id: `alert-doc-scaduto-${doc.id}`,
              type: 'documento_in_scadenza',
              severity: 'warning',
              athleteId: doc.athleteId,
              athleteName: doc.athleteName,
              title: `Documento Scaduto (${doc.category})`,
              description: `"${doc.title}" di ${doc.athleteName} è scaduto il ${doc.expiryDate}.`,
              documentCategory: doc.category,
              dueDate: doc.expiryDate,
              actionLabel: 'Aggiorna Documento',
            });
          }
        } else if (expDate <= thirtyDaysAhead) {
          const daysLeft = Math.ceil((expDate.valueOf() - today.valueOf()) / 86400000);
          alertList.push({
            id: `alert-doc-scadenza-${doc.id}`,
            type: 'documento_in_scadenza',
            severity: daysLeft <= 7 ? 'critico' : 'warning',
            athleteId: doc.athleteId,
            athleteName: doc.athleteName,
            title: `Documento in Scadenza tra ${daysLeft} gg`,
            description: `"${doc.title}" di ${doc.athleteName} scadrà il ${doc.expiryDate}.`,
            documentCategory: doc.category,
            dueDate: doc.expiryDate,
            actionLabel: 'Rinnova Documento',
          });
        }
      }
    });

    // 2. Check Missing Documents and Missing Consents for Active/Onboarding Athletes
    activeAthletes.forEach((athlete) => {
      const athleteDocs = documents.filter((d) => d.athleteId === athlete.id);
      const athleteConsents = consents.filter((c) => c.athleteId === athlete.id);

      // Check if athlete has Medical Certificate
      const hasMedCert = athleteDocs.some((d) => d.category === 'certificato medico');
      if (!hasMedCert) {
        alertList.push({
          id: `alert-missing-medcert-${athlete.id}`,
          type: 'documento_mancante',
          severity: 'critico',
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          title: 'Certificato Medico Mancante',
          description: `Nessun certificato medico caricato nel sistema per ${athlete.firstName} ${athlete.lastName}.`,
          documentCategory: 'certificato medico',
          actionLabel: 'Carica Certificato',
        });
      }

      // Check if athlete has Contract
      const hasContract = athleteDocs.some((d) => d.category === 'contratto');
      if (!hasContract && (athlete.status === 'attivo' || athlete.status === 'onboarding')) {
        alertList.push({
          id: `alert-missing-contract-${athlete.id}`,
          type: 'documento_mancante',
          severity: 'warning',
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          title: 'Contratto Non Firmato / Mancante',
          description: `Manca il contratto d'iscrizione caricato per ${athlete.firstName} ${athlete.lastName}.`,
          documentCategory: 'contratto',
          actionLabel: 'Carica Contratto',
        });
      }

      // Check Active Privacy Consents
      const hasActivePrivacyConsent = athleteConsents.some(
        (c) => c.consentType.toLowerCase().includes('privacy') && c.status === 'attivo'
      );
      if (!hasActivePrivacyConsent) {
        alertList.push({
          id: `alert-missing-consent-${athlete.id}`,
          type: 'consenso_mancante',
          severity: 'critico',
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          title: 'Consenso Privacy Mancante o Non Attivo',
          description: `Nessun consenso privacy GDPR attivo registrato per ${athlete.firstName} ${athlete.lastName}.`,
          actionLabel: 'Registra Consenso',
        });
      }
    });

    return alertList;
  }, [documents, consents, athletes]);

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        consents,
        alerts,
        addDocument,
        updateDocument,
        deleteDocument,
        addConsent,
        updateConsent,
        revokeConsent,
        deleteConsent,
        uploadFileToSupabaseStorage,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments deve essere utilizzato all\'interno di un DocumentsProvider');
  }
  return context;
};
