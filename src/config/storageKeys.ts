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
  OWNER_PROFILE: 'builder_athlete_owner_profile',
  INITIAL_SETUP_COMPLETED: 'builder_athlete_initial_setup_completed',
  OWNER_MIGRATION_COMPLETED: 'builder_athlete_owner_migration_completed',
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
  if ((Object.values(STORAGE_KEYS) as readonly string[]).includes(key)) {
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
export function exportAppLocalStorage(): Record<string, unknown> {
  const appKeys = getAllAppStorageKeys();
  const exportData: Record<string, unknown> = {};

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
 * Imports a validated backup transactionally. If a write fails, the previous
 * application data is restored before the error is propagated.
 */
export function importAppLocalStorage(data: Record<string, unknown>): void {
  const recognizedEntries = Object.entries(data).filter(([key]) => isAppStorageKey(key));
  if (recognizedEntries.length === 0) {
    throw new Error('Il backup non contiene chiavi appartenenti all’applicazione.');
  }

  const temporaryBackup = exportAppLocalStorage();
  const writeEntries = (entries: [string, unknown][]) => {
    entries.forEach(([key, value]) => {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (serialized === undefined) {
        throw new Error(`Valore non serializzabile per la chiave ${key}.`);
      }
      localStorage.setItem(key, serialized);
    });
  };

  clearAppLocalStorage();
  try {
    writeEntries(recognizedEntries);
  } catch (importError) {
    clearAppLocalStorage();
    try {
      writeEntries(Object.entries(temporaryBackup));
    } catch (rollbackError) {
      console.error('Ripristino automatico del backup temporaneo fallito:', rollbackError);
    }
    throw importError;
  }
}

/**
 * Resets demo entities while preserving the first-run owner configuration.
 */
export function clearAppDemoData(): void {
  const preservedKeys = new Set<string>([
    STORAGE_KEYS.OWNER_PROFILE,
    STORAGE_KEYS.INITIAL_SETUP_COMPLETED,
    STORAGE_KEYS.OWNER_MIGRATION_COMPLETED,
  ]);
  getAllAppStorageKeys()
    .filter((key) => !preservedKeys.has(key))
    .forEach((key) => localStorage.removeItem(key));
}

export function isQuotaExceededError(error: unknown): boolean {
  const errorName =
    typeof error === 'object' && error !== null && 'name' in error
      ? String(error.name)
      : '';
  return (
    errorName === 'QuotaExceededError' ||
    errorName === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}
