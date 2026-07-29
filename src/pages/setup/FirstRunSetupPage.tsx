import React, { useState } from 'react';
import { Building2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { LocalOwnerProfile } from '../../types';
import { migrateLegacyOwnerData, saveOwnerProfile } from '../../lib/ownerProfile';
import { useToast } from '../../context/ToastContext';
import { STORAGE_KEYS } from '../../config/storageKeys';

interface FirstRunSetupPageProps {
  onCompleted: (profile: LocalOwnerProfile) => void;
}

export const FirstRunSetupPage: React.FC<FirstRunSetupPageProps> = ({ onCompleted }) => {
  const { showSuccess } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim();
    const normalizedOrganization = organizationName.trim();
    const nextErrors: Record<string, string> = {};

    if (normalizedFirstName.length < 2) {
      nextErrors.firstName = 'Il nome deve contenere almeno 2 caratteri.';
    }
    if (normalizedLastName.length < 2) {
      nextErrors.lastName = 'Il cognome deve contenere almeno 2 caratteri.';
    }
    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      nextErrors.email = 'Inserisci un indirizzo email valido.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    const profile: LocalOwnerProfile = {
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      fullName: `${normalizedFirstName} ${normalizedLastName}`,
      email: normalizedEmail || undefined,
      organizationName: normalizedOrganization || undefined,
      role: 'proprietario',
      createdAt: now,
      updatedAt: now,
    };

    saveOwnerProfile(profile);
    if (profile.organizationName) {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      let settings: Record<string, unknown> = {};
      if (storedSettings) {
        try {
          const parsed: unknown = JSON.parse(storedSettings);
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            settings = parsed as Record<string, unknown>;
          }
        } catch {
          settings = {};
        }
      }
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({ ...settings, businessName: profile.organizationName })
      );
    }
    migrateLegacyOwnerData(profile.fullName);
    showSuccess(
      'Configurazione completata',
      `Configurazione completata. Benvenuto, ${profile.fullName}.`
    );
    onCompleted(profile);
  };

  const fieldClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/20">
            <UserRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-amber-400">
            CONFIGURAZIONE INIZIALE
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Inserisci i dati del proprietario che utilizzerà questa applicazione dimostrativa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs font-semibold text-zinc-300">
              <span>Nome *</span>
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className={fieldClass} autoComplete="given-name" />
              {errors.firstName && <span className="block text-red-400">{errors.firstName}</span>}
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-zinc-300">
              <span>Cognome *</span>
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className={fieldClass} autoComplete="family-name" />
              {errors.lastName && <span className="block text-red-400">{errors.lastName}</span>}
            </label>
          </div>

          <label className="space-y-1.5 text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} autoComplete="email" />
            {errors.email && <span className="block text-red-400">{errors.email}</span>}
          </label>

          <label className="space-y-1.5 text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-amber-400" /> Nome dell’attività o organizzazione</span>
            <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} className={fieldClass} />
          </label>

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Ruolo</p>
              <p className="text-sm font-bold text-amber-400">Proprietario</p>
            </div>
          </div>

          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-sm font-black text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all">
            CONFIGURA E AVVIA LA DEMO
          </button>
        </form>
      </div>
    </div>
  );
};
