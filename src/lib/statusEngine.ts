import {
  PaymentRecord,
  PaymentStatus,
  AthleteSubscription,
  SubscriptionStatus,
  AthletePaymentStatus,
  Athlete,
  FinancialAuditLog,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export function isPaymentSuspended(
  payment: Pick<PaymentRecord, 'suspendedFrom' | 'suspendedUntil'>,
  todayStr: string = new Date().toISOString().split('T')[0]
): boolean {
  return Boolean(
    payment.suspendedUntil &&
    (!payment.suspendedFrom || payment.suspendedFrom <= todayStr) &&
    payment.suspendedUntil >= todayStr
  );
}

/**
 * REGOLE DEI PAGAMENTI:
 * - prima del periodo di preavviso (> 7 giorni prima della scadenza): programmato
 * - a 7 giorni dalla scadenza (1 a 7 giorni prima): in scadenza
 * - nel giorno della scadenza (giorno 0): da pagare
 * - dal giorno successivo (< 0 giorni): scaduto
 * - pagamento completo (importoPagato >= importoPrevisto): pagato
 * - pagamento incompleto (importoPagato > 0 e < importoPrevisto): pagato parzialmente
 * - rimborso completo: rimborsato (o parzialmente rimborsato)
 */
export function calculatePaymentStatus(
  payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'> | PaymentRecord,
  todayStr: string = new Date().toISOString().split('T')[0]
): PaymentStatus {
  // Preserve explicit terminal or user-overridden statuses
  if (
    payment.stato === 'annullato' ||
    payment.stato === 'fallito' ||
    payment.stato === 'rimborsato' ||
    payment.stato === 'parzialmente rimborsato'
  ) {
    return payment.stato;
  }

  const previsto = Number(payment.importoPrevisto) || 0;
  const pagato = Number(payment.importoPagato) || 0;

  // 1. Pagamento completo
  if (previsto > 0 && pagato >= previsto) {
    return 'pagato';
  }

  // 2. Pagamento incompleto
  if (pagato > 0 && pagato < previsto) {
    return 'pagato parzialmente';
  }

  // During a pause an unpaid installment remains scheduled and must not become overdue.
  if (isPaymentSuspended(payment, todayStr)) {
    return 'programmato';
  }

  // 3. Unpaid or zero-paid items: check expiry date
  if (!payment.dataDiScadenza) {
    return 'programmato';
  }

  const todayDate = new Date(todayStr);
  todayDate.setHours(0, 0, 0, 0);

  const dueDate = new Date(payment.dataDiScadenza);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays > 7) {
    return 'programmato';
  } else if (diffDays >= 1 && diffDays <= 7) {
    return 'in scadenza';
  } else if (diffDays === 0) {
    return 'da pagare';
  } else {
    // diffDays < 0 (dal giorno successivo)
    if (payment.stato === 'sollecitato') {
      return 'sollecitato';
    }
    return 'scaduto';
  }
}

/**
 * SITUAZIONE ECONOMICA GENERALE DELL'ATLETA:
 * - regolare
 * - pagamento imminente
 * - pagamento parziale
 * - pagamento scaduto
 * - più pagamenti scaduti
 * - nessun pagamento programmato
 */
export function calculateAthleteFinancialStatus(
  athletePayments: PaymentRecord[]
): AthletePaymentStatus {
  if (!athletePayments || athletePayments.length === 0) {
    return 'nessun pagamento programmato';
  }

  // Exclude cancelled / refunded items from active financial obligations
  const activePayments = athletePayments.filter(
    (p) =>
      p.stato !== 'annullato' &&
      p.stato !== 'rimborsato' &&
      !isPaymentSuspended(p)
  );

  if (activePayments.length === 0) {
    return 'nessun pagamento programmato';
  }

  let countScaduti = 0;
  let countParziali = 0;
  let countImminenti = 0;
  let countProgrammati = 0;

  activePayments.forEach((p) => {
    const stato = p.stato;
    if (stato === 'scaduto' || stato === 'sollecitato' || stato === 'fallito') {
      countScaduti++;
    } else if (
      stato === 'pagato parzialmente' ||
      (p.importoPagato > 0 && p.importoResiduo > 0)
    ) {
      countParziali++;
    } else if (stato === 'in scadenza' || stato === 'da pagare') {
      countImminenti++;
    } else if (stato === 'programmato') {
      countProgrammati++;
    }
  });

  if (countScaduti >= 2) {
    return 'più pagamenti scaduti';
  }
  if (countScaduti === 1) {
    return 'pagamento scaduto';
  }
  if (countParziali > 0) {
    return 'pagamento parziale';
  }
  if (countImminenti > 0) {
    return 'pagamento imminente';
  }
  if (
    countProgrammati > 0 ||
    activePayments.every((p) => p.stato === 'pagato')
  ) {
    return 'regolare';
  }

  return 'nessun pagamento programmato';
}

/**
 * REGOLE DEGLI ABBONAMENTI:
 * - futuro
 * - attivo
 * - in scadenza
 * - scaduto
 * - sospeso
 */
export function calculateSubscriptionStatus(
  sub: AthleteSubscription,
  todayStr: string = new Date().toISOString().split('T')[0]
): SubscriptionStatus {
  if (
    sub.status === 'sospeso' ||
    sub.status === 'bozza' ||
    sub.status === 'annullato' ||
    sub.status === 'rinnovato'
  ) {
    return sub.status;
  }

  if (!sub.startDate || !sub.endDate) {
    return sub.status || 'attivo';
  }

  const todayDate = new Date(todayStr);
  todayDate.setHours(0, 0, 0, 0);

  const startDate = new Date(sub.startDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(sub.endDate);
  endDate.setHours(0, 0, 0, 0);

  if (startDate.getTime() > todayDate.getTime()) {
    return 'futuro';
  }

  if (endDate.getTime() < todayDate.getTime()) {
    return 'scaduto';
  }

  // Check if within 7 days of expiration
  const diffTime = endDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  if (diffDays >= 0 && diffDays <= 7) {
    return 'in_scadenza';
  }

  return 'attivo';
}

export interface SystemRecalculationResult {
  updatedPaymentsCount: number;
  updatedSubscriptionsCount: number;
  updatedAthletesCount: number;
  newAuditLogs: FinancialAuditLog[];
}

/**
 * Performs a complete system-wide recalculation of all payment statuses,
 * subscription statuses, and athlete financial statuses without wiping history.
 */
export async function runSystemStatusRecalculation(params: {
  payments: PaymentRecord[];
  subscriptions: AthleteSubscription[];
  athletes: Athlete[];
  authorName?: string;
}): Promise<{
  updatedPayments: PaymentRecord[];
  updatedSubscriptions: AthleteSubscription[];
  updatedAthletes: Athlete[];
  newAuditLogs: FinancialAuditLog[];
  stats: SystemRecalculationResult;
}> {
  const { payments, subscriptions, athletes, authorName = 'Sistema Automatico / Supabase' } = params;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const dateFormatted = todayStr;
  const timeFormatted = now.toTimeString().split(' ')[0];

  let updatedPaymentsCount = 0;
  let updatedSubscriptionsCount = 0;
  let updatedAthletesCount = 0;
  const newAuditLogs: FinancialAuditLog[] = [];

  // If Supabase is configured, also call Supabase RPC
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.rpc('recalculate_all_statuses');
    } catch (err) {
      console.warn('Esecuzione RPC Supabase recalculate_all_statuses fallback a local engine:', err);
    }
  }

  // 1. Recalculate Payment Records
  const updatedPayments = payments.map((p) => {
    const computedStatus = calculatePaymentStatus(p, todayStr);
    if (computedStatus !== p.stato) {
      updatedPaymentsCount++;
      // Record audit log
      newAuditLogs.push({
        id: `audit-recalc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        pagamentoId: p.id,
        atletaId: p.atletaId,
        atletaNome: p.atletaNome,
        abbonamentoNome: p.abbonamentoNome,
        azione: 'Ricalcolo Automatico Stato Pagamento',
        valorePrecedente: `Stato: ${p.stato}`,
        nuovoValore: `Stato: ${computedStatus}`,
        autore: authorName,
        data: dateFormatted,
        ora: timeFormatted,
        createdAt: new Date().toISOString(),
      });

      return {
        ...p,
        stato: computedStatus,
        importoResiduo: Math.max(0, p.importoPrevisto - p.importoPagato),
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  // 2. Recalculate Subscriptions
  const updatedSubscriptions = subscriptions.map((sub) => {
    const computedStatus = calculateSubscriptionStatus(sub, todayStr);
    if (computedStatus !== sub.status) {
      updatedSubscriptionsCount++;
      return {
        ...sub,
        status: computedStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return sub;
  });

  // 3. Recalculate Athlete General Financial Statuses
  const updatedAthletes = athletes.map((athlete) => {
    const athletePayments = updatedPayments.filter((p) => p.atletaId === athlete.id);
    const computedFinancialStatus = calculateAthleteFinancialStatus(athletePayments);

    if (computedFinancialStatus !== athlete.paymentStatus) {
      updatedAthletesCount++;
      return {
        ...athlete,
        paymentStatus: computedFinancialStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return athlete;
  });

  return {
    updatedPayments,
    updatedSubscriptions,
    updatedAthletes,
    newAuditLogs,
    stats: {
      updatedPaymentsCount,
      updatedSubscriptionsCount,
      updatedAthletesCount,
      newAuditLogs,
    },
  };
}
