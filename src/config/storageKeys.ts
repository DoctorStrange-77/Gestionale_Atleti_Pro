// Centralized Storage Keys configuration for local application data
export const STORAGE_KEYS = {
  ATHLETES: 'builder_athlete_athletes_list',
  PACKAGES: 'b_packages_list',
  SUBSCRIPTIONS: 'b_subscriptions_list_v2',
  PAYMENTS: 'doctor_strength_payments',
  FINANCIAL_AUDIT: 'doctor_strength_financial_audit',
  RENEWALS: 'builder_athlete_renewals',
  PAUSES: 'builder_athlete_pauses',
  TASKS: 'builder_athlete_tasks',
  CALENDAR: 'builder_athlete_calendar_events',
  DOCUMENTS: 'builder_athlete_documents_v1',
  CONSENTS: 'builder_athlete_consents_v1',
  COMMUNICATIONS: 'builder_athlete_communications_v1',
  COMM_TEMPLATES: 'builder_athlete_comm_templates_v1',
  COMM_API_CONFIG: 'builder_athlete_comm_api_config_v1',
  SETTINGS: 'builder_athlete_settings_v1',
  AUDIT_LOGS: 'builder_athlete_audit_logs_v1',
  SAVED_REPORTS: 'builder_athlete_saved_reports_v1',
  EXTERNAL_INVOICES: 'builder_athlete_external_invoices_v1',
} as const;

// Helper sub-key functions for athlete details
export const ATHLETE_SUBKEYS = {
  notes: (athleteId: string) => `builder_athlete_${athleteId}_notes`,
  timeline: (athleteId: string) => `builder_athlete_${athleteId}_timeline`,
  subscriptions: (athleteId: string) => `builder_athlete_${athleteId}_subscriptions`,
  payments: (athleteId: string) => `builder_athlete_${athleteId}_payments`,
  documents: (athleteId: string) => `builder_athlete_${athleteId}_documents`,
  activities: (athleteId: string) => `builder_athlete_${athleteId}_activities`,
  communications: (athleteId: string) => `builder_athlete_${athleteId}_communications`,
  detailSubscriptions: (athleteId: string) => `b_athlete_detail_${athleteId}_subscriptions`,
};

// Known prefixes belonging strictly to this application
export const APP_STORAGE_PREFIXES = [
  'builder_athlete_',
  'b_athlete_detail_',
  'doctor_strength_',
  'b_packages_list',
  'b_subscriptions_list',
] as const;

/**
 * Checks whether a given localStorage key belongs exclusively to this application.
 */
export function isAppStorageKey(key: string): boolean {
  if (Object.values(STORAGE_KEYS).includes(key as any)) {
    return true;
  }
  return APP_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/**
 * Retrieves all localStorage keys belonging strictly to this application.
 */
export function getAllAppStorageKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isAppStorageKey(key)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Deletes ONLY the localStorage keys belonging to this application.
 * Never calls localStorage.clear() to avoid touching other domain data.
 */
export function clearAppLocalStorage(): void {
  const keysToRemove = getAllAppStorageKeys();
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Exports all local application data as a JSON object.
 */
export function exportAppLocalStorage(): Record<string, any> {
  const appKeys = getAllAppStorageKeys();
  const exportData: Record<string, any> = {};

  appKeys.forEach((key) => {
    const rawVal = localStorage.getItem(key);
    if (rawVal !== null) {
      try {
        exportData[key] = JSON.parse(rawVal);
      } catch {
        exportData[key] = rawVal;
      }
    }
  });

  return exportData;
}

/**
 * Imports a JSON backup, overwriting ONLY application-owned localStorage keys.
 */
export function importAppLocalStorage(data: Record<string, any>): void {
  // 1. Remove existing app keys
  clearAppLocalStorage();

  // 2. Set new data for valid app keys
  Object.entries(data).forEach(([key, val]) => {
    if (isAppStorageKey(key)) {
      const stringified = typeof val === 'string' ? val : JSON.stringify(val);
      localStorage.setItem(key, stringified);
    }
  });
}
