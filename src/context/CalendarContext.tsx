import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CalendarEvent, CalendarEventType, CalendarEventStatus } from '../types';
import { useToast } from './ToastContext';
import { usePayments } from './PaymentsContext';
import { useSubscriptions } from './SubscriptionsContext';
import { useRenewals } from './RenewalsContext';
import { useAthletes } from './AthletesContext';

interface CalendarContextType {
  customEvents: CalendarEvent[];
  allEvents: CalendarEvent[];
  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY = 'app_calendar_events_v2';

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Consultazione Iniziale e Anamnesi PT',
    description: 'Prima valutazione corporea, plicometria e anamnesi con nuovo atleta.',
    type: 'appuntamenti',
    date: '2026-07-30',
    startTime: '09:00',
    endTime: '10:00',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    coachName: 'Coach Roberto',
    status: 'in programma',
    location: 'Studio PT Sala A',
    notes: 'Portare scheda plicometrica digitale.',
    isSystemGenerated: false,
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'cal-2',
    title: 'Check-in Fisico Mensile',
    description: 'Misure antropometriche e confronto foto di gruppo.',
    type: 'check-in',
    date: '2026-07-29',
    startTime: '11:30',
    endTime: '12:15',
    athleteId: 'ath-2',
    athleteName: 'Laura Bianchi',
    coachName: 'Coach Elena',
    status: 'completato',
    location: 'Area Valutazione',
    notes: 'Risultati eccellenti sul trofismo muscolare.',
    isSystemGenerated: false,
    createdAt: '2026-07-25T14:00:00Z',
    updatedAt: '2026-07-29T12:15:00Z',
  },
  {
    id: 'cal-3',
    title: 'Gara Regionale Bodybuilding IFBB',
    description: 'Campionato Regionale con atleti del team in gara.',
    type: 'gare',
    date: '2026-08-08',
    startTime: '08:30',
    endTime: '19:00',
    coachName: 'Coach Roberto',
    status: 'in programma',
    location: 'Palasport Olimpico',
    notes: 'Inizio moffa e posa ore 10:00.',
    isSystemGenerated: false,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'cal-4',
    title: 'Workshop Nutrizione e Integrazione Sportiva',
    description: 'Evento aperto agli atleti iscritti del centro.',
    type: 'eventi',
    date: '2026-08-12',
    startTime: '18:00',
    endTime: '20:00',
    coachName: 'Team Nutrizione',
    status: 'in programma',
    location: 'Sala Conferenze Center',
    isSystemGenerated: false,
    createdAt: '2026-07-22T09:00:00Z',
    updatedAt: '2026-07-22T09:00:00Z',
  },
  {
    id: 'cal-5',
    title: 'Consegna Programma Periodizzazione Autunno',
    description: 'Preparazione e invio della scheda di forza 6 settimane.',
    type: 'programmi da consegnare',
    date: '2026-08-01',
    startTime: '15:00',
    endTime: '16:00',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    coachName: 'Coach Elena',
    status: 'in programma',
    isSystemGenerated: false,
    createdAt: '2026-07-26T11:00:00Z',
    updatedAt: '2026-07-26T11:00:00Z',
  },
  {
    id: 'cal-6',
    title: 'Verifica Consenso Privacy e Regolamento',
    description: 'Aggiornamento firma documento privacy GDPR e tesseramento.',
    type: 'documenti',
    date: '2026-07-31',
    startTime: '14:00',
    endTime: '14:30',
    athleteId: 'ath-4',
    athleteName: 'Andrea Conti',
    coachName: 'Segreteria',
    status: 'in attesa',
    isSystemGenerated: false,
    createdAt: '2026-07-27T10:00:00Z',
    updatedAt: '2026-07-27T10:00:00Z',
  },
];

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { payments } = usePayments();
  const { subscriptions } = useSubscriptions();
  const { renewals } = useRenewals();
  const { athletes } = useAthletes();

  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse calendar events', e);
      }
    }
    return INITIAL_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customEvents));
  }, [customEvents]);

  // Generate system events from payments, subscriptions, renewals, medical certs, birthdays
  const systemEvents = useMemo(() => {
    const generated: CalendarEvent[] = [];

    // 1. Pagamenti
    payments.forEach((p) => {
      if (p.dataDiScadenza) {
        const isPaid = p.stato === 'pagato';
        const isOverdue = p.stato === 'scaduto' || p.stato === 'sollecitato';
        generated.push({
          id: `sys-pay-${p.id}`,
          title: `Pagamento ${p.numeroDellaRata || 'Rata'}: ${p.atletaNome} (€${p.importoResiduo > 0 ? p.importoResiduo : p.importoPrevisto})`,
          description: `Stato: ${p.stato} | Importo: €${p.importoPrevisto}`,
          type: 'pagamenti',
          date: p.dataDiScadenza,
          athleteId: p.atletaId,
          athleteName: p.atletaNome,
          status: isPaid ? 'completato' : isOverdue ? 'scaduto' : 'in programma',
          isSystemGenerated: true,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      }
    });

    // 2. Subscriptions (Inizio & Fine abbonamento)
    subscriptions.forEach((sub) => {
      if (sub.startDate) {
        generated.push({
          id: `sys-sub-start-${sub.id}`,
          title: `Inizio Abbonamento: ${sub.athleteName} (${sub.packageName})`,
          description: `Data attivazione pacchetto ${sub.packageName}`,
          type: 'inizio abbonamento',
          date: sub.startDate,
          athleteId: sub.athleteId,
          athleteName: sub.athleteName,
          coachName: sub.coachName,
          status: 'completato',
          isSystemGenerated: true,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        });
      }

      if (sub.endDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        const isExpired = sub.endDate < todayStr;
        generated.push({
          id: `sys-sub-end-${sub.id}`,
          title: `Fine Abbonamento: ${sub.athleteName} (${sub.packageName})`,
          description: `Scadenza abbonamento in corso`,
          type: 'fine abbonamento',
          date: sub.endDate,
          athleteId: sub.athleteId,
          athleteName: sub.athleteName,
          coachName: sub.coachName,
          status: isExpired ? 'scaduto' : 'in programma',
          isSystemGenerated: true,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        });
      }
    });

    // 3. Rinnovi
    renewals.forEach((r) => {
      if (r.endDate) {
        generated.push({
          id: `sys-renewal-${r.id}`,
          title: `Scadenza Rinnovo: ${r.athleteName} (${r.currentPackageName})`,
          description: `Stato trattativa: ${r.status}`,
          type: 'rinnovi',
          date: r.endDate,
          athleteId: r.athleteId,
          athleteName: r.athleteName,
          coachName: r.coachName || r.responsibleName,
          status: r.status === 'confermato' || r.status === 'rinnovato' ? 'completato' : 'in programma',
          isSystemGenerated: true,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }
    });

    // 4. Certificati Medici & Compleanni
    athletes.forEach((a) => {
      const fullName = `${a.firstName} ${a.lastName}`;

      if (a.medicalCertificateExpiry) {
        const todayStr = new Date().toISOString().split('T')[0];
        const isExpired = a.medicalCertificateExpiry < todayStr;
        generated.push({
          id: `sys-med-${a.id}`,
          title: `Scadenza Certificato Medico: ${fullName}`,
          description: `Idoneità sportiva agonistica / non agonistica`,
          type: 'certificati medici',
          date: a.medicalCertificateExpiry,
          athleteId: a.id,
          athleteName: fullName,
          coachName: a.coachName,
          status: isExpired ? 'scaduto' : 'in programma',
          isSystemGenerated: true,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        });
      }

      if (a.dateOfBirth) {
        // Derive birthday for current year 2026
        const dobParts = a.dateOfBirth.split('-');
        if (dobParts.length === 3) {
          const birthday2026 = `2026-${dobParts[1]}-${dobParts[2]}`;
          generated.push({
            id: `sys-bday-${a.id}`,
            title: `Compleanno: ${fullName} 🎂`,
            description: `Data di nascita: ${a.dateOfBirth}`,
            type: 'compleanni',
            date: birthday2026,
            athleteId: a.id,
            athleteName: fullName,
            coachName: a.coachName,
            status: 'in programma',
            isSystemGenerated: true,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          });
        }
      }
    });

    return generated;
  }, [payments, subscriptions, renewals, athletes]);

  // Combine custom and system events
  const allEvents = useMemo(() => {
    return [...customEvents, ...systemEvents];
  }, [customEvents, systemEvents]);

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEvt: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
      isSystemGenerated: false,
      createdAt: now,
      updatedAt: now,
    };
    setCustomEvents((prev) => [newEvt, ...prev]);
    showToast('Evento aggiunto al calendario', 'success');
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const now = new Date().toISOString();
    setCustomEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: now } : e))
    );
    showToast('Evento aggiornato', 'info');
  };

  const deleteEvent = async (id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Evento rimosso dal calendario', 'info');
  };

  return (
    <CalendarContext.Provider
      value={{
        customEvents,
        allEvents,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarEvents = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarEvents must be used within a CalendarProvider');
  }
  return context;
};
