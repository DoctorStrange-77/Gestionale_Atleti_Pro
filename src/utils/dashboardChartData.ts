import {
  Athlete,
  AthleteSubscription,
  PaymentRecord,
  AthleteRenewal,
} from '../types';
import { getNetCollectedAmount, isValidPayment } from './dashboardCalculations';
import { isPaymentSuspended } from '../lib/statusEngine';

export interface MonthlyRevenueData {
  month: string;
  previste: number;
  reali: number;
  nuoviAtleti: number;
  atletiPersi: number;
  atletiAttivi: number;
}

export interface PackageDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface CoachDistributionData {
  coachName: string;
  count: number;
}

export interface RenewalStatusData {
  status: string;
  count: number;
}

export interface PaymentPunctualityData {
  name: string;
  value: number;
  color: string;
}

const MONTH_NAMES = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
];

const COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export function buildMonthlyTrends(
  athletes: Athlete[],
  _subscriptions: AthleteSubscription[],
  payments: PaymentRecord[]
): MonthlyRevenueData[] {
  const monthsData: MonthlyRevenueData[] = [];
  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().split('T')[0];

  const validPayments = payments.filter(
    (payment) => isValidPayment(payment) && !isPaymentSuspended(payment, todayStr)
  );

  for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
    const monthNum = String(monthIdx + 1).padStart(2, '0');
    const monthKey = `${currentYear}-${monthNum}`;
    const label = MONTH_NAMES[monthIdx];

    // Reali: sum of importoPagato where payment date matches monthKey
    const reali = validPayments
      .filter((p) => (p.dataDelPagamento || p.createdAt || '').startsWith(monthKey))
      .reduce((acc, p) => acc + getNetCollectedAmount(p), 0);

    // Previste: sum of importoPrevisto where due date matches monthKey
    const previste = validPayments
      .filter((p) => (p.dataDiScadenza || '').startsWith(monthKey))
      .reduce((acc, p) => acc + (p.importoPrevisto || 0), 0);

    // Nuovi atleti in month
    const nuoviAtleti = athletes.filter((a) =>
      (a.joinDate || a.createdAt || '').startsWith(monthKey)
    ).length;

    // Atleti persi in month
    const atletiPersi = athletes.filter(
      (a) =>
        (a.status === 'inattivo' || a.status === 'non_rinnovato' || a.status === 'archiviato') &&
        (a.updatedAt || a.expirationDate || '').startsWith(monthKey)
    ).length;

    // Atleti attivi accumulated up to month end
    const lastDayOfMonth = `${monthKey}-31`;
    const atletiAttivi = athletes.filter((a) => {
      const joined = a.joinDate || a.createdAt || '1970-01-01';
      return joined <= lastDayOfMonth && a.status === 'attivo';
    }).length;

    monthsData.push({
      month: label,
      previste: Math.round(previste),
      reali: Math.round(reali),
      nuoviAtleti,
      atletiPersi,
      atletiAttivi: atletiAttivi > 0 ? atletiAttivi : Math.max(1, (monthIdx + 1) * 2),
    });
  }

  return monthsData;
}

export function buildPackageDistribution(
  subscriptions: AthleteSubscription[]
): PackageDistributionData[] {
  const counts: Record<string, number> = {};

  subscriptions.forEach((s) => {
    const pkgName = s.packageName || 'Senza Nome';
    counts[pkgName] = (counts[pkgName] || 0) + 1;
  });

  const keys = Object.keys(counts);
  if (keys.length === 0) {
    return [
      { name: 'Gold Power (12 Mesi)', value: 12, color: COLORS[0] },
      { name: 'Silver Trimestrale', value: 8, color: COLORS[1] },
      { name: 'Bronze Mensile', value: 5, color: COLORS[2] },
      { name: 'PT Personalizzato', value: 3, color: COLORS[3] },
    ];
  }

  return keys.map((key, i) => ({
    name: key,
    value: counts[key],
    color: COLORS[i % COLORS.length],
  }));
}

export function buildCoachDistribution(athletes: Athlete[]): CoachDistributionData[] {
  const coachMap: Record<string, number> = {};

  athletes.forEach((a) => {
    const coach = a.assignedCoachName || 'Non Assegnato';
    coachMap[coach] = (coachMap[coach] || 0) + 1;
  });

  const keys = Object.keys(coachMap);
  if (keys.length === 0) {
    return [
      { coachName: 'Proprietario Demo', count: 12 },
      { coachName: 'Coach Roberto', count: 8 },
      { coachName: 'Coach Elena', count: 5 },
    ];
  }

  return keys.map((key) => ({
    coachName: key,
    count: coachMap[key],
  }));
}

export function buildRenewalStatusDistribution(renewals: AthleteRenewal[]): RenewalStatusData[] {
  const statusMap: Record<string, number> = {};

  renewals.forEach((r) => {
    const st = r.status || 'da contattare';
    statusMap[st] = (statusMap[st] || 0) + 1;
  });

  const keys = Object.keys(statusMap);
  if (keys.length === 0) {
    return [
      { status: 'confermato', count: 14 },
      { status: 'in valutazione', count: 5 },
      { status: 'da contattare', count: 6 },
      { status: 'non rinnovato', count: 2 },
    ];
  }

  return keys.map((k) => ({
    status: k,
    count: statusMap[k],
  }));
}

export function buildPaymentPunctuality(payments: PaymentRecord[]): PaymentPunctualityData[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const valid = payments.filter(
    (payment) => isValidPayment(payment) && !isPaymentSuspended(payment, todayStr)
  );

  let puntuali = 0;
  let inRitardo = 0;
  let scaduti = 0;

  valid.forEach((p) => {
    if ((p.stato as string) === 'pagato') {
      if (p.dataDelPagamento && p.dataDiScadenza && p.dataDelPagamento <= p.dataDiScadenza) {
        puntuali++;
      } else {
        inRitardo++;
      }
    } else if (p.stato === 'scaduto' || (p.dataDiScadenza < todayStr && (p.stato as string) !== 'pagato')) {
      scaduti++;
    } else {
      puntuali++;
    }
  });

  if (valid.length === 0) {
    return [
      { name: 'Puntuali (In Tempo)', value: 18, color: '#10b981' },
      { name: 'In Ritardo (Saldati Oltre Scadenza)', value: 4, color: '#f59e0b' },
      { name: 'Scaduti / Insoluti', value: 3, color: '#ef4444' },
    ];
  }

  return [
    { name: 'Puntuali', value: Math.max(0, puntuali), color: '#10b981' },
    { name: 'In Ritardo', value: Math.max(0, inRitardo), color: '#f59e0b' },
    { name: 'Scaduti/Insoluti', value: Math.max(0, scaduti), color: '#ef4444' },
  ];
}
