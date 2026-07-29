import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AthleteRenewal,
  RenewalStatus,
  SubscriptionPause,
  PauseExpiryOption,
  PauseInstallmentsOption,
  AthletePaymentStatus,
} from '../types';
import { useAthletes } from './AthletesContext';
import { useSubscriptions } from './SubscriptionsContext';
import { usePayments } from './PaymentsContext';
import { useToast } from './ToastContext';
import { calculateAthleteFinancialStatus } from '../lib/statusEngine';

interface ConfirmRenewalParams {
  renewalId: string;
  actionType: 'proroga' | 'nuovo';
  packageId?: string;
  packageName: string;
  listPrice: number;
  discountFixed: number;
  discountPercent: number;
  agreedPrice: number;
  startDate: string;
  durationValue: number;
  durationUnit: 'giorni' | 'settimane' | 'mensile' | 'annuale' | 'numero_ingressi' | 'numero_consulenze';
  endDate: string;
  paymentFrequency: 'unica_soluzione' | 'mensile' | 'bimestrale' | 'trimestrale' | 'semestrale' | 'personalizzato';
  installmentCount: number;
  downPayment: number;
  firstInstallmentDate: string;
  notes?: string;
}

interface ConfirmPauseParams {
  subscriptionId: string;
  athleteId: string;
  athleteName: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  reason: string;
  authorization: string;
  notes?: string;
  expiryOption: PauseExpiryOption;
  installmentsOption: PauseInstallmentsOption;
}

interface RenewalsContextType {
  renewals: AthleteRenewal[];
  pauses: SubscriptionPause[];
  addRenewal: (data: Omit<AthleteRenewal, 'id' | 'createdAt' | 'updatedAt'>) => AthleteRenewal;
  updateRenewal: (id: string, data: Partial<AthleteRenewal>) => void;
  updateRenewalStatus: (id: string, newStatus: RenewalStatus, note?: string) => void;
  deleteRenewal: (id: string) => void;
  confirmRenewalWorkflow: (params: ConfirmRenewalParams) => Promise<boolean>;
  addPause: (params: ConfirmPauseParams) => Promise<SubscriptionPause>;
  updatePause: (id: string, data: Partial<SubscriptionPause>) => void;
  deletePause: (id: string) => void;
  getPausesBySubscriptionId: (subId: string) => SubscriptionPause[];
  getPausesByAthleteId: (athleteId: string) => SubscriptionPause[];
}

const RenewalsContext = createContext<RenewalsContextType | undefined>(undefined);

const SEED_RENEWALS: AthleteRenewal[] = [
  {
    id: 'ren-1',
    athleteId: 'ath-2',
    athleteName: 'Elena Bianchi',
    subscriptionId: 'sub-2',
    currentPackageName: 'Carnet 10 Consulenze Personal Training',
    price: 400,
    coachName: 'Luca Bianchi (Coach)',
    endDate: '2026-08-05',
    daysRemaining: 7,
    paymentStatus: 'pagamento imminente',
    lastCommunicationDate: '2026-07-25',
    lastCommunicationNote: 'WhatsApp: Proposta rinnovo pacchetto 10 ingressi inviata.',
    nextAction: 'Inviare riepilogo offerta scontata per il mese di Agosto',
    nextActionDate: '2026-07-30',
    responsibleName: 'Luca Bianchi (Coach)',
    status: 'in valutazione',
    notes: 'Ha chiesto se è possibile dilazionare il pagamento in 2 rate.',
    createdAt: '2026-07-20T10:00:00.000Z',
    updatedAt: '2026-07-25T14:00:00.000Z',
  },
  {
    id: 'ren-2',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    subscriptionId: 'sub-3',
    currentPackageName: 'Semestrale Forza & Massa',
    price: 540,
    coachName: 'Salvatore Carotenuto',
    endDate: '2026-07-15',
    daysRemaining: -14,
    paymentStatus: 'pagamento scaduto',
    lastCommunicationDate: '2026-07-20',
    lastCommunicationNote: 'Telefono: Avvisato della rata scaduta e chiesto del rinnovo.',
    nextAction: 'Chiamata di verifica e proposta rinnovo con dilazione',
    nextActionDate: '2026-07-31',
    responsibleName: 'Salvatore Carotenuto',
    status: 'da contattare',
    notes: 'Motivo del ritardo: trasferta di lavoro a Napoli.',
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-20T11:30:00.000Z',
  },
  {
    id: 'ren-3',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    subscriptionId: 'sub-1',
    currentPackageName: 'Abbonamento Annuale Gold Power',
    price: 780,
    coachName: 'Salvatore Carotenuto',
    endDate: '2026-12-31',
    daysRemaining: 155,
    paymentStatus: 'regolare',
    lastCommunicationDate: '2026-06-15',
    lastCommunicationNote: 'Check-in mensile: Molto soddisfatto del programma.',
    nextAction: 'Proporre rinnovo anticipato bloccando il prezzo a Novembre',
    nextActionDate: '2026-11-01',
    responsibleName: 'Salvatore Carotenuto',
    status: 'interessato',
    notes: 'Atleta storico molto fedele.',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-15T10:00:00.000Z',
  },
  {
    id: 'ren-4',
    athleteId: 'ath-5',
    athleteName: 'Alessandro Conti',
    subscriptionId: 'sub-5',
    currentPackageName: 'Trimestrale Calisthenics Skills',
    price: 350,
    coachName: 'Luca Bianchi (Coach)',
    endDate: '2026-08-10',
    daysRemaining: 12,
    paymentStatus: 'regolare',
    lastCommunicationDate: '2026-07-28',
    lastCommunicationNote: 'Email: Inviata proposta passaggio a Semestrale.',
    nextAction: 'Verificare risposta email e fissare appuntamento in sede',
    nextActionDate: '2026-08-01',
    responsibleName: 'Luca Bianchi (Coach)',
    status: 'contattato',
    notes: 'Ha espresso interesse ad aumentare i giorni di allenamento.',
    createdAt: '2026-07-25T12:00:00.000Z',
    updatedAt: '2026-07-28T16:00:00.000Z',
  },
  {
    id: 'ren-5',
    athleteId: 'ath-4',
    athleteName: 'Sofia Moretti',
    subscriptionId: undefined,
    currentPackageName: 'Richiesta Info / Consulenza Iniziale',
    price: 90,
    coachName: 'Marco Rossi (Admin)',
    endDate: '2026-08-15',
    daysRemaining: 17,
    paymentStatus: 'nessun pagamento programmato',
    lastCommunicationDate: '2026-07-28',
    lastCommunicationNote: 'WhatsApp: Inviato preventivo personalizzato semestrale.',
    nextAction: 'Chiamata di follow-up per conferma prima prova',
    nextActionDate: '2026-07-30',
    responsibleName: 'Marco Rossi (Admin)',
    status: 'da contattare',
    notes: 'Potenziale nuova iscritta.',
    createdAt: '2026-07-28T10:00:00.000Z',
    updatedAt: '2026-07-28T10:00:00.000Z',
  },
];

const SEED_PAUSES: SubscriptionPause[] = [
  {
    id: 'pause-1',
    subscriptionId: 'sub-1',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    startDate: '2026-05-10',
    expectedEndDate: '2026-05-24',
    actualEndDate: '2026-05-24',
    reason: 'Vacanze e trasferta lavorativa all\'estero',
    pauseDays: 14,
    authorization: 'Salvatore Carotenuto (Direzione)',
    notes: 'Pausa concordata prima della partenza. Scadenza prorogata di 14 giorni.',
    expiryOption: 'proroga',
    installmentsOption: 'sospendi',
    createdAt: '2026-05-08T09:00:00.000Z',
    updatedAt: '2026-05-24T18:00:00.000Z',
  },
];

export const RenewalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { athletes, addTimelineEvent } = useAthletes();
  const { subscriptions, addSubscription, updateSubscription } = useSubscriptions();
  const { payments, createPaymentRecord, addAuditLog } = usePayments();

  const [renewals, setRenewals] = useState<AthleteRenewal[]>(() => {
    const saved = localStorage.getItem('builder_athlete_renewals');
    return saved ? JSON.parse(saved) : SEED_RENEWALS;
  });

  const [pauses, setPauses] = useState<SubscriptionPause[]>(() => {
    const saved = localStorage.getItem('builder_athlete_pauses');
    return saved ? JSON.parse(saved) : SEED_PAUSES;
  });

  useEffect(() => {
    localStorage.setItem('builder_athlete_renewals', JSON.stringify(renewals));
  }, [renewals]);

  useEffect(() => {
    localStorage.setItem('builder_athlete_pauses', JSON.stringify(pauses));
  }, [pauses]);

  // Recalculate days remaining dynamically based on today's date
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setRenewals((prev) =>
      prev.map((r) => {
        const end = new Date(r.endDate);
        end.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));

        // Get updated financial status for athlete
        const athletePayments = payments.filter((p) => p.atletaId === r.athleteId);
        const currentPayStatus = calculateAthleteFinancialStatus(athletePayments);

        return {
          ...r,
          daysRemaining: diffDays,
          paymentStatus: currentPayStatus,
        };
      })
    );
  }, [payments]);

  const addRenewal = (data: Omit<AthleteRenewal, 'id' | 'createdAt' | 'updatedAt'>): AthleteRenewal => {
    const newRen: AthleteRenewal = {
      ...data,
      id: `ren-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRenewals((prev) => [newRen, ...prev]);
    showToast(`Nuova scheda rinnovo creata per ${data.athleteName}`, 'success');
    return newRen;
  };

  const updateRenewal = (id: string, data: Partial<AthleteRenewal>) => {
    setRenewals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r))
    );
  };

  const updateRenewalStatus = (id: string, newStatus: RenewalStatus, note?: string) => {
    setRenewals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated: AthleteRenewal = {
            ...r,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
          if (note) {
            updated.notes = r.notes ? `${r.notes}\n[${new Date().toLocaleDateString('it-IT')}] ${note}` : note;
          }

          // Record timeline event
          addTimelineEvent(r.athleteId, {
            type: 'rinnovo',
            title: `Stato Rinnovo: ${newStatus.toUpperCase()}`,
            description: note || `Stato del rinnovo modificato in ${newStatus}`,
            authorName: 'Operatore Gestionale',
          });

          return updated;
        }
        return r;
      })
    );
    showToast(`Stato rinnovo aggiornato a "${newStatus}"`, 'info');
  };

  const deleteRenewal = (id: string) => {
    setRenewals((prev) => prev.filter((r) => r.id !== id));
    showToast('Scheda rinnovo rimossa', 'info');
  };

  // Workflow when a renewal is confirmed or finalized
  const confirmRenewalWorkflow = async (params: ConfirmRenewalParams): Promise<boolean> => {
    const {
      renewalId,
      actionType,
      packageId,
      packageName,
      listPrice,
      discountFixed,
      discountPercent,
      agreedPrice,
      startDate,
      durationValue,
      durationUnit,
      endDate,
      paymentFrequency,
      installmentCount,
      downPayment,
      firstInstallmentDate,
      notes,
    } = params;

    const targetRen = renewals.find((r) => r.id === renewalId);
    if (!targetRen) {
      showToast('Scheda rinnovo non trovata', 'error');
      return false;
    }

    const athleteObj = athletes.find((a) => a.id === targetRen.athleteId);
    const athleteName = athleteObj ? `${athleteObj.firstName} ${athleteObj.lastName}` : targetRen.athleteName;

    if (actionType === 'nuovo') {
      // 1. Mark existing subscription as 'rinnovato' if exists
      if (targetRen.subscriptionId) {
        updateSubscription(targetRen.subscriptionId, {
          status: 'rinnovato',
        });
      }

      // 2. Create new active subscription
      const createdSub = addSubscription({
        athleteId: targetRen.athleteId,
        athleteName: athleteName,
        packageId,
        packageName,
        startDate,
        durationValue,
        durationUnit,
        endDate,
        isCustomEndDate: false,
        listPrice,
        discountFixed,
        discountPercent,
        agreedPrice,
        paymentFrequency,
        installmentCount,
        downPayment,
        firstInstallmentDate,
        preferredPaymentMethod: 'bonifico',
        renewalType: 'manuale',
        gracePeriodDays: 7,
        status: 'attivo',
        notes: notes || `Abbonamento rinnovato da scheda rinnovo #${renewalId}`,
        installments: [],
        previousSubscriptionId: targetRen.subscriptionId,
      });

      // 3. Generate new payment installments in PaymentsContext
      const perInstallmentAmount = installmentCount > 0 ? (agreedPrice - downPayment) / installmentCount : agreedPrice;
      
      // Down payment record if present
      if (downPayment > 0) {
        createPaymentRecord({
          atletaId: targetRen.athleteId,
          atletaNome: athleteName,
          abbonamentoId: createdSub.id,
          abbonamentoNome: packageName,
          importoPrevisto: downPayment,
          importoPagato: downPayment,
          dataDiScadenza: startDate,
          dataDelPagamento: startDate,
          numeroDellaRata: 'Acconto & Iscrizione',
          metodoDiPagamento: 'bonifico',
          stato: 'pagato',
          note: 'Acconto rinnovo saldato all\'attivazione',
        }, 'Rinnovo Confermato');
      }

      // Generate rate payments
      for (let i = 1; i <= installmentCount; i++) {
        const dueDateObj = new Date(firstInstallmentDate);
        dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1));
        const dueDateStr = dueDateObj.toISOString().split('T')[0];

        createPaymentRecord({
          atletaId: targetRen.athleteId,
          atletaNome: athleteName,
          abbonamentoId: createdSub.id,
          abbonamentoNome: packageName,
          importoPrevisto: Math.round(perInstallmentAmount * 100) / 100,
          importoPagato: 0,
          dataDiScadenza: dueDateStr,
          numeroDellaRata: `Rata ${i} di ${installmentCount}`,
          metodoDiPagamento: 'bonifico',
          stato: 'programmato',
          note: `Generata da rinnovo abbonamento`,
        }, 'Rinnovo Confermato');
      }

      // 4. Update Renewal record to 'rinnovato'
      updateRenewal(renewalId, {
        status: 'rinnovato',
        currentPackageName: packageName,
        price: agreedPrice,
        endDate: endDate,
        subscriptionId: createdSub.id,
        notes: `Rinnovo completato con successo. Nuovo abbonamento #${createdSub.id}`,
      });

      // 5. Add Timeline Event
      addTimelineEvent(targetRen.athleteId, {
        type: 'rinnovo',
        title: 'Abbonamento Rinnovato',
        description: `Rinnovo confermato per pacchetto "${packageName}" (€${agreedPrice}). Nuovo abbonamento attivo fino al ${endDate}.`,
        authorName: 'Modulo Rinnovi',
      });

      showToast(`Rinnovo confermato! Creato nuovo abbonamento e generate ${installmentCount} rate`, 'success');
      return true;
    } else {
      // Proroga abbonamento esistente
      if (targetRen.subscriptionId) {
        updateSubscription(targetRen.subscriptionId, {
          endDate,
          agreedPrice,
          packageName,
          status: 'attivo',
        });
      }

      updateRenewal(renewalId, {
        status: 'rinnovato',
        endDate,
        price: agreedPrice,
        currentPackageName: packageName,
        notes: `Abbonamento prorogato fino al ${endDate}`,
      });

      addTimelineEvent(targetRen.athleteId, {
        type: 'rinnovo',
        title: 'Abbonamento Prorogato',
        description: `Proroga abbonamento completata fino al ${endDate} per €${agreedPrice}.`,
        authorName: 'Modulo Rinnovi',
      });

      showToast(`Proroga completata con successo al ${endDate}`, 'success');
      return true;
    }
  };

  // Pause Management
  const addPause = async (params: ConfirmPauseParams): Promise<SubscriptionPause> => {
    const {
      subscriptionId,
      athleteId,
      athleteName,
      startDate,
      expectedEndDate,
      actualEndDate,
      reason,
      authorization,
      notes,
      expiryOption,
      installmentsOption,
    } = params;

    const startObj = new Date(startDate);
    const endObj = new Date(expectedEndDate);
    const pauseDays = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24)));

    const newPause: SubscriptionPause = {
      id: `pause-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      subscriptionId,
      athleteId,
      athleteName,
      startDate,
      expectedEndDate,
      actualEndDate: actualEndDate || expectedEndDate,
      reason,
      pauseDays,
      authorization,
      notes,
      expiryOption,
      installmentsOption,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPauses((prev) => [newPause, ...prev]);

    // 1. Update Subscription Expiry if 'proroga' chosen
    const targetSub = subscriptions.find((s) => s.id === subscriptionId);
    if (targetSub) {
      let newSubEndDate = targetSub.endDate;
      if (expiryOption === 'proroga') {
        const subEndObj = new Date(targetSub.endDate);
        subEndObj.setDate(subEndObj.getDate() + pauseDays);
        newSubEndDate = subEndObj.toISOString().split('T')[0];
      }

      // Check if current date is within pause range -> set sub status 'sospeso'
      const todayStr = new Date().toISOString().split('T')[0];
      const isCurrentlyPaused = todayStr >= startDate && todayStr <= expectedEndDate;

      updateSubscription(subscriptionId, {
        endDate: newSubEndDate,
        status: isCurrentlyPaused ? 'sospeso' : targetSub.status,
      });

      // 2. Handle Payment Installments Options
      if (installmentsOption === 'riprogramma') {
        // Shift pending/future payment records due after pause start date by pauseDays
        const subPayments = payments.filter((p) => p.abbonamentoId === subscriptionId && p.stato !== 'pagato');
        subPayments.forEach((p) => {
          if (p.dataDiScadenza >= startDate) {
            const currentDue = new Date(p.dataDiScadenza);
            currentDue.setDate(currentDue.getDate() + pauseDays);
            const newDueStr = currentDue.toISOString().split('T')[0];

            // Add audit log
            addAuditLog({
              pagamentoId: p.id,
              atletaId: athleteId,
              atletaNome: athleteName,
              abbonamentoNome: p.abbonamentoNome,
              azione: 'Riprogrammazione Rata per Pausa Abbonamento',
              valorePrecedente: `Scadenza: ${p.dataDiScadenza}`,
              nuovoValore: `Scadenza prorogata: ${newDueStr} (+${pauseDays} gg pausa)`,
              autore: authorization,
              data: new Date().toISOString().split('T')[0],
              ora: new Date().toTimeString().split(' ')[0],
            });
          }
        });
      }
    }

    // Record timeline event
    addTimelineEvent(athleteId, {
      type: 'sospensione',
      title: 'Pausa Abbonamento Registrata',
      description: `Registrata pausa di ${pauseDays} giorni dal ${startDate} al ${expectedEndDate}. Motivazione: ${reason}. Scadenza: ${expiryOption === 'proroga' ? 'Prorogata' : 'Invariata'}. Rate: ${installmentsOption.toUpperCase()}.`,
      authorName: authorization,
    });

    showToast(`Pausa di ${pauseDays} giorni salvata ed applicata correttamente`, 'success');
    return newPause;
  };

  const updatePause = (id: string, data: Partial<SubscriptionPause>) => {
    setPauses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deletePause = (id: string) => {
    setPauses((prev) => prev.filter((p) => p.id !== id));
    showToast('Pausa rimossa', 'info');
  };

  const getPausesBySubscriptionId = (subId: string) => pauses.filter((p) => p.subscriptionId === subId);
  const getPausesByAthleteId = (athleteId: string) => pauses.filter((p) => p.athleteId === athleteId);

  return (
    <RenewalsContext.Provider
      value={{
        renewals,
        pauses,
        addRenewal,
        updateRenewal,
        updateRenewalStatus,
        deleteRenewal,
        confirmRenewalWorkflow,
        addPause,
        updatePause,
        deletePause,
        getPausesBySubscriptionId,
        getPausesByAthleteId,
      }}
    >
      {children}
    </RenewalsContext.Provider>
  );
};

export const useRenewals = () => {
  const context = useContext(RenewalsContext);
  if (!context) {
    throw new Error('useRenewals must be used within a RenewalsProvider');
  }
  return context;
};
