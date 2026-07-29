import {
  PackageDurationUnit,
  PaymentFrequency,
  SubscriptionInstallment,
  SubscriptionStatus,
  AthleteSubscription,
} from '../types';

/**
 * Automatically calculates end date given start date and duration
 */
export function calculateEndDate(
  startDateStr: string,
  durationValue: number,
  durationUnit: PackageDurationUnit
): string {
  if (!startDateStr) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return startDateStr;

  const val = Math.max(1, durationValue || 1);

  switch (durationUnit) {
    case 'mensile':
      date.setMonth(date.getMonth() + val);
      break;
    case 'bimestrale':
      date.setMonth(date.getMonth() + val * 2);
      break;
    case 'trimestrale':
      date.setMonth(date.getMonth() + val * 3);
      break;
    case 'quadrimestrale':
      date.setMonth(date.getMonth() + val * 4);
      break;
    case 'semestrale':
      date.setMonth(date.getMonth() + val * 6);
      break;
    case 'annuale':
      date.setFullYear(date.getFullYear() + val);
      break;
    case 'servizio_singolo':
    case 'numero_consulenze':
    case 'numero_checkin':
      // Default validity is 3 months for carnet/single services unless customized
      date.setMonth(date.getMonth() + 3);
      break;
    case 'personalizzata':
    default:
      date.setMonth(date.getMonth() + val);
      break;
  }

  // Subtract 1 day for clean inclusive end date (e.g. 01/01 to 31/12)
  date.setDate(date.getDate() - 1);

  return date.toISOString().split('T')[0];
}

/**
 * Calculates due date for installment #N based on payment frequency
 */
function calculateNextInstallmentDate(
  baseDateStr: string,
  installmentIndex: number, // 0-based index of installment
  frequency: PaymentFrequency
): string {
  if (!baseDateStr) return '';
  const date = new Date(baseDateStr);
  if (isNaN(date.getTime())) return baseDateStr;

  switch (frequency) {
    case 'mensile':
      date.setMonth(date.getMonth() + installmentIndex);
      break;
    case 'bimestrale':
      date.setMonth(date.getMonth() + installmentIndex * 2);
      break;
    case 'trimestrale':
      date.setMonth(date.getMonth() + installmentIndex * 3);
      break;
    case 'quadrimestrale':
      date.setMonth(date.getMonth() + installmentIndex * 4);
      break;
    case 'semestrale':
      date.setMonth(date.getMonth() + installmentIndex * 6);
      break;
    case 'unica_soluzione':
    case 'personalizzata':
    default:
      date.setMonth(date.getMonth() + installmentIndex);
      break;
  }

  return date.toISOString().split('T')[0];
}

/**
 * Generates the list of installments
 */
export function generateInstallmentPlan(params: {
  agreedPrice: number;
  downPayment: number;
  installmentCount: number;
  startDate: string;
  firstInstallmentDate: string;
  paymentFrequency: PaymentFrequency;
}): SubscriptionInstallment[] {
  const {
    agreedPrice,
    downPayment,
    installmentCount,
    startDate,
    firstInstallmentDate,
    paymentFrequency,
  } = params;

  const result: SubscriptionInstallment[] = [];
  const totalAgreed = Math.max(0, Number(agreedPrice) || 0);
  const deposit = Math.max(0, Number(downPayment) || 0);

  let currentNumber = 1;

  // 1. Acconto (if specified)
  if (deposit > 0) {
    result.push({
      id: `inst-deposit-${Date.now()}`,
      number: currentNumber,
      label: 'Acconto Iniziale / Quota Attivazione',
      dueDate: startDate || new Date().toISOString().split('T')[0],
      amount: Math.min(deposit, totalAgreed),
      status: 'in_attesa',
    });
    currentNumber++;
  }

  const remainingAmount = Math.max(0, totalAgreed - deposit);
  const count = Math.max(1, installmentCount || 1);

  if (remainingAmount <= 0) {
    return result;
  }

  // Divide remaining amount across installments
  const rawPerInstallment = remainingAmount / count;
  const roundedPerInstallment = Math.floor(rawPerInstallment * 100) / 100;

  // Sum of rounded installments before adjustment
  let accumulated = roundedPerInstallment * count;
  let remainder = Math.round((remainingAmount - accumulated) * 100) / 100;

  const baseDate = firstInstallmentDate || startDate || new Date().toISOString().split('T')[0];

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    // Add remainder to last installment so total exact match
    const installmentAmount = isLast
      ? Math.round((roundedPerInstallment + remainder) * 100) / 100
      : roundedPerInstallment;

    const dueDate = calculateNextInstallmentDate(baseDate, i, paymentFrequency);

    result.push({
      id: `inst-${i + 1}-${Date.now()}`,
      number: currentNumber,
      label: count === 1 ? 'Rata Unica (Saldo)' : `Rata ${i + 1} di ${count}`,
      dueDate,
      amount: installmentAmount,
      status: 'in_attesa',
    });

    currentNumber++;
  }

  return result;
}

/**
 * Checks if sum of installments equals the agreed price
 */
export function verifyInstallmentsTotal(
  installments: SubscriptionInstallment[],
  agreedPrice: number
): { valid: boolean; total: number; diff: number } {
  const total = installments.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
  const roundedTotal = Math.round(total * 100) / 100;
  const roundedAgreed = Math.round((Number(agreedPrice) || 0) * 100) / 100;
  const diff = Math.round((roundedAgreed - roundedTotal) * 100) / 100;

  return {
    valid: Math.abs(diff) < 0.01,
    total: roundedTotal,
    diff,
  };
}

/**
 * Calculates dynamic status based on dates, grace period, and payment state
 */
export function computeSubscriptionStatus(
  sub: AthleteSubscription,
  todayStr: string = new Date().toISOString().split('T')[0]
): SubscriptionStatus {
  if (sub.status === 'bozza' || sub.status === 'annullato' || sub.status === 'rinnovato') {
    return sub.status;
  }

  if (sub.status === 'sospeso') {
    return 'sospeso';
  }

  const today = new Date(todayStr).getTime();
  const start = new Date(sub.startDate).getTime();
  const end = new Date(sub.endDate).getTime();
  const graceDaysMs = (sub.gracePeriodDays || 5) * 86400000;

  if (today < start) {
    return 'futuro';
  }

  if (today > end + graceDaysMs) {
    return 'scaduto';
  }

  // Check if expiring soon (e.g. within 15 days of end date)
  const fifteenDaysMs = 15 * 86400000;
  if (today >= end - fifteenDaysMs && today <= end + graceDaysMs) {
    return 'in_scadenza';
  }

  return 'attivo';
}
