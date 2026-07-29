import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PackageItem, PackageDurationUnit, PaymentFrequency, DiscountType } from '../types';
import { useAthletes } from './AthletesContext';

interface PackagesContextType {
  packages: PackageItem[];
  addPackage: (pkg: Omit<PackageItem, 'id' | 'createdAt' | 'updatedAt'>) => PackageItem;
  updatePackage: (id: string, pkgData: Partial<PackageItem>) => void;
  duplicatePackage: (id: string) => PackageItem | null;
  togglePackageStatus: (id: string) => void;
  deletePackage: (id: string) => { success: boolean; isUsed: boolean; athleteNames: string[]; count: number };
  checkPackageUsage: (pkg: PackageItem) => { isUsed: boolean; athleteNames: string[]; count: number };
  getPackageById: (id: string) => PackageItem | undefined;
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined);

const INITIAL_PACKAGES_SEED: PackageItem[] = [
  {
    id: 'pkg-1',
    name: 'Abbonamento Annuale Gold Power (Pagamento Mensile)',
    description: 'Contratto annuale con addebito o rata mensile. Include accesso illimitato alle sale, schede d\'allenamento aggiornate mensilmente e supporto prioritario.',
    price: 780,
    durationValue: 12,
    durationUnit: 'mensile',
    paymentFrequency: 'mensile',
    installmentCount: 12,
    includedServices: ['Accesso Illimitato H24', 'Schede Mensili Personalizzate', '1 Check Plicometrico al Mese', 'Assistenza WhatsApp'],
    renewalType: 'manuale',
    canBeSuspended: true,
    maxSuspensionPeriod: '30 giorni',
    initialFee: 30,
    discountType: 'nessuno',
    discountValue: 0,
    status: 'attivo',
    notes: 'Esempio: Contratto annuale pagato ogni mese (12 rate da €65).',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'pkg-2',
    name: 'Abbonamento Annuale Gold Single Pay (Scontato)',
    description: 'Contratto annuale saldato in un\'unica soluzione con sconto cassa speciale e quota d\'iscrizione azzerata.',
    price: 720,
    durationValue: 1,
    durationUnit: 'annuale',
    paymentFrequency: 'unica_soluzione',
    installmentCount: 1,
    includedServices: ['Accesso Illimitato H24', 'Schede Personalizzate', 'Valutazione Posturale Iniziale', 'Gadget Club Omaggio'],
    renewalType: 'automatico',
    canBeSuspended: true,
    maxSuspensionPeriod: '60 giorni',
    initialFee: 0,
    discountType: 'fisso',
    discountValue: 60,
    status: 'attivo',
    notes: 'Esempio: Contratto annuale pagato in un’unica soluzione.',
    createdAt: '2026-01-12T10:30:00.000Z',
    updatedAt: '2026-01-12T10:30:00.000Z',
  },
  {
    id: 'pkg-3',
    name: 'Percorso Semestrale Performance (2 Rate)',
    description: 'Contratto di 6 mesi pagato in due rate trimestrali. Ideale per atleti in preparazione stagionale.',
    price: 420,
    durationValue: 6,
    durationUnit: 'semestrale',
    paymentFrequency: 'trimestrale',
    installmentCount: 2,
    includedServices: ['Programmazione 24 Settimane', '2 Check-in Plicometrici', 'Sconto 10% Integratori Partner'],
    renewalType: 'manuale',
    canBeSuspended: true,
    maxSuspensionPeriod: '21 giorni',
    initialFee: 20,
    discountType: 'nessuno',
    discountValue: 0,
    status: 'attivo',
    notes: 'Esempio: Contratto semestrale pagato in due rate (2 rate da €210).',
    createdAt: '2026-02-01T14:00:00.000Z',
    updatedAt: '2026-02-01T14:00:00.000Z',
  },
  {
    id: 'pkg-4',
    name: 'Trimestrale Fit Pay Monthly',
    description: 'Contratto di 3 mesi con frazionamento dei pagamenti su base mensile.',
    price: 240,
    durationValue: 3,
    durationUnit: 'trimestrale',
    paymentFrequency: 'mensile',
    installmentCount: 3,
    includedServices: ['Accesso Palestra', 'Scheda Allenamento Base', 'Check-in Finale'],
    renewalType: 'manuale',
    canBeSuspended: true,
    maxSuspensionPeriod: '14 giorni',
    initialFee: 15,
    discountType: 'percentuale',
    discountValue: 5,
    status: 'attivo',
    notes: 'Esempio: Contratto trimestrale pagato mensilmente (3 rate da €80).',
    createdAt: '2026-02-15T11:20:00.000Z',
    updatedAt: '2026-02-15T11:20:00.000Z',
  },
  {
    id: 'pkg-5',
    name: 'Carnet 10 Consulenze Personal Training',
    description: 'Pacchetto lezioni singole 1-on-1 con il coach. Utilizzabile entro 6 mesi dall\'attivazione.',
    price: 450,
    durationValue: 10,
    durationUnit: 'numero_consulenze',
    paymentFrequency: 'unica_soluzione',
    installmentCount: 1,
    includedServices: ['10 Sessioni Individuali 60min', 'Anamnesi Funzionale', 'Integrazione e Nutrizione'],
    renewalType: 'manuale',
    canBeSuspended: false,
    maxSuspensionPeriod: 'Non applicabile',
    initialFee: 0,
    discountType: 'nessuno',
    discountValue: 0,
    status: 'attivo',
    notes: 'Durata in numero di consulenze.',
    createdAt: '2026-03-01T16:45:00.000Z',
    updatedAt: '2026-03-01T16:45:00.000Z',
  },
  {
    id: 'pkg-6',
    name: 'Servizio Singolo - Anamnesi & Test Massimali',
    description: 'Singola valutazione prestazionale con bioimpedenziometria BIA, plicometria e test 1RM.',
    price: 80,
    durationValue: 1,
    durationUnit: 'servizio_singolo',
    paymentFrequency: 'unica_soluzione',
    installmentCount: 1,
    includedServices: ['Test Massimali 1RM', 'Analisi Plicometrica BIA', 'Report PDF Dettagliato'],
    renewalType: 'manuale',
    canBeSuspended: false,
    maxSuspensionPeriod: 'N/A',
    initialFee: 0,
    discountType: 'nessuno',
    discountValue: 0,
    status: 'attivo',
    notes: 'Servizio singolo una tantum.',
    createdAt: '2026-03-10T12:00:00.000Z',
    updatedAt: '2026-03-10T12:00:00.000Z',
  },
  {
    id: 'pkg-7',
    name: 'Carnet 5 Check-In Plicometrici',
    description: 'Monitoraggio costante della composizione corporea e delle pliche per atleti in cut o bulk.',
    price: 120,
    durationValue: 5,
    durationUnit: 'numero_checkin',
    paymentFrequency: 'unica_soluzione',
    installmentCount: 1,
    includedServices: ['5 Mappature Plicometriche', 'Grafico di Progresso', 'Revisione Macro Nutrizionali'],
    renewalType: 'manuale',
    canBeSuspended: false,
    maxSuspensionPeriod: 'N/A',
    initialFee: 0,
    discountType: 'nessuno',
    discountValue: 0,
    status: 'attivo',
    notes: 'Durata in numero di check-in.',
    createdAt: '2026-03-15T08:30:00.000Z',
    updatedAt: '2026-03-15T08:30:00.000Z',
  },
];

export const PackagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { athletes } = useAthletes();

  const [packages, setPackages] = useState<PackageItem[]>(() => {
    const saved = localStorage.getItem('b_packages_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed parsing packages from localStorage', e);
      }
    }
    return INITIAL_PACKAGES_SEED;
  });

  useEffect(() => {
    localStorage.setItem('b_packages_list', JSON.stringify(packages));
  }, [packages]);

  // Check if package is used by any athlete
  const checkPackageUsage = (pkg: PackageItem) => {
    const matchedAthletes: string[] = [];

    // Check athletes activePackage
    athletes.forEach((athlete) => {
      if (
        athlete.activePackage &&
        (athlete.activePackage.toLowerCase().includes(pkg.name.toLowerCase()) ||
          pkg.name.toLowerCase().includes(athlete.activePackage.toLowerCase()))
      ) {
        matchedAthletes.push(`${athlete.firstName} ${athlete.lastName}`);
      }
    });

    // Also check localStorage subscriptions if present
    try {
      athletes.forEach((a) => {
        const subSaved = localStorage.getItem(`b_athlete_detail_${a.id}_subscriptions`);
        if (subSaved) {
          const subs = JSON.parse(subSaved);
          if (Array.isArray(subs)) {
            subs.forEach((s: any) => {
              if (
                s.packageName &&
                (s.packageName.toLowerCase().includes(pkg.name.toLowerCase()) ||
                  pkg.name.toLowerCase().includes(s.packageName.toLowerCase()))
              ) {
                const fullName = `${a.firstName} ${a.lastName}`;
                if (!matchedAthletes.includes(fullName)) {
                  matchedAthletes.push(fullName);
                }
              }
            });
          }
        }
      });
    } catch (e) {
      /* ignore */
    }

    return {
      isUsed: matchedAthletes.length > 0,
      athleteNames: matchedAthletes,
      count: matchedAthletes.length,
    };
  };

  const addPackage = (data: Omit<PackageItem, 'id' | 'createdAt' | 'updatedAt'>): PackageItem => {
    const now = new Date().toISOString();
    const newPkg: PackageItem = {
      ...data,
      id: `pkg-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setPackages((prev) => [newPkg, ...prev]);
    return newPkg;
  };

  const updatePackage = (id: string, pkgData: Partial<PackageItem>) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...pkgData,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const duplicatePackage = (id: string): PackageItem | null => {
    const original = packages.find((p) => p.id === id);
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicatedPkg: PackageItem = {
      ...original,
      id: `pkg-${Date.now()}`,
      name: `${original.name} (Copia)`,
      createdAt: now,
      updatedAt: now,
    };

    setPackages((prev) => [duplicatedPkg, ...prev]);
    return duplicatedPkg;
  };

  const togglePackageStatus = (id: string) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'attivo' ? 'disattivato' : 'attivo';
          return {
            ...p,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const deletePackage = (
    id: string
  ): { success: boolean; isUsed: boolean; athleteNames: string[]; count: number } => {
    const target = packages.find((p) => p.id === id);
    if (!target) {
      return { success: false, isUsed: false, athleteNames: [], count: 0 };
    }

    const usage = checkPackageUsage(target);
    if (usage.isUsed) {
      return {
        success: false,
        isUsed: true,
        athleteNames: usage.athleteNames,
        count: usage.count,
      };
    }

    setPackages((prev) => prev.filter((p) => p.id !== id));
    return { success: true, isUsed: false, athleteNames: [], count: 0 };
  };

  const getPackageById = (id: string) => {
    return packages.find((p) => p.id === id);
  };

  return (
    <PackagesContext.Provider
      value={{
        packages,
        addPackage,
        updatePackage,
        duplicatePackage,
        togglePackageStatus,
        deletePackage,
        checkPackageUsage,
        getPackageById,
      }}
    >
      {children}
    </PackagesContext.Provider>
  );
};

export const usePackages = () => {
  const context = useContext(PackagesContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackagesProvider');
  }
  return context;
};
