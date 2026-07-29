import {
  Athlete,
  AthleteSubscription,
  PaymentRecord,
  AthleteRenewal,
  PaymentMethod,
} from '../types';
import { isValidPayment, getSubscriptionDurationInMonths } from './dashboardCalculations';

export interface ReportFilterState {
  dateFilter: string; // '30_giorni' | '3_mesi' | '6_mesi' | 'anno_corrente' | 'anno_precedente' | 'personalizzato'
  customStartDate: string;
  customEndDate: string;
  athleteId: string; // 'tutti' or ID
  coachName: string; // 'tutti' or name
  packageName: string; // 'tutti' or name
  paymentMethod: string; // 'tutti' or method
  status: string; // 'tutti' or status
  serviceType: string; // 'tutti' or type
  comparePeriod: boolean; // compare with previous equal timeframe
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function computeDateRange(
  filter: string,
  customStart?: string,
  customEnd?: string
): DateRange {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const year = now.getFullYear();

  if (filter === 'personalizzato' && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }

  if (filter === '30_giorni') {
    const s = new Date(now);
    s.setDate(s.getDate() - 30);
    return { startDate: s.toISOString().split('T')[0], endDate: todayStr };
  }

  if (filter === '3_mesi') {
    const s = new Date(now);
    s.setMonth(s.getMonth() - 3);
    return { startDate: s.toISOString().split('T')[0], endDate: todayStr };
  }

  if (filter === '6_mesi') {
    const s = new Date(now);
    s.setMonth(s.getMonth() - 6);
    return { startDate: s.toISOString().split('T')[0], endDate: todayStr };
  }

  if (filter === 'anno_precedente') {
    return { startDate: `${year - 1}-01-01`, endDate: `${year - 1}-12-31` };
  }

  // Default 'anno_corrente'
  return { startDate: `${year}-01-01`, endDate: todayStr };
}

export function computePreviousComparisonRange(range: DateRange): DateRange {
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - diffDays);

  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0],
  };
}

export interface ReportItemDetail {
  id: string;
  date: string;
  title: string;
  category: string;
  athleteName: string;
  coachName: string;
  packageName: string;
  serviceType: string;
  paymentMethod: string;
  status: string;
  amountExpected: number;
  amountPaid: number;
  amountRemaining: number;
  notes?: string;
}

export interface ReportSummary {
  reportKey: string;
  reportName: string;
  totalCollected: number;
  totalExpected: number;
  totalOverdue: number;
  totalItemsCount: number;
  averageItemValue: number;
  growthPercentage?: number; // comparison with previous period
  prevTotalCollected?: number;
  items: ReportItemDetail[];
  groupedData: { label: string; value: number; subValue?: number; percentage?: number }[];
}

export function filterPayments(
  payments: PaymentRecord[],
  athletes: Athlete[],
  subscriptions: AthleteSubscription[],
  filters: ReportFilterState,
  range: DateRange
): PaymentRecord[] {
  const athleteMap = new Map(athletes.map((a) => [a.id, a]));
  const subMap = new Map(subscriptions.map((s) => [s.id, s]));

  return payments.filter((p) => {
    if (!isValidPayment(p)) return false;

    // Date filter: check if payment date or due date falls in range
    const pDate = p.dataDelPagamento || p.dataDiScadenza || p.createdAt.split('T')[0];
    if (pDate < range.startDate || pDate > range.endDate) return false;

    // Athlete filter
    if (filters.athleteId !== 'tutti' && p.atletaId !== filters.athleteId) return false;

    const athlete = athleteMap.get(p.atletaId);

    // Coach filter
    if (filters.coachName !== 'tutti') {
      const coach = athlete?.assignedCoachName || 'Non Assegnato';
      if (coach !== filters.coachName) return false;
    }

    // Package filter
    if (filters.packageName !== 'tutti') {
      const pkg = p.abbonamentoNome || 'Nessun Pacchetto';
      if (!pkg.toLowerCase().includes(filters.packageName.toLowerCase())) return false;
    }

    // Payment method filter
    if (filters.paymentMethod !== 'tutti') {
      const method = p.metodoDiPagamento || 'non specificato';
      if (method.toLowerCase() !== filters.paymentMethod.toLowerCase()) return false;
    }

    // Status filter
    if (filters.status !== 'tutti') {
      if ((p.stato || '').toLowerCase() !== filters.status.toLowerCase()) return false;
    }

    // Service type filter
    if (filters.serviceType !== 'tutti') {
      const sub = p.abbonamentoId ? subMap.get(p.abbonamentoId) : undefined;
      const discipline = athlete?.discipline || sub?.packageName || 'Generale';
      if (!discipline.toLowerCase().includes(filters.serviceType.toLowerCase())) return false;
    }

    return true;
  });
}

/**
 * Computes report data for a specific selected report type out of the 18 requested
 */
export function generateSpecificReport(
  reportKey: string,
  athletes: Athlete[],
  subscriptions: AthleteSubscription[],
  payments: PaymentRecord[],
  renewals: AthleteRenewal[],
  filters: ReportFilterState
): ReportSummary {
  const range = computeDateRange(filters.dateFilter, filters.customStartDate, filters.customEndDate);
  const prevRange = computePreviousComparisonRange(range);

  const athleteMap = new Map(athletes.map((a) => [a.id, a]));
  const subMap = new Map(subscriptions.map((s) => [s.id, s]));

  const filteredCurrentPayments = filterPayments(payments, athletes, subscriptions, filters, range);
  const filteredPrevPayments = filterPayments(payments, athletes, subscriptions, filters, prevRange);

  const curCollected = filteredCurrentPayments.reduce((acc, p) => acc + (p.importoPagato || 0), 0);
  const prevCollected = filteredPrevPayments.reduce((acc, p) => acc + (p.importoPagato || 0), 0);

  let growthPercentage: number | undefined = undefined;
  if (filters.comparePeriod && prevCollected > 0) {
    growthPercentage = Number((((curCollected - prevCollected) / prevCollected) * 100).toFixed(1));
  } else if (filters.comparePeriod && curCollected > 0) {
    growthPercentage = 100;
  } else if (filters.comparePeriod) {
    growthPercentage = 0;
  }

  const items: ReportItemDetail[] = [];
  const groupedDataMap = new Map<string, { value: number; subValue?: number }>();

  let reportName = 'Report Dettagliato';

  // 1. Incassi Giornalieri
  if (reportKey === 'incassi_giornalieri') {
    reportName = 'Incassi Giornalieri';
    filteredCurrentPayments.forEach((p) => {
      const day = p.dataDelPagamento || p.dataDiScadenza || 'Senza Data';
      const cur = groupedDataMap.get(day) || { value: 0, subValue: 0 };
      groupedDataMap.set(day, {
        value: cur.value + (p.importoPagato || 0),
        subValue: (cur.subValue || 0) + (p.importoPrevisto || 0),
      });

      const ath = athleteMap.get(p.atletaId);
      items.push({
        id: p.id,
        date: day,
        title: `Incasso ${p.numeroDellaRata || 'Rata'}`,
        category: 'Incasso Giornaliero',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: p.abbonamentoNome || 'Generico',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
        notes: p.note,
      });
    });
  }

  // 2. Incassi Mensili
  else if (reportKey === 'incassi_mensili') {
    reportName = 'Incassi Mensili';
    filteredCurrentPayments.forEach((p) => {
      const month = (p.dataDelPagamento || p.dataDiScadenza || '2026-01').substring(0, 7);
      const cur = groupedDataMap.get(month) || { value: 0, subValue: 0 };
      groupedDataMap.set(month, {
        value: cur.value + (p.importoPagato || 0),
        subValue: (cur.subValue || 0) + (p.importoPrevisto || 0),
      });

      const ath = athleteMap.get(p.atletaId);
      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Pagamento Mese ${month}`,
        category: 'Incasso Mensile',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: p.abbonamentoNome || 'Generico',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // 3. Incassi Annuali
  else if (reportKey === 'incassi_annuali') {
    reportName = 'Incassi Annuali';
    payments.filter(isValidPayment).forEach((p) => {
      const year = (p.dataDelPagamento || p.dataDiScadenza || '2026').substring(0, 4);
      const cur = groupedDataMap.get(year) || { value: 0, subValue: 0 };
      groupedDataMap.set(year, {
        value: cur.value + (p.importoPagato || 0),
        subValue: (cur.subValue || 0) + (p.importoPrevisto || 0),
      });

      const ath = athleteMap.get(p.atletaId);
      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Incasso Anno ${year}`,
        category: 'Incasso Annuale',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: p.abbonamentoNome || 'Generico',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // 4. Pagamenti Insoluti
  else if (reportKey === 'pagamenti_insoluti') {
    reportName = 'Pagamenti Insoluti';
    const todayStr = new Date().toISOString().split('T')[0];
    payments
      .filter(isValidPayment)
      .filter((p) => (p.stato === 'scaduto' || (p.dataDiScadenza < todayStr && p.stato !== 'pagato')) && p.importoResiduo > 0)
      .forEach((p) => {
        const ath = athleteMap.get(p.atletaId);
        groupedDataMap.set(p.atletaNome, {
          value: (groupedDataMap.get(p.atletaNome)?.value || 0) + p.importoResiduo,
          subValue: (groupedDataMap.get(p.atletaNome)?.subValue || 0) + 1,
        });

        items.push({
          id: p.id,
          date: p.dataDiScadenza,
          title: `Insoluto: ${p.numeroDellaRata || 'Rata'}`,
          category: 'Pagamento Scaduto',
          athleteName: p.atletaNome,
          coachName: ath?.assignedCoachName || 'Non Assegnato',
          packageName: p.abbonamentoNome || 'Generico',
          serviceType: ath?.discipline || 'Fitness',
          paymentMethod: p.metodoDiPagamento || 'non specificato',
          status: 'scaduto',
          amountExpected: p.importoPrevisto,
          amountPaid: p.importoPagato,
          amountRemaining: p.importoResiduo,
          notes: p.note,
        });
      });
  }

  // 5. Pagamenti Futuri
  else if (reportKey === 'pagamenti_futuri') {
    reportName = 'Pagamenti Futuri e Proiezioni';
    const todayStr = new Date().toISOString().split('T')[0];
    payments
      .filter(isValidPayment)
      .filter((p) => p.dataDiScadenza >= todayStr && (p.stato === 'da pagare' || p.stato === 'in scadenza' || p.stato === 'programmato'))
      .forEach((p) => {
        const month = p.dataDiScadenza.substring(0, 7);
        groupedDataMap.set(month, {
          value: (groupedDataMap.get(month)?.value || 0) + (p.importoResiduo || p.importoPrevisto),
        });

        const ath = athleteMap.get(p.atletaId);
        items.push({
          id: p.id,
          date: p.dataDiScadenza,
          title: `Rata in Arrivo: ${p.numeroDellaRata || 'Rata'}`,
          category: 'Programmato',
          athleteName: p.atletaNome,
          coachName: ath?.assignedCoachName || 'Non Assegnato',
          packageName: p.abbonamentoNome || 'Generico',
          serviceType: ath?.discipline || 'Fitness',
          paymentMethod: p.metodoDiPagamento || 'programmato',
          status: p.stato,
          amountExpected: p.importoPrevisto,
          amountPaid: p.importoPagato,
          amountRemaining: p.importoResiduo,
        });
      });
  }

  // 6. Abbonamenti in Scadenza
  else if (reportKey === 'abbonamenti_in_scadenza') {
    reportName = 'Abbonamenti in Scadenza';
    subscriptions.forEach((s) => {
      const ath = athleteMap.get(s.athleteId);
      const pkgName = s.packageName || 'Pacchetto Standard';
      groupedDataMap.set(pkgName, {
        value: (groupedDataMap.get(pkgName)?.value || 0) + 1,
        subValue: (groupedDataMap.get(pkgName)?.subValue || 0) + s.agreedPrice,
      });

      items.push({
        id: s.id,
        date: s.endDate,
        title: `Scadenza ${s.packageName}`,
        category: 'Abbonamento in Scadenza',
        athleteName: s.athleteName || ath?.firstName + ' ' + ath?.lastName,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: s.packageName,
        serviceType: ath?.discipline || 'Sala Pesi',
        paymentMethod: s.preferredPaymentMethod,
        status: s.status,
        amountExpected: s.agreedPrice,
        amountPaid: s.agreedPrice,
        amountRemaining: 0,
      });
    });
  }

  // 7. Rinnovi
  else if (reportKey === 'rinnovi') {
    reportName = 'Rinnovi Confezionati';
    renewals.filter((r) => r.status === 'confermato' || r.status === 'rinnovato').forEach((r) => {
      const ath = athleteMap.get(r.athleteId);
      groupedDataMap.set(r.status, {
        value: (groupedDataMap.get(r.status)?.value || 0) + 1,
      });

      items.push({
        id: r.id,
        date: r.endDate || '2026-07-01',
        title: `Rinnovo ${r.athleteName}`,
        category: 'Rinnovo Confermato',
        athleteName: r.athleteName,
        coachName: ath?.assignedCoachName || r.coachName || 'Non Assegnato',
        packageName: r.currentPackageName || 'Rinnovo Stesso Pacchetto',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: 'bonifico',
        status: r.status,
        amountExpected: r.price || 0,
        amountPaid: r.price || 0,
        amountRemaining: 0,
        notes: r.notes,
      });
    });
  }

  // 8. Mancati Rinnovi
  else if (reportKey === 'mancati_rinnovi') {
    reportName = 'Mancati Rinnovi / Churn';
    renewals.filter((r) => r.status === 'non rinnovato' || r.status === 'irraggiungibile').forEach((r) => {
      const ath = athleteMap.get(r.athleteId);
      groupedDataMap.set(r.status, {
        value: (groupedDataMap.get(r.status)?.value || 0) + 1,
      });

      items.push({
        id: r.id,
        date: r.endDate || '2026-07-01',
        title: `Mancato Rinnovo: ${r.athleteName}`,
        category: 'Non Rinnovato',
        athleteName: r.athleteName,
        coachName: ath?.assignedCoachName || r.coachName || 'Non Assegnato',
        packageName: r.currentPackageName || 'Sconosciuto',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: 'N/A',
        status: r.status,
        amountExpected: r.price || 0,
        amountPaid: 0,
        amountRemaining: r.price || 0,
        notes: r.notes,
      });
    });
  }

  // 9. Nuovi Atleti
  else if (reportKey === 'nuovi_atleti') {
    reportName = 'Acquisizione Nuovi Atleti';
    athletes.forEach((a) => {
      const source = a.acquisitionSource || 'diretto';
      groupedDataMap.set(source, {
        value: (groupedDataMap.get(source)?.value || 0) + 1,
      });

      items.push({
        id: a.id,
        date: a.joinDate || a.createdAt.split('T')[0],
        title: `Iscrizione ${a.firstName} ${a.lastName}`,
        category: 'Nuovo Iscritto',
        athleteName: `${a.firstName} ${a.lastName}`,
        coachName: a.assignedCoachName || 'Non Assegnato',
        packageName: a.activePackage || 'Pacchetto Iniziale',
        serviceType: a.discipline || 'Generico',
        paymentMethod: 'N/A',
        status: a.status,
        amountExpected: 0,
        amountPaid: 0,
        amountRemaining: 0,
      });
    });
  }

  // 10. Atleti Persi
  else if (reportKey === 'atleti_persi') {
    reportName = 'Atleti Inattivi e Disdetti';
    athletes
      .filter((a) => a.status === 'inattivo' || a.status === 'non_rinnovato' || a.status === 'archiviato')
      .forEach((a) => {
        groupedDataMap.set(a.status, {
          value: (groupedDataMap.get(a.status)?.value || 0) + 1,
        });

        items.push({
          id: a.id,
          date: a.expirationDate || a.updatedAt.split('T')[0],
          title: `Atleta Perso: ${a.firstName} ${a.lastName}`,
          category: 'Abbandono',
          athleteName: `${a.firstName} ${a.lastName}`,
          coachName: a.assignedCoachName || 'Non Assegnato',
          packageName: a.activePackage || 'Nessuno',
          serviceType: a.discipline || 'Generico',
          paymentMethod: 'N/A',
          status: a.status,
          amountExpected: 0,
          amountPaid: 0,
          amountRemaining: 0,
        });
      });
  }

  // 11. Fatturato per Coach
  else if (reportKey === 'fatturato_coach') {
    reportName = 'Fatturato per Coach';
    filteredCurrentPayments.forEach((p) => {
      const ath = athleteMap.get(p.atletaId);
      const coach = ath?.assignedCoachName || 'Non Assegnato';
      groupedDataMap.set(coach, {
        value: (groupedDataMap.get(coach)?.value || 0) + (p.importoPagato || 0),
      });

      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Fatturato Coach (${coach})`,
        category: 'Fatturato Coach',
        athleteName: p.atletaNome,
        coachName: coach,
        packageName: p.abbonamentoNome || 'Nessuno',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // 12. Fatturato per Pacchetto
  else if (reportKey === 'fatturato_pacchetto') {
    reportName = 'Fatturato per Pacchetto';
    filteredCurrentPayments.forEach((p) => {
      const pkg = p.abbonamentoNome || 'Senza Pacchetto';
      groupedDataMap.set(pkg, {
        value: (groupedDataMap.get(pkg)?.value || 0) + (p.importoPagato || 0),
      });

      const ath = athleteMap.get(p.atletaId);
      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Fatturato ${pkg}`,
        category: 'Fatturato Pacchetto',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: pkg,
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // 13. Fatturato per Servizio
  else if (reportKey === 'fatturato_servizio') {
    reportName = 'Fatturato per Tipologia di Servizio';
    filteredCurrentPayments.forEach((p) => {
      const ath = athleteMap.get(p.atletaId);
      const serv = ath?.discipline || p.abbonamentoNome || 'Servizio Allenamento';
      groupedDataMap.set(serv, {
        value: (groupedDataMap.get(serv)?.value || 0) + (p.importoPagato || 0),
      });

      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Servizio: ${serv}`,
        category: 'Fatturato Servizio',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: p.abbonamentoNome || 'Generico',
        serviceType: serv,
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // 14. Metodi di Pagamento
  else if (reportKey === 'metodi_pagamento') {
    reportName = 'Distribuzione Metodi di Pagamento';
    filteredCurrentPayments.forEach((p) => {
      const method = p.metodoDiPagamento || 'non specificato';
      groupedDataMap.set(method, {
        value: (groupedDataMap.get(method)?.value || 0) + (p.importoPagato || 0),
      });

      const ath = athleteMap.get(p.atletaId);
      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Canale ${method.toUpperCase()}`,
        category: 'Metodo Pagamento',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: p.abbonamentoNome || 'Generico',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: method,
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // 15. MRR
  else if (reportKey === 'mrr') {
    reportName = 'Monthly Recurring Revenue (MRR)';
    subscriptions
      .filter((s) => s.status === 'attivo' || s.status === 'in_scadenza')
      .forEach((s) => {
        const monthlyVal = s.agreedPrice / getSubscriptionDurationInMonths(s);
        groupedDataMap.set(s.packageName, {
          value: (groupedDataMap.get(s.packageName)?.value || 0) + Math.round(monthlyVal),
        });

        const ath = athleteMap.get(s.athleteId);
        items.push({
          id: s.id,
          date: s.startDate,
          title: `Quota Mensile ${s.packageName}`,
          category: 'Ricavo Mensile Ricorrente',
          athleteName: s.athleteName || ath?.firstName + ' ' + ath?.lastName,
          coachName: ath?.assignedCoachName || 'Non Assegnato',
          packageName: s.packageName,
          serviceType: ath?.discipline || 'Fitness',
          paymentMethod: s.preferredPaymentMethod,
          status: s.status,
          amountExpected: Math.round(monthlyVal),
          amountPaid: Math.round(monthlyVal),
          amountRemaining: 0,
        });
      });
  }

  // 16. ARR
  else if (reportKey === 'arr') {
    reportName = 'Annual Recurring Revenue (ARR)';
    subscriptions
      .filter((s) => s.status === 'attivo' || s.status === 'in_scadenza')
      .forEach((s) => {
        const annualVal = (s.agreedPrice / getSubscriptionDurationInMonths(s)) * 12;
        groupedDataMap.set(s.packageName, {
          value: (groupedDataMap.get(s.packageName)?.value || 0) + Math.round(annualVal),
        });

        const ath = athleteMap.get(s.athleteId);
        items.push({
          id: s.id,
          date: s.startDate,
          title: `ARR Annualizzato ${s.packageName}`,
          category: 'Ricavo Annuale Ricorrente',
          athleteName: s.athleteName || ath?.firstName + ' ' + ath?.lastName,
          coachName: ath?.assignedCoachName || 'Non Assegnato',
          packageName: s.packageName,
          serviceType: ath?.discipline || 'Fitness',
          paymentMethod: s.preferredPaymentMethod,
          status: s.status,
          amountExpected: Math.round(annualVal),
          amountPaid: Math.round(annualVal),
          amountRemaining: 0,
        });
      });
  }

  // 17. Durata Media del Rapporto
  else if (reportKey === 'durata_media_rapporto') {
    reportName = 'Durata Media del Rapporto (Tenure)';
    athletes.forEach((a) => {
      const join = new Date(a.joinDate || a.createdAt);
      const end = a.expirationDate ? new Date(a.expirationDate) : new Date();
      const months = Math.max(1, Math.round((end.getTime() - join.getTime()) / (1000 * 3600 * 24 * 30)));

      groupedDataMap.set(a.status, {
        value: (groupedDataMap.get(a.status)?.value || 0) + months,
      });

      items.push({
        id: a.id,
        date: a.joinDate || a.createdAt.split('T')[0],
        title: `Tenure: ${months} Mesi`,
        category: 'Permanenza Atleta',
        athleteName: `${a.firstName} ${a.lastName}`,
        coachName: a.assignedCoachName || 'Non Assegnato',
        packageName: a.activePackage || 'Standard',
        serviceType: a.discipline || 'Fitness',
        paymentMethod: 'N/A',
        status: a.status,
        amountExpected: months,
        amountPaid: months,
        amountRemaining: 0,
      });
    });
  }

  // 18. Valore Medio dell'Atleta (LTV/ARPU)
  else if (reportKey === 'valore_medio_atleta') {
    reportName = 'Valore Medio per Atleta (LTV / ARPU)';
    athletes.forEach((a) => {
      const athletePayments = payments.filter((p) => p.atletaId === a.id && isValidPayment(p));
      const totalPaid = athletePayments.reduce((acc, p) => acc + (p.importoPagato || 0), 0);

      groupedDataMap.set(a.firstName + ' ' + a.lastName, {
        value: totalPaid,
      });

      items.push({
        id: a.id,
        date: a.joinDate || a.createdAt.split('T')[0],
        title: `LTV Totale Atleta`,
        category: 'Valore Cliente',
        athleteName: `${a.firstName} ${a.lastName}`,
        coachName: a.assignedCoachName || 'Non Assegnato',
        packageName: a.activePackage || 'Standard',
        serviceType: a.discipline || 'Fitness',
        paymentMethod: 'N/A',
        status: a.status,
        amountExpected: totalPaid,
        amountPaid: totalPaid,
        amountRemaining: 0,
      });
    });
  }

  // Default fallback
  else {
    reportName = 'Analisi Generale Performance';
    filteredCurrentPayments.forEach((p) => {
      const ath = athleteMap.get(p.atletaId);
      items.push({
        id: p.id,
        date: p.dataDelPagamento || p.dataDiScadenza,
        title: `Pagamento ${p.numeroDellaRata || ''}`,
        category: 'Generico',
        athleteName: p.atletaNome,
        coachName: ath?.assignedCoachName || 'Non Assegnato',
        packageName: p.abbonamentoNome || 'Generico',
        serviceType: ath?.discipline || 'Fitness',
        paymentMethod: p.metodoDiPagamento || 'contanti',
        status: p.stato,
        amountExpected: p.importoPrevisto,
        amountPaid: p.importoPagato,
        amountRemaining: p.importoResiduo,
      });
    });
  }

  // Calculate aggregate totals
  const totalCollected = items.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalExpected = items.reduce((acc, i) => acc + i.amountExpected, 0);
  const totalOverdue = items.reduce((acc, i) => acc + i.amountRemaining, 0);
  const totalItemsCount = items.length;
  const averageItemValue = totalItemsCount > 0 ? Math.round(totalCollected / totalItemsCount) : 0;

  const groupedData = Array.from(groupedDataMap.entries()).map(([label, val]) => ({
    label,
    value: val.value,
    subValue: val.subValue,
    percentage: totalCollected > 0 ? Math.round((val.value / totalCollected) * 100) : 0,
  }));

  return {
    reportKey,
    reportName,
    totalCollected,
    totalExpected,
    totalOverdue,
    totalItemsCount,
    averageItemValue,
    growthPercentage,
    prevTotalCollected: prevCollected,
    items,
    groupedData,
  };
}

/**
 * Export data array to CSV downloadable file
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(';'),
    ...rows.map((row) =>
      row
        .map((field) => {
          const str = String(field ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(';')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
