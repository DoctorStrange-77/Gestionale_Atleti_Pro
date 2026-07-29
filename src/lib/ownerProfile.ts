import { STORAGE_KEYS, getAllAppStorageKeys } from '../config/storageKeys';
import { LocalOwnerProfile } from '../types';

export const LOCAL_OWNER_ID = 'local-owner';
export const DEFAULT_OWNER_EMAIL = 'owner.demo@example.com';
export const DEFAULT_ORGANIZATION_NAME = 'Builder Athlete Manager Demo';

export function isValidOwnerProfile(value: unknown): value is LocalOwnerProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const profile = value as Partial<LocalOwnerProfile>;
  return (
    typeof profile.firstName === 'string' &&
    profile.firstName.trim().length >= 2 &&
    typeof profile.lastName === 'string' &&
    profile.lastName.trim().length >= 2 &&
    typeof profile.fullName === 'string' &&
    profile.fullName.trim().length >= 5 &&
    profile.role === 'proprietario' &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  );
}

export function readOwnerProfile(): LocalOwnerProfile | null {
  const rawProfile = localStorage.getItem(STORAGE_KEYS.OWNER_PROFILE);
  const setupCompleted = localStorage.getItem(STORAGE_KEYS.INITIAL_SETUP_COMPLETED) === 'true';
  if (!rawProfile || !setupCompleted) return null;
  try {
    const parsed: unknown = JSON.parse(rawProfile);
    return isValidOwnerProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveOwnerProfile(profile: LocalOwnerProfile): void {
  localStorage.setItem(STORAGE_KEYS.OWNER_PROFILE, JSON.stringify(profile));
  localStorage.setItem(STORAGE_KEYS.INITIAL_SETUP_COMPLETED, 'true');
}

export function getOwnerDisplayName(): string {
  return readOwnerProfile()?.fullName || 'Proprietario Demo';
}

const OWNER_NAME_FIELDS = new Set([
  'assignedCoachName',
  'coachName',
  'responsibleName',
  'authorName',
  'userName',
  'autore',
  'authorization',
  'utenteCheHaRegistrato',
]);
const OWNER_ID_FIELDS = new Set(['assignedCoachId', 'ownerId', 'userId']);
const LEGACY_OWNER_NAME = ['Salvatore', 'Carotenuto'].join(' ');
const LEGACY_OWNER_ID = ['demo', 'user', 'owner'].join('-');

function migrateOwnerFields(value: unknown, ownerFullName: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => migrateOwnerFields(item, ownerFullName));
  }
  if (typeof value !== 'object' || value === null) return value;

  const source = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(source).map(([key, fieldValue]) => {
      if (OWNER_NAME_FIELDS.has(key) && typeof fieldValue === 'string') {
        if (fieldValue === LEGACY_OWNER_NAME) return [key, ownerFullName];
        if (fieldValue.startsWith(`${LEGACY_OWNER_NAME} (`)) {
          return [key, `${ownerFullName}${fieldValue.slice(LEGACY_OWNER_NAME.length)}`];
        }
      }
      if (OWNER_ID_FIELDS.has(key) && fieldValue === LEGACY_OWNER_ID) {
        return [key, LOCAL_OWNER_ID];
      }
      return [key, migrateOwnerFields(fieldValue, ownerFullName)];
    })
  );
}

export function migrateLegacyOwnerData(ownerFullName: string): void {
  if (localStorage.getItem(STORAGE_KEYS.OWNER_MIGRATION_COMPLETED) === 'true') return;

  const excludedKeys = new Set<string>([
    STORAGE_KEYS.OWNER_PROFILE,
    STORAGE_KEYS.INITIAL_SETUP_COMPLETED,
    STORAGE_KEYS.OWNER_MIGRATION_COMPLETED,
  ]);
  getAllAppStorageKeys()
    .filter((key) => !excludedKeys.has(key))
    .forEach((key) => {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) return;
      try {
        const parsed: unknown = JSON.parse(rawValue);
        const migrated = migrateOwnerFields(parsed, ownerFullName);
        localStorage.setItem(key, JSON.stringify(migrated));
      } catch {
        // Plain strings and malformed legacy values are intentionally left untouched.
      }
    });

  localStorage.setItem(STORAGE_KEYS.OWNER_MIGRATION_COMPLETED, 'true');
}
