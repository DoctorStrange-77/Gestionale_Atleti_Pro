import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AthleteSubscription,
  SubscriptionInstallment,
  SubscriptionStatus,
  PreferredPaymentMethod,
  PaymentFrequency,
  PackageDurationUnit,
} from '../types';
import { useAthletes } from './AthletesContext';
import { computeSubscriptionStatus } from '../lib/subscriptionHelpers';
import { STORAGE_KEYS, ATHLETE_SUBKEYS } from '../config/storageKeys';

interface SubscriptionsContextType {
  subscriptions: AthleteSubscription[];
  addSubscription: (
    data: Omit<AthleteSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => AthleteSubscription;
  updateSubscription: (id: string, data: Partial<AthleteSubscription>) => void;
  toggleSubscriptionSuspension: (id: string) => void;
  cancelSubscription: (id: string) => void;
  renewSubscription: (
    oldSubId: string,
    newSubData: Omit<AthleteSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => AthleteSubscription;
  markInstallmentPaid: (
    subscriptionId: string,
    installmentId: string,
    details: {
      paidDate: string;
      paidAmount: number;
      paymentMethod: PreferredPaymentMethod;
      receiptNumber?: string;
    }
  ) => void;
  getSubscriptionById: (id: string) => AthleteSubscription | undefined;
  getSubscriptionsByAthleteId: (athleteId: string) => AthleteSubscription[];
  deleteSubscription: (id: string) => void;
  bulkSetSubscriptions: (subscriptions: AthleteSubscription[]) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

const SEED_SUBSCRIPTIONS: AthleteSubscription[] = [
  {
    id: 'sub-1',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    packageId: 'pkg-1',
    packageName: 'Abbonamento Annuale Gold Power (Pagamento Mensile)',
    startDate: '2026-01-01',
    durationValue: 12,
    durationUnit: 'mensile',
    endDate: '2026-12-31',
    isCustomEndDate: false,
    listPrice: 780,
    discountFixed: 0,
    discountPercent: 0,
    agreedPrice: 780,
    paymentFrequency: 'mensile',
    installmentCount: 12,
    downPayment: 30,
    firstInstallmentDate: '2026-01-01',
    preferredPaymentMethod: 'bonifico',
    renewalType: 'manuale',
    gracePeriodDays: 10,
    status: 'attivo',
    notes: 'Inclusa quota di iscrizione €30 saldata all\'attivazione.',
    installments: [
      { id: 'inst-dep-1', number: 1, label: 'Acconto & Iscrizione', dueDate: '2026-01-01', amount: 30, status: 'pagato', paidAmount: 30, paidDate: '2026-01-01', paymentMethod: 'bonifico', receiptNumber: 'R-2026-001' },
      { id: 'inst-1', number: 2, label: 'Rata 1 di 12', dueDate: '2026-01-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-01-01', paymentMethod: 'bonifico' },
      { id: 'inst-2', number: 3, label: 'Rata 2 di 12', dueDate: '2026-02-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-02-01', paymentMethod: 'bonifico' },
      { id: 'inst-3', number: 4, label: 'Rata 3 di 12', dueDate: '2026-03-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-03-01', paymentMethod: 'bonifico' },
      { id: 'inst-4', number: 5, label: 'Rata 4 di 12', dueDate: '2026-04-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-04-01', paymentMethod: 'bonifico' },
      { id: 'inst-5', number: 6, label: 'Rata 5 di 12', dueDate: '2026-05-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-05-01', paymentMethod: 'bonifico' },
      { id: 'inst-6', number: 7, label: 'Rata 6 di 12', dueDate: '2026-06-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-06-01', paymentMethod: 'bonifico' },
      { id: 'inst-7', number: 8, label: 'Rata 7 di 12', dueDate: '2026-07-01', amount: 62.5, status: 'pagato', paidAmount: 62.5, paidDate: '2026-07-02', paymentMethod: 'bonifico' },
      { id: 'inst-8', number: 9, label: 'Rata 8 di 12', dueDate: '2026-08-01', amount: 62.5, status: 'in_scadenza' },
      { id: 'inst-9', number: 10, label: 'Rata 9 di 12', dueDate: '2026-09-01', amount: 62.5, status: 'in_attesa' },
      { id: 'inst-10', number: 11, label: 'Rata 10 di 12', dueDate: '2026-10-01', amount: 62.5, status: 'in_attesa' },
      { id: 'inst-11', number: 12, label: 'Rata 11 di 12', dueDate: '2026-11-01', amount: 62.5, status: 'in_attesa' },
      { id: 'inst-12', number: 13, label: 'Rata 12 di 12', dueDate: '2026-12-01', amount: 62.5, status: 'in_attesa' },
    ],
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 'sub-2',
    athleteId: 'ath-2',
    athleteName: 'Elena Bianchi',
    packageId: 'pkg-5',
    packageName: 'Carnet 10 Consulenze Personal Training',
    startDate: '2026-02-15',
    durationValue: 10,
    durationUnit: 'numero_consulenze',
    endDate: '2026-08-15',
    isCustomEndDate: false,
    listPrice: 450,
    discountFixed: 50,
    discountPercent: 0,
    agreedPrice: 400,
    paymentFrequency: 'unica_soluzione',
    installmentCount: 1,
    downPayment: 0,
    firstInstallmentDate: '2026-02-15',
    preferredPaymentMethod: 'carta',
    renewalType: 'manuale',
    gracePeriodDays: 5,
    status: 'in_scadenza',
    notes: 'Sconto atleta agonista bikini applicato.',
    installments: [
      { id: 'inst-2-1', number: 1, label: 'Saldo Unico Carnet PT', dueDate: '2026-02-15', amount: 400, status: 'pagato', paidAmount: 400, paidDate: '2026-02-15', paymentMethod: 'carta', receiptNumber: 'R-2026-042' },
    ],
    createdAt: '2026-02-15T11:00:00.000Z',
    updatedAt: '2026-02-15T11:00:00.000Z',
  },
  {
    id: 'sub-3',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    packageId: 'pkg-3',
    packageName: 'Percorso Semestrale Performance (2 Rate)',
    startDate: '2026-01-15',
    durationValue: 6,
    durationUnit: 'semestrale',
    endDate: '2026-07-14',
    isCustomEndDate: false,
    listPrice: 420,
    discountFixed: 0,
    discountPercent: 0,
    agreedPrice: 420,
    paymentFrequency: 'trimestrale',
    installmentCount: 2,
    downPayment: 0,
    firstInstallmentDate: '2026-01-15',
    preferredPaymentMethod: 'contanti',
    renewalType: 'manuale',
    gracePeriodDays: 5,
    status: 'scaduto',
    notes: 'Seconda rata in ritardo.',
    installments: [
      { id: 'inst-3-1', number: 1, label: 'Rata 1 di 2 (Trimestrale)', dueDate: '2026-01-15', amount: 210, status: 'pagato', paidAmount: 210, paidDate: '2026-01-15', paymentMethod: 'contanti' },
      { id: 'inst-3-2', number: 2, label: 'Rata 2 di 2 (Trimestrale)', dueDate: '2026-04-15', amount: 210, status: 'scaduto' },
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-07-16T08:00:00.000Z',
  },
];

export const SubscriptionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { athletes, updateAthlete } = useAthletes();

  const [subscriptions, setSubscriptions] = useState<AthleteSubscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed parsing subscriptions from localStorage', e);
      }
    }
    return SEED_SUBSCRIPTIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Sync sub-entities into local storage for Athlete Detail view
  const syncSubEntitiesToAthlete = (
    athleteId: string,
    sub: AthleteSubscription,
    action: 'created' | 'renewed' | 'updated'
  ) => {
    const prefix = `b_athlete_detail_${athleteId}`;

    // 1. Sync Subscriptions array for Athlete Detail
    try {
      const savedSubs = localStorage.getItem(ATHLETE_SUBKEYS.detailSubscriptions(athleteId));
      let list: any[] = savedSubs ? JSON.parse(savedSubs) : [];

      const existingIndex = list.findIndex((s) => s.id === sub.id);
      if (existingIndex >= 0) {
        list[existingIndex] = {
          id: sub.id,
          athleteId: sub.athleteId,
          packageName: sub.packageName,
          startDate: sub.startDate,
          endDate: sub.endDate,
          price: sub.agreedPrice,
          status: sub.status,
          paymentFrequency: sub.paymentFrequency,
          notes: sub.notes,
        };
      } else {
        list.unshift({
          id: sub.id,
          athleteId: sub.athleteId,
          packageName: sub.packageName,
          startDate: sub.startDate,
          endDate: sub.endDate,
          price: sub.agreedPrice,
          status: sub.status,
          paymentFrequency: sub.paymentFrequency,
          notes: sub.notes,
        });
      }
      localStorage.setItem(ATHLETE_SUBKEYS.detailSubscriptions(athleteId), JSON.stringify(list));
    } catch (e) {
      console.error('Failed syncing sub array', e);
    }

    // 2. Sync Timeline Event
    try {
      const savedEvents = localStorage.getItem(ATHLETE_SUBKEYS.timeline(athleteId));
      let eventsList: any[] = savedEvents ? JSON.parse(savedEvents) : [];

      const eventTitle =
        action === 'renewed'
          ? 'Rinnovo Abbonamento'
          : action === 'created'
          ? 'Assegnazione Nuovo Abbonamento'
          : 'Aggiornamento Contratto Abbonamento';

      const eventDesc = `Pacchetto "${sub.packageName}" (€${sub.agreedPrice.toFixed(
        2
      )} - ${sub.installmentCount} rate). Valido dal ${sub.startDate} al ${sub.endDate}.`;

      eventsList.unshift({
        id: `evt-sub-${Date.now()}`,
        athleteId,
        type: action === 'renewed' ? 'rinnovo' : 'acquisto_pacchetto',
        title: eventTitle,
        description: eventDesc,
        authorName: 'Segreteria',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(ATHLETE_SUBKEYS.timeline(athleteId), JSON.stringify(eventsList));
    } catch (e) {
      console.error('Failed syncing timeline event', e);
    }

    // 3. Sync Payments / Scadenze
    try {
      const savedPayments = localStorage.getItem(ATHLETE_SUBKEYS.payments(athleteId));
      let paymentsList: any[] = savedPayments ? JSON.parse(savedPayments) : [];

      sub.installments.forEach((inst) => {
        const existingPmtIdx = paymentsList.findIndex((p) => p.id === inst.id);
        const paymentObj = {
          id: inst.id,
          athleteId,
          description: `${sub.packageName} - ${inst.label}`,
          amount: inst.amount,
          dueDate: inst.dueDate,
          paidDate: inst.paidDate,
          status:
            inst.status === 'pagato'
              ? 'pagato'
              : inst.status === 'scaduto'
              ? 'scaduto'
              : inst.status === 'in_scadenza'
              ? 'in_scadenza'
              : 'in_attesa',
          method: inst.paymentMethod || sub.preferredPaymentMethod,
          receiptNumber: inst.receiptNumber,
        };

        if (existingPmtIdx >= 0) {
          paymentsList[existingPmtIdx] = paymentObj;
        } else {
          paymentsList.unshift(paymentObj);
        }
      });

      localStorage.setItem(ATHLETE_SUBKEYS.payments(athleteId), JSON.stringify(paymentsList));
    } catch (e) {
      console.error('Failed syncing payments scadenze', e);
    }

    // 4. Update main Athlete record activePackage & expirationDate
    const targetAthlete = athletes.find((a) => a.id === athleteId);
    if (targetAthlete) {
      updateAthlete(athleteId, {
        activePackage: sub.packageName,
        expirationDate: sub.endDate,
        paymentStatus: sub.status === 'scaduto' ? 'moroso' : sub.status === 'in_scadenza' ? 'in_scadenza' : 'regolare',
        status: 'attivo',
      });
    }
  };

  const addSubscription = (
    data: Omit<AthleteSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): AthleteSubscription => {
    const now = new Date().toISOString();
    const newId = `sub-${Date.now()}`;

    // Compute dynamic status
    const initialStatus = data.status || computeSubscriptionStatus({ ...data, id: newId, createdAt: now, updatedAt: now });

    const newSub: AthleteSubscription = {
      ...data,
      id: newId,
      status: initialStatus,
      createdAt: now,
      updatedAt: now,
    };

    // Mark previous active subscriptions for this athlete as 'scaduto' or 'rinnovato' if this new one is active
    setSubscriptions((prev) => {
      const updatedPrev = prev.map((s) => {
        if (s.athleteId === data.athleteId && (s.status === 'attivo' || s.status === 'in_scadenza')) {
          return {
            ...s,
            status: 'rinnovato' as SubscriptionStatus,
            updatedAt: now,
          };
        }
        return s;
      });
      return [newSub, ...updatedPrev];
    });

    syncSubEntitiesToAthlete(data.athleteId, newSub, 'created');

    return newSub;
  };

  const updateSubscription = (id: string, data: Partial<AthleteSubscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = {
            ...s,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          syncSubEntitiesToAthlete(updated.athleteId, updated, 'updated');
          return updated;
        }
        return s;
      })
    );
  };

  const toggleSubscriptionSuspension = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus: SubscriptionStatus = s.status === 'sospeso' ? 'attivo' : 'sospeso';
          const updated = {
            ...s,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
          syncSubEntitiesToAthlete(s.athleteId, updated, 'updated');
          return updated;
        }
        return s;
      })
    );
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = {
            ...s,
            status: 'annullato' as SubscriptionStatus,
            updatedAt: new Date().toISOString(),
          };
          syncSubEntitiesToAthlete(s.athleteId, updated, 'updated');
          return updated;
        }
        return s;
      })
    );
  };

  const renewSubscription = (
    oldSubId: string,
    newSubData: Omit<AthleteSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): AthleteSubscription => {
    // 1. Mark old subscription as 'rinnovato'
    updateSubscription(oldSubId, { status: 'rinnovato' });

    // 2. Add new subscription with previousSubscriptionId link
    const newSub = addSubscription({
      ...newSubData,
      previousSubscriptionId: oldSubId,
    });

    return newSub;
  };

  const markInstallmentPaid = (
    subscriptionId: string,
    installmentId: string,
    details: {
      paidDate: string;
      paidAmount: number;
      paymentMethod: PreferredPaymentMethod;
      receiptNumber?: string;
    }
  ) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          const updatedInstallments = sub.installments.map((inst) => {
            if (inst.id === installmentId) {
              return {
                ...inst,
                status: 'pagato' as const,
                paidDate: details.paidDate,
                paidAmount: details.paidAmount,
                paymentMethod: details.paymentMethod,
                receiptNumber: details.receiptNumber,
              };
            }
            return inst;
          });

          const updatedSub = {
            ...sub,
            installments: updatedInstallments,
            updatedAt: new Date().toISOString(),
          };

          syncSubEntitiesToAthlete(sub.athleteId, updatedSub, 'updated');
          return updatedSub;
        }
        return sub;
      })
    );
  };

  const getSubscriptionById = (id: string) => subscriptions.find((s) => s.id === id);

  const getSubscriptionsByAthleteId = (athleteId: string) =>
    subscriptions.filter((s) => s.athleteId === athleteId);

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const bulkSetSubscriptions = (newSubscriptions: AthleteSubscription[]) => {
    setSubscriptions(newSubscriptions);
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        toggleSubscriptionSuspension,
        cancelSubscription,
        renewSubscription,
        markInstallmentPaid,
        getSubscriptionById,
        getSubscriptionsByAthleteId,
        deleteSubscription,
        bulkSetSubscriptions,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  }
  return context;
};
