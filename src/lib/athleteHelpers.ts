import { AthleteStatus, AthletePaymentStatus, AcquisitionSource, ContactChannel } from '../types';

export interface StatusConfig {
  code: AthleteStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const ATHLETE_STATUS_MAP: Record<AthleteStatus, StatusConfig> = {
  potenziale_cliente: {
    code: 'potenziale_cliente',
    label: 'Potenziale Cliente',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  prova: {
    code: 'prova',
    label: 'In Prova',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotClass: 'bg-cyan-400',
  },
  onboarding: {
    code: 'onboarding',
    label: 'Onboarding',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  attivo: {
    code: 'attivo',
    label: 'Attivo',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  sospeso: {
    code: 'sospeso',
    label: 'Sospeso',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  in_pausa: {
    code: 'in_pausa',
    label: 'In Pausa',
    badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-700',
    dotClass: 'bg-zinc-400',
  },
  moroso: {
    code: 'moroso',
    label: 'Moroso',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 font-bold animate-pulse',
    dotClass: 'bg-red-500',
  },
  in_scadenza: {
    code: 'in_scadenza',
    label: 'In Scadenza',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
  non_rinnovato: {
    code: 'non_rinnovato',
    label: 'Non Rinnovato',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dotClass: 'bg-purple-400',
  },
  inattivo: {
    code: 'inattivo',
    label: 'Inattivo',
    badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    dotClass: 'bg-zinc-500',
  },
  archiviato: {
    code: 'archiviato',
    label: 'Archiviato',
    badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    dotClass: 'bg-zinc-600',
  },
};

export const PAYMENT_STATUS_MAP: Record<AthletePaymentStatus, { label: string; badgeClass: string }> = {
  regolare: {
    label: 'Regolare',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  in_scadenza: {
    label: 'In Scadenza',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  scaduto: {
    label: 'Scaduto',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  in_attesa: {
    label: 'In Attesa',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  moroso: {
    label: 'Moroso',
    badgeClass: 'bg-red-600/20 text-red-400 border-red-600/40 font-bold',
  },
  'pagamento imminente': {
    label: 'Pagamento Imminente',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  'pagamento parziale': {
    label: 'Pagamento Parziale',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  'pagamento scaduto': {
    label: 'Pagamento Scaduto',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30 font-semibold',
  },
  'più pagamenti scaduti': {
    label: 'Più Pagamenti Scaduti',
    badgeClass: 'bg-rose-600/20 text-rose-400 border-rose-500/40 font-bold animate-pulse',
  },
  'nessun pagamento programmato': {
    label: 'Nessun Pagamento Programmato',
    badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  },
};

export const ACQUISITION_SOURCE_LABELS: Record<AcquisitionSource, string> = {
  social: 'Social Media (Instagram / Facebook / TikTok)',
  passaparola: 'Passaparola / Amici',
  sito_web: 'Sito Web / Google',
  pubblicita: 'Pubblicità / Ads',
  altro: 'Altro / Evento',
};

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  telefono: 'Chiamata Telefonica',
  sms: 'SMS',
};
