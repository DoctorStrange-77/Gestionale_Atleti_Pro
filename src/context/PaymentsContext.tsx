import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentRecord, FinancialAuditLog, PaymentMethod, PaymentStatus } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useAthletes } from './AthletesContext';

import { useSubscriptions } from './SubscriptionsContext';
import { runSystemStatusRecalculation, SystemRecalculationResult } from '../lib/statusEngine';
import { STORAGE_KEYS } from '../config/storageKeys';

interface QuickRegisterData {
  atletaId?: string;
  abbonamentoId?: string;
  paymentId?: string;
}

interface PaymentsContextType {
  payments: PaymentRecord[];
  auditLogs: FinancialAuditLog[];
  isQuickRegisterOpen: boolean;
  quickRegisterData: QuickRegisterData | null;
  openQuickRegisterModal: (initialData?: QuickRegisterData) => void;
  closeQuickRegisterModal: () => void;
  registerPayment: (
    paymentId: string,
    updates: {
      importoPagato: number;
      metodoDiPagamento?: PaymentMethod;
      dataDelPagamento?: string;
      stato?: PaymentStatus;
      riferimentoTransazione?: string;
      numeroRicevuta?: string;
      riferimentoFattura?: string;
      note?: string;
      allegato?: string;
      utenteCheHaRegistrato?: string;
    },
    authorName?: string
  ) => void;
  savePaymentRecord: (
    payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt' | 'importoResiduo'> & { id?: string },
    authorName?: string
  ) => PaymentRecord;
  createPaymentRecord: (
    payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt' | 'importoResiduo'> & { id?: string },
    authorName?: string
  ) => PaymentRecord;
  addAuditLog: (entry: Omit<FinancialAuditLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => FinancialAuditLog;
  deletePaymentRecord: (id: string, authorName?: string) => void;
  getPaymentsByAthleteId: (athleteId: string) => PaymentRecord[];
  getPaymentsBySubscriptionId: (subscriptionId: string) => PaymentRecord[];
  triggerSystemStatusRecalculation: (manualAuthor?: string) => Promise<SystemRecalculationResult>;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    atletaId: 'ath-1',
    atletaNome: 'Marco Rossi',
    abbonamentoId: 'sub-1',
    abbonamentoNome: 'Abbonamento Annuale Gold Power',
    importoPrevisto: 300,
    importoPagato: 200,
    importoResiduo: 100,
    dataDiScadenza: '2026-07-25',
    dataDelPagamento: '2026-07-26',
    numeroDellaRata: 'Rata 7 di 12',
    metodoDiPagamento: 'bonifico',
    stato: 'pagato parzialmente',
    riferimentoTransazione: 'TRX-982301',
    numeroRicevuta: 'RIC-2026-089',
    riferimentoFattura: 'FAT-2026-042',
    note: 'Versati €200 in acconto con bonifico bancario, residuo €100 da saldare entro il 10 agosto.',
    allegato: 'ricevuta_bonifico_200.pdf',
    utenteCheHaRegistrato: 'Marco Bianchi (Segreteria)',
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-26T14:30:00.000Z',
  },
  {
    id: 'pay-2',
    atletaId: 'ath-2',
    atletaNome: 'Elena Bianchi',
    abbonamentoId: 'sub-2',
    abbonamentoNome: 'Carnet 10 Consulenze Personal Training',
    importoPrevisto: 400,
    importoPagato: 400,
    importoResiduo: 0,
    dataDiScadenza: '2026-02-15',
    dataDelPagamento: '2026-02-15',
    numeroDellaRata: 'Quota Unica',
    metodoDiPagamento: 'carta',
    stato: 'pagato',
    riferimentoTransazione: 'POS-774910',
    numeroRicevuta: 'RIC-2026-014',
    riferimentoFattura: 'FAT-2026-010',
    note: 'Pagamento saldato interamente tramite POS in reception.',
    allegato: 'scontrino_pos_400.pdf',
    utenteCheHaRegistrato: 'Sara Neri (Amministrazione)',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:05:00.000Z',
  },
  {
    id: 'pay-3',
    atletaId: 'ath-3',
    atletaNome: 'Giuseppe Verdi',
    abbonamentoId: 'sub-3',
    abbonamentoNome: 'Pacchetto Trimestrale Invernale',
    importoPrevisto: 180,
    importoPagato: 0,
    importoResiduo: 180,
    dataDiScadenza: '2026-07-10',
    numeroDellaRata: 'Rata 2 di 3',
    metodoDiPagamento: 'contanti',
    stato: 'scaduto',
    riferimentoTransazione: '',
    numeroRicevuta: '',
    riferimentoFattura: '',
    note: 'Prima sollecitazione inviata via SMS/WhatsApp il 15/07.',
    allegato: '',
    utenteCheHaRegistrato: 'Marco Bianchi (Segreteria)',
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-15T11:20:00.000Z',
  },
  {
    id: 'pay-4',
    atletaId: 'ath-4',
    atletaNome: 'Francesca Neri',
    abbonamentoId: 'sub-4',
    abbonamentoNome: 'Abbonamento Semestrale Fitness',
    importoPrevisto: 250,
    importoPagato: 100,
    importoResiduo: 150,
    dataDiScadenza: '2026-08-05',
    dataDelPagamento: '2026-07-28',
    numeroDellaRata: 'Acconto Iniziale',
    metodoDiPagamento: 'PayPal',
    stato: 'pagato parzialmente',
    riferimentoTransazione: 'PAYPAL-98124',
    numeroRicevuta: 'RIC-2026-092',
    riferimentoFattura: '',
    note: 'Acconto versato online via PayPal.',
    allegato: 'paypal_confirmation.pdf',
    utenteCheHaRegistrato: 'Sistema Online',
    createdAt: '2026-07-28T16:00:00.000Z',
    updatedAt: '2026-07-28T16:00:00.000Z',
  },
  {
    id: 'pay-5',
    atletaId: 'ath-1',
    atletaNome: 'Marco Rossi',
    abbonamentoId: 'sub-1',
    abbonamentoNome: 'Abbonamento Annuale Gold Power',
    importoPrevisto: 62.5,
    importoPagato: 0,
    importoResiduo: 62.5,
    dataDiScadenza: '2026-08-01',
    numeroDellaRata: 'Rata 8 di 12',
    metodoDiPagamento: 'addebito automatico',
    stato: 'in scadenza',
    riferimentoTransazione: '',
    numeroRicevuta: '',
    riferimentoFattura: '',
    note: 'In scadenza addebito automatico inizio mese.',
    allegato: '',
    utenteCheHaRegistrato: 'Sistema',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  },
];

const SEED_AUDIT_LOGS: FinancialAuditLog[] = [
  {
    id: 'audit-1',
    pagamentoId: 'pay-1',
    atletaId: 'ath-1',
    atletaNome: 'Marco Rossi',
    abbonamentoNome: 'Abbonamento Annuale Gold Power',
    azione: 'Registrazione Pagamento Parziale',
    valorePrecedente: 'Importo Pagato: € 0,00 | Residuo: € 300,00 | Stato: da pagare',
    nuovoValore: 'Importo Pagato: € 200,00 | Residuo: € 100,00 | Stato: pagato parzialmente',
    autore: 'Marco Bianchi (Segreteria)',
    data: '2026-07-26',
    ora: '14:30:00',
    createdAt: '2026-07-26T14:30:00.000Z',
  },
  {
    id: 'audit-2',
    pagamentoId: 'pay-2',
    atletaId: 'ath-2',
    atletaNome: 'Elena Bianchi',
    abbonamentoNome: 'Carnet 10 Consulenze Personal Training',
    azione: 'Incasso Saldo Completo',
    valorePrecedente: 'Importo Pagato: € 0,00 | Residuo: € 400,00 | Stato: in scadenza',
    nuovoValore: 'Importo Pagato: € 400,00 | Residuo: € 0,00 | Stato: pagato',
    autore: 'Sara Neri (Amministrazione)',
    data: '2026-02-15',
    ora: '09:05:00',
    createdAt: '2026-02-15T09:05:00.000Z',
  },
];

export const PaymentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : SEED_PAYMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FINANCIAL_AUDIT);
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [quickRegisterData, setQuickRegisterData] = useState<QuickRegisterData | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();
  const { athletes, addTimelineEvent, bulkSetAthletes } = useAthletes();
  const { subscriptions, bulkSetSubscriptions } = useSubscriptions();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const triggerSystemStatusRecalculation = async (
    manualAuthor?: string
  ): Promise<SystemRecalculationResult> => {
    const author = getAuthorName(manualAuthor);
    const result = await runSystemStatusRecalculation({
      payments,
      subscriptions,
      athletes,
      authorName: author,
    });

    if (result.stats.updatedPaymentsCount > 0) {
      setPayments(result.updatedPayments);
    }
    if (result.stats.updatedSubscriptionsCount > 0) {
      bulkSetSubscriptions(result.updatedSubscriptions);
    }
    if (result.stats.updatedAthletesCount > 0) {
      bulkSetAthletes(result.updatedAthletes);
    }
    if (result.newAuditLogs.length > 0) {
      setAuditLogs((prev) => [...result.newAuditLogs, ...prev]);
    }

    const { updatedPaymentsCount, updatedSubscriptionsCount, updatedAthletesCount } = result.stats;
    const totalChanges = updatedPaymentsCount + updatedSubscriptionsCount + updatedAthletesCount;

    if (totalChanges > 0) {
      showToast(
        `Ricalcolo completato: ${updatedPaymentsCount} pagamenti, ${updatedSubscriptionsCount} abbonamenti, ${updatedAthletesCount} atleti aggiornati`,
        'success'
      );
    } else {
      showToast('Tutti gli stati sono già aggiornati e in regola', 'info');
    }

    return result.stats;
  };

  // Run automatic calculation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runSystemStatusRecalculation({
        payments,
        subscriptions,
        athletes,
        authorName: 'Motore di Calcolo Automatico',
      }).then((result) => {
        if (result.stats.updatedPaymentsCount > 0) {
          setPayments(result.updatedPayments);
        }
        if (result.stats.updatedSubscriptionsCount > 0) {
          bulkSetSubscriptions(result.updatedSubscriptions);
        }
        if (result.stats.updatedAthletesCount > 0) {
          bulkSetAthletes(result.updatedAthletes);
        }
        if (result.newAuditLogs.length > 0) {
          setAuditLogs((prev) => [...result.newAuditLogs, ...prev]);
        }
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate suspended installments as soon as the nearest pause expires,
  // even when the application remains open across the end of the pause.
  useEffect(() => {
    const now = Date.now();
    const resumeTimes = payments
      .filter((payment) => payment.suspendedUntil)
      .map((payment) => new Date(`${payment.suspendedUntil}T23:59:59.999`).getTime())
      .filter((resumeAt) => Number.isFinite(resumeAt) && resumeAt > now);
    if (resumeTimes.length === 0) return;

    const nextResumeAt = Math.min(...resumeTimes);
    const maxTimeout = 2_147_000_000;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleRecalculation = () => {
      const remaining = nextResumeAt - Date.now();
      if (remaining > maxTimeout) {
        timer = setTimeout(scheduleRecalculation, maxTimeout);
        return;
      }
      timer = setTimeout(() => {
        void triggerSystemStatusRecalculation('Motore di Calcolo Fine Sospensione');
      }, Math.max(0, remaining));
    };
    scheduleRecalculation();

    return () => clearTimeout(timer);
    // The timer must be rescheduled only when the payment suspension dates change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  const openQuickRegisterModal = (initialData?: QuickRegisterData) => {
    setQuickRegisterData(initialData || null);
    setIsQuickRegisterOpen(true);
  };

  const closeQuickRegisterModal = () => {
    setIsQuickRegisterOpen(false);
    setQuickRegisterData(null);
  };

  const getAuthorName = (overrideAuthor?: string) => {
    if (overrideAuthor) return overrideAuthor;
    if (user?.fullName) {
      const roleText = user.role ? ` (${user.role.toUpperCase()})` : '';
      return `${user.fullName}${roleText}`;
    }
    return 'Amministratore';
  };

  const createAuditEntry = (
    pagamentoId: string,
    atletaId: string,
    atletaNome: string,
    abbonamentoNome: string | undefined,
    azione: string,
    valorePrecedente: string,
    nuovoValore: string,
    authorName?: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const author = getAuthorName(authorName);

    const newLog: FinancialAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pagamentoId,
      atletaId,
      atletaNome,
      abbonamentoNome,
      azione,
      valorePrecedente,
      nuovoValore,
      autore: author,
      data: dateStr,
      ora: timeStr,
      createdAt: now.toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    // Add to athlete timeline
    addTimelineEvent(atletaId, {
      type: 'pagamento',
      title: `${azione}: ${nuovoValore}`,
      description: `Operazione effettuata da ${author}. Precedente: [${valorePrecedente}]`,
      authorName: author,
      date: dateStr,
      time: timeStr.substring(0, 5),
    });

    return newLog;
  };

  const savePaymentRecord = (
    data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt' | 'importoResiduo'> & { id?: string },
    authorName?: string
  ): PaymentRecord => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const importoPrevisto = Number(data.importoPrevisto) || 0;
    const importoPagato = Number(data.importoPagato) || 0;
    const importoRimborsato = Math.max(0, Number(data.importoRimborsato) || 0);
    const importoResiduo = Math.max(0, importoPrevisto - importoPagato);

    let calculatedStatus: PaymentStatus = data.stato;
    if (!calculatedStatus) {
      if (importoPagato >= importoPrevisto && importoPrevisto > 0) {
        calculatedStatus = 'pagato';
      } else if (importoPagato > 0 && importoPagato < importoPrevisto) {
        calculatedStatus = 'pagato parzialmente';
      } else {
        calculatedStatus = 'da pagare';
      }
    }

    const isEdit = Boolean(data.id);
    const existingPayment = isEdit ? payments.find((p) => p.id === data.id) : null;

    const paymentId = data.id || `pay-${Date.now()}`;
    const author = getAuthorName(authorName || data.utenteCheHaRegistrato);

    const recordToSave: PaymentRecord = {
      id: paymentId,
      atletaId: data.atletaId,
      atletaNome: data.atletaNome,
      abbonamentoId: data.abbonamentoId,
      abbonamentoNome: data.abbonamentoNome,
      importoPrevisto,
      importoPagato,
      importoRimborsato,
      importoResiduo,
      dataDiScadenza: data.dataDiScadenza || dateStr,
      suspendedFrom: data.suspendedFrom,
      suspendedUntil: data.suspendedUntil,
      dataDelPagamento: data.dataDelPagamento || (importoPagato > 0 ? dateStr : undefined),
      numeroDellaRata: data.numeroDellaRata || 'Quota Unica',
      metodoDiPagamento: data.metodoDiPagamento || 'contanti',
      stato: calculatedStatus,
      riferimentoTransazione: data.riferimentoTransazione || '',
      numeroRicevuta: data.numeroRicevuta || '',
      riferimentoFattura: data.riferimentoFattura || '',
      note: data.note || '',
      allegato: data.allegato || '',
      utenteCheHaRegistrato: author,
      createdAt: existingPayment ? existingPayment.createdAt : now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const valorePrecStr = existingPayment
      ? `Previsto: €${existingPayment.importoPrevisto.toFixed(2)} | Pagato: €${existingPayment.importoPagato.toFixed(2)} | Rimborsato: €${(existingPayment.importoRimborsato || 0).toFixed(2)} | Residuo: €${existingPayment.importoResiduo.toFixed(2)} | Stato: ${existingPayment.stato} | Scadenza: ${existingPayment.dataDiScadenza} | Sospensione: ${existingPayment.suspendedFrom || 'no'} → ${existingPayment.suspendedUntil || 'no'}`
      : 'Nessun registro precedente (Nuovo inserimento)';

    const nuovoValoreStr = `Previsto: €${recordToSave.importoPrevisto.toFixed(2)} | Pagato: €${recordToSave.importoPagato.toFixed(2)} | Rimborsato: €${(recordToSave.importoRimborsato || 0).toFixed(2)} | Residuo: €${recordToSave.importoResiduo.toFixed(2)} | Stato: ${recordToSave.stato} | Scadenza: ${recordToSave.dataDiScadenza} | Sospensione: ${recordToSave.suspendedFrom || 'no'} → ${recordToSave.suspendedUntil || 'no'}`;

    const azione = isEdit ? 'Modifica Registrazione Economica' : 'Registrazione Nuovo Pagamento';

    if (isEdit) {
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? recordToSave : p)));
    } else {
      setPayments((prev) => [recordToSave, ...prev]);
    }

    createAuditEntry(
      paymentId,
      recordToSave.atletaId,
      recordToSave.atletaNome,
      recordToSave.abbonamentoNome,
      azione,
      valorePrecStr,
      nuovoValoreStr,
      author
    );

    showToast(
      isEdit ? 'Pagamento aggiornato con successo' : 'Pagamento registrato con successo!',
      'success'
    );

    return recordToSave;
  };

  const registerPayment = (
    paymentId: string,
    updates: {
      importoPagato: number;
      metodoDiPagamento?: PaymentMethod;
      dataDelPagamento?: string;
      stato?: PaymentStatus;
      riferimentoTransazione?: string;
      numeroRicevuta?: string;
      riferimentoFattura?: string;
      note?: string;
      allegato?: string;
      utenteCheHaRegistrato?: string;
    },
    authorName?: string
  ) => {
    const target = payments.find((p) => p.id === paymentId);
    if (!target) {
      showToast('Pagamento non trovato', 'error');
      return;
    }

    savePaymentRecord(
      {
        ...target,
        ...updates,
      },
      authorName
    );
  };

  const deletePaymentRecord = (id: string, authorName?: string) => {
    const target = payments.find((p) => p.id === id);
    if (!target) return;

    const author = getAuthorName(authorName);
    const valorePrecStr = `Previsto: €${target.importoPrevisto.toFixed(2)} | Pagato: €${target.importoPagato.toFixed(2)} | Stato: ${target.stato}`;
    const nuovoValoreStr = 'REGISTRO ELIMINATO';

    setPayments((prev) => prev.filter((p) => p.id !== id));

    createAuditEntry(
      id,
      target.atletaId,
      target.atletaNome,
      target.abbonamentoNome,
      'Eliminazione Pagamento',
      valorePrecStr,
      nuovoValoreStr,
      author
    );

    showToast('Pagamento eliminato', 'info');
  };

  const getPaymentsByAthleteId = (athleteId: string) => {
    return payments.filter((p) => p.atletaId === athleteId);
  };

  const getPaymentsBySubscriptionId = (subscriptionId: string) => {
    return payments.filter((p) => p.abbonamentoId === subscriptionId);
  };

  const createPaymentRecord = (
    data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt' | 'importoResiduo'> & { id?: string },
    authorName?: string
  ): PaymentRecord => {
    return savePaymentRecord(data, authorName);
  };

  const addAuditLog = (entry: Omit<FinancialAuditLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): FinancialAuditLog => {
    const now = new Date();
    const newLog: FinancialAuditLog = {
      id: entry.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pagamentoId: entry.pagamentoId,
      atletaId: entry.atletaId,
      atletaNome: entry.atletaNome,
      abbonamentoNome: entry.abbonamentoNome,
      azione: entry.azione,
      valorePrecedente: entry.valorePrecedente,
      nuovoValore: entry.nuovoValore,
      autore: entry.autore || getAuthorName(),
      data: entry.data || now.toISOString().split('T')[0],
      ora: entry.ora || now.toTimeString().split(' ')[0],
      createdAt: entry.createdAt || now.toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        auditLogs,
        isQuickRegisterOpen,
        quickRegisterData,
        openQuickRegisterModal,
        closeQuickRegisterModal,
        registerPayment,
        savePaymentRecord,
        createPaymentRecord,
        addAuditLog,
        deletePaymentRecord,
        getPaymentsByAthleteId,
        getPaymentsBySubscriptionId,
        triggerSystemStatusRecalculation,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
};
