import {
  Athlete,
  AthleteSubscription,
  PaymentRecord,
  AthleteRenewal,
  Task,
  DocumentAlert,
  AthleteDocument,
} from '../types';

export type TimeFilterOption =
  | '30_giorni'
  | '3_mesi'
  | '6_mesi'
  | 'anno_corrente'
  | 'anno_precedente'
  | 'personalizzato';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * Returns start and end date strings (YYYY-MM-DD) for a given filter option
 */
export function getDateRangeFromFilter(
  filter: TimeFilterOption,
  customRange?: { startDate: string; endDate: string }
): DateRange {
  const now = new Date();
  const year = now.getFullYear();

  if (filter === 'personalizzato' && customRange?.startDate && customRange?.endDate) {
    return customRange;
  }

  const endDate = now.toISOString().split('T')[0];

  if (filter === '30_giorni') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { startDate: start.toISOString().split('T')[0], endDate };
  }

  if (filter === '3_mesi') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    return { startDate: start.toISOString().split('T')[0], endDate };
  }

  if (filter === '6_mesi') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 6);
    return { startDate: start.toISOString().split('T')[0], endDate };
  }

  if (filter === 'anno_precedente') {
    return {
      startDate: `${year - 1}-01-01`,
      endDate: `${year - 1}-12-31`,
    };
  }

  // Default 'anno_corrente'
  return {
    startDate: `${year}-01-01`,
    endDate,
  };
}

/**
 * Helper to check if a date string falls within range inclusive
 */
export function isDateInRange(dateStr?: string, startDate?: string, endDate?: string): boolean {
  if (!dateStr) return false;
  const d = dateStr.split('T')[0];
  if (startDate && d < startDate) return false;
  if (endDate && d > endDate) return false;
  return true;
}

/**
 * Exclusion check for payments based on prompt rules:
 * - Non conteggiare: pagamenti annullati, importi non realmente incassati, pagamenti duplicati
 * - I pagamenti parzialmente rimborsati vengono conteggiati per il loro importo netto pagato
 */
export function isValidPayment(payment: PaymentRecord): boolean {
  if (!payment) return false;
  const statusLower = (payment.stato || '').toLowerCase();
  const notesLower = (payment.note || '').toLowerCase();

  // Exclude fully cancelled, fully refunded, duplicate
  if (statusLower === 'annullato' || statusLower === 'rimborsato') return false;
  if (notesLower.includes('duplicat') || notesLower.includes('annullat')) return false;

  return true;
}

/**
 * Helper to calculate subscription monthly duration
 */
export function getSubscriptionDurationInMonths(sub: AthleteSubscription): number {
  const unit = sub.durationUnit as string;
  if (unit === 'mensile') return Math.max(1, sub.durationValue || 1);
  if (unit === 'bimestrale') return Math.max(1, (sub.durationValue || 1) * 2);
  if (unit === 'trimestrale') return Math.max(1, (sub.durationValue || 1) * 3);
  if (unit === 'quadrimestrale') return Math.max(1, (sub.durationValue || 1) * 4);
  if (unit === 'semestrale') return Math.max(1, (sub.durationValue || 1) * 6);
  if (unit === 'annuale') return Math.max(1, (sub.durationValue || 1) * 12);
  if (unit === 'settimane') return Math.max(1, Math.round(((sub.durationValue || 4) * 7) / 30));
  if (unit === 'giorni') return Math.max(1, Math.round((sub.durationValue || 30) / 30));

  // Fallback: calculate from start and end dates if available
  if (sub.startDate && sub.endDate) {
    const start = new Date(sub.startDate);
    const end = new Date(sub.endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(1, diffMonths);
  }

  return 1;
}

export interface CalculatedDashboardMetrics {
  atletiAttivi: number;
  atletiInProva: number;
  atletiSospesi: number;
  nuoviAtletiMese: number;
  atletiPersi: number;
  abbonamentiInScadenza: number;
  pagamentiInScadenza: number;
  pagamentiScaduti: number;
  totaleDaIncassare: number;
  incassatoNelMese: number;
  incassatoNellAnno: number;
  entratePreviste: number;
  insoluti: number;
  tassoDiIncasso: number;
  tassoDiRinnovo: number;
  churnRate: number;
  valoreMedioPerAtleta: number;
  mrr: number;
  arr: number;
  attivitaDaCompletare: number;
}

export function computeDashboardMetrics(
  athletes: Athlete[],
  subscriptions: AthleteSubscription[],
  payments: PaymentRecord[],
  renewals: AthleteRenewal[],
  tasks: Task[],
  documents: AthleteDocument[],
  alerts: DocumentAlert[],
  range: DateRange
): CalculatedDashboardMetrics {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const currentYearStr = todayStr.substring(0, 4); // YYYY

  // 1. Atleti Attivi
  const atletiAttivi = athletes.filter((a) => a.status === 'attivo').length;

  // 2. Atleti in Prova (prova, potenziale_cliente, onboarding)
  const atletiInProva = athletes.filter(
    (a) => a.status === 'prova' || a.status === 'potenziale_cliente' || a.status === 'onboarding'
  ).length;

  // 3. Atleti Sospesi (sospeso, in_pausa)
  const atletiSospesi = athletes.filter(
    (a) => a.status === 'sospeso' || a.status === 'in_pausa'
  ).length;

  // 4. Nuovi Atleti del Mese (o del periodo selezionato)
  const nuoviAtletiMese = athletes.filter((a) =>
    isDateInRange(a.joinDate || a.createdAt, range.startDate, range.endDate)
  ).length;

  // 5. Atleti Persi (inattivo, non_rinnovato, archiviato)
  const atletiPersi = athletes.filter(
    (a) =>
      a.status === 'inattivo' ||
      a.status === 'non_rinnovato' ||
      a.status === 'archiviato'
  ).length;

  // 6. Abbonamenti in Scadenza (nei prossimi 30 giorni)
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const in30DaysStr = in30Days.toISOString().split('T')[0];

  const abbonamentiInScadenza = subscriptions.filter(
    (s) =>
      (s.status === 'attivo' || s.status === 'in_scadenza') &&
      s.endDate >= todayStr &&
      s.endDate <= in30DaysStr
  ).length;

  // Filter valid payments only
  const validPayments = payments.filter(isValidPayment);

  // 7. Pagamenti in Scadenza
  const pagamentiInScadenza = validPayments.filter(
    (p) =>
      (p.stato === 'in scadenza' || p.stato === 'da pagare' || p.stato === 'programmato') &&
      p.dataDiScadenza >= todayStr &&
      p.dataDiScadenza <= in30DaysStr
  ).length;

  // 8. Pagamenti Scaduti
  const pagamentiScaduti = validPayments.filter(
    (p) =>
      (p.stato === 'scaduto' || (p.dataDiScadenza < todayStr && (p.importoResiduo || 0) > 0)) &&
      p.stato !== 'pagato'
  ).length;

  // 9. Totale da Incassare (sum of importoResiduo)
  const totaleDaIncassare = validPayments.reduce((acc, p) => acc + Math.max(0, p.importoResiduo || 0), 0);

  // 10. Incassato nel Mese (current month)
  const incassatoNelMese = validPayments
    .filter((p) => {
      const pDate = p.dataDelPagamento || p.createdAt || '';
      return pDate.startsWith(currentMonthStr) && (p.importoPagato || 0) > 0;
    })
    .reduce((acc, p) => acc + (p.importoPagato || 0), 0);

  // 11. Incassato nell'Anno (current year)
  const incassatoNellAnno = validPayments
    .filter((p) => {
      const pDate = p.dataDelPagamento || p.createdAt || '';
      return pDate.startsWith(currentYearStr) && (p.importoPagato || 0) > 0;
    })
    .reduce((acc, p) => acc + (p.importoPagato || 0), 0);

  // 12. Entrate Previste (in selected range)
  const entratePreviste = validPayments
    .filter((p) => isDateInRange(p.dataDiScadenza, range.startDate, range.endDate))
    .reduce((acc, p) => acc + (p.importoPrevisto || 0), 0);

  // Total collected in selected range
  const incassatoNelPeriodo = validPayments
    .filter((p) => isDateInRange(p.dataDelPagamento || p.createdAt, range.startDate, range.endDate))
    .reduce((acc, p) => acc + (p.importoPagato || 0), 0);

  // 13. Insoluti (Overdue unpaid amounts)
  const insoluti = validPayments
    .filter(
      (p) =>
        (p.stato === 'scaduto' || (p.dataDiScadenza < todayStr && p.stato !== 'pagato')) &&
        (p.importoResiduo || 0) > 0
    )
    .reduce((acc, p) => acc + (p.importoResiduo || 0), 0);

  // 14. Tasso di Incasso %
  const basePreviste = entratePreviste > 0 ? entratePreviste : 1;
  const tassoDiIncasso = Math.min(100, Math.round((incassatoNelPeriodo / basePreviste) * 100));

  // 15. Tasso di Rinnovo %
  const rinnovatiCount = renewals.filter(
    (r) => r.status === 'confermato' || r.status === 'rinnovato'
  ).length;
  const totalScadutiOrRenewals = Math.max(1, renewals.length);
  const tassoDiRinnovo = Math.min(100, Math.round((rinnovatiCount / totalScadutiOrRenewals) * 100));

  // 16. Churn Rate %
  const totalGestiti = Math.max(1, athletes.length);
  const churnRate = Number(((atletiPersi / totalGestiti) * 100).toFixed(1));

  // 17. Valore Medio per Atleta (ARPU)
  const baseAtleti = atletiAttivi > 0 ? atletiAttivi : 1;
  const valoreMedioPerAtleta = Math.round(incassatoNellAnno / baseAtleti);

  // 18. MRR (Monthly Recurring Revenue)
  const activeSubs = subscriptions.filter((s) => s.status === 'attivo' || s.status === 'in_scadenza');
  const mrr = activeSubs.reduce((acc, s) => {
    const monthlyVal = (s.agreedPrice || s.listPrice || 0) / getSubscriptionDurationInMonths(s);
    return acc + monthlyVal;
  }, 0);

  // 19. ARR (Annual Recurring Revenue)
  const arr = mrr * 12;

  // 20. Attività da Completare
  const attivitaDaCompletare = tasks.filter(
    (t) => t.status !== 'completata' && t.status !== 'annullata'
  ).length;

  return {
    atletiAttivi,
    atletiInProva,
    atletiSospesi,
    nuoviAtletiMese,
    atletiPersi,
    abbonamentiInScadenza,
    pagamentiInScadenza,
    pagamentiScaduti,
    totaleDaIncassare,
    incassatoNelMese,
    incassatoNellAnno,
    entratePreviste,
    insoluti,
    tassoDiIncasso,
    tassoDiRinnovo,
    churnRate,
    valoreMedioPerAtleta,
    mrr,
    arr,
    attivitaDaCompletare,
  };
}
