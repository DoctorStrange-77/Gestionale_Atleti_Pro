import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  DollarSign,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Info,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  PackageItem,
  PackageDurationUnit,
  PaymentFrequency,
  DiscountType,
} from '../../types';

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PackageItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: PackageItem | null;
  title?: string;
}

const PRESET_SERVICES = [
  'Accesso Illimitato H24',
  'Schede Allenamento Mensili',
  'Check-in Plicometrico BIA',
  'Assistenza Coach WhatsApp',
  'Anamnesi Posturale Iniziale',
  'Supporto Nutrizionale Macro',
  'Test Massimali 1RM',
  'Sconto 10% Integratori',
  'Accesso Area Wellness',
  'Sessioni Individuali PT',
];

const DURATION_UNITS_CONFIG: { value: PackageDurationUnit; label: string; group: string }[] = [
  { value: 'mensile', label: 'Mese / Mesi', group: 'Periodiche' },
  { value: 'bimestrale', label: 'Bimestrale (2 Mesi)', group: 'Periodiche' },
  { value: 'trimestrale', label: 'Trimestrale (3 Mesi)', group: 'Periodiche' },
  { value: 'quadrimestrale', label: 'Quadrimestrale (4 Mesi)', group: 'Periodiche' },
  { value: 'semestrale', label: 'Semestrale (6 Mesi)', group: 'Periodiche' },
  { value: 'annuale', label: 'Annuale (12 Mesi)', group: 'Periodiche' },
  { value: 'personalizzata', label: 'Durata Personalizzata', group: 'Flessibili' },
  { value: 'servizio_singolo', label: 'Servizio Singolo (1 Una Tantum)', group: 'Incontri' },
  { value: 'numero_consulenze', label: 'Numero di Consulenze', group: 'Incontri' },
  { value: 'numero_checkin', label: 'Numero di Check-in', group: 'Incontri' },
];

const PAYMENT_FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'unica_soluzione', label: 'Unica Soluzione (1 Rata)' },
  { value: 'mensile', label: 'Pagamento Ogni Mese' },
  { value: 'bimestrale', label: 'Pagamento Ogni 2 Mesi' },
  { value: 'trimestrale', label: 'Pagamento Ogni 3 Mesi' },
  { value: 'quadrimestrale', label: 'Pagamento Ogni 4 Mesi' },
  { value: 'semestrale', label: 'Pagamento Ogni 6 Mesi' },
  { value: 'personalizzata', label: 'Rateizzazione Personalizzata' },
];

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [durationValue, setDurationValue] = useState<number>(12);
  const [durationUnit, setDurationUnit] = useState<PackageDurationUnit>('mensile');
  const [durationCustomText, setDurationCustomText] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('mensile');
  const [installmentCount, setInstallmentCount] = useState<number>(12);
  const [includedServices, setIncludedServices] = useState<string[]>([]);
  const [newCustomService, setNewCustomService] = useState('');
  const [renewalType, setRenewalType] = useState<'automatico' | 'manuale'>('manuale');
  const [canBeSuspended, setCanBeSuspended] = useState<boolean>(true);
  const [maxSuspensionPeriod, setMaxSuspensionPeriod] = useState('30 giorni');
  const [initialFee, setInitialFee] = useState<number | ''>(0);
  const [discountType, setDiscountType] = useState<DiscountType>('nessuno');
  const [discountValue, setDiscountValue] = useState<number | ''>(0);
  const [status, setStatus] = useState<'attivo' | 'disattivato'>('attivo');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setDurationValue(initialData.durationValue);
      setDurationUnit(initialData.durationUnit);
      setDurationCustomText(initialData.durationCustomText || '');
      setPaymentFrequency(initialData.paymentFrequency);
      setInstallmentCount(initialData.installmentCount);
      setIncludedServices(initialData.includedServices || []);
      setRenewalType(initialData.renewalType);
      setCanBeSuspended(initialData.canBeSuspended);
      setMaxSuspensionPeriod(initialData.maxSuspensionPeriod || '30 giorni');
      setInitialFee(initialData.initialFee || 0);
      setDiscountType(initialData.discountType || 'nessuno');
      setDiscountValue(initialData.discountValue || 0);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      // Defaults for new package
      setName('');
      setDescription('');
      setPrice(600);
      setDurationValue(12);
      setDurationUnit('mensile');
      setDurationCustomText('');
      setPaymentFrequency('mensile');
      setInstallmentCount(12);
      setIncludedServices(['Accesso Illimitato H24', 'Schede Mensili Personalizzate']);
      setRenewalType('manuale');
      setCanBeSuspended(true);
      setMaxSuspensionPeriod('30 giorni');
      setInitialFee(0);
      setDiscountType('nessuno');
      setDiscountValue(0);
      setStatus('attivo');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto adjust installmentCount when payment frequency changes if standard
  const handlePaymentFrequencyChange = (freq: PaymentFrequency) => {
    setPaymentFrequency(freq);
    if (freq === 'unica_soluzione') {
      setInstallmentCount(1);
    } else if (freq === 'mensile' && durationUnit === 'mensile') {
      setInstallmentCount(durationValue || 1);
    } else if (freq === 'trimestrale' && durationValue === 12) {
      setInstallmentCount(4);
    } else if (freq === 'semestrale' && durationValue === 12) {
      setInstallmentCount(2);
    }
  };

  const handleAddPresetService = (service: string) => {
    if (!includedServices.includes(service)) {
      setIncludedServices([...includedServices, service]);
    }
  };

  const handleAddCustomService = () => {
    if (newCustomService.trim() && !includedServices.includes(newCustomService.trim())) {
      setIncludedServices([...includedServices, newCustomService.trim()]);
      setNewCustomService('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setIncludedServices(includedServices.filter((s) => s !== serviceToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      durationValue: Number(durationValue) || 1,
      durationUnit,
      durationCustomText: durationCustomText.trim(),
      paymentFrequency,
      installmentCount: Number(installmentCount) || 1,
      includedServices,
      renewalType,
      canBeSuspended,
      maxSuspensionPeriod: canBeSuspended ? maxSuspensionPeriod.trim() : 'Non applicabile',
      initialFee: Number(initialFee) || 0,
      discountType,
      discountValue: Number(discountValue) || 0,
      status,
      notes: notes.trim(),
    });

    onClose();
  };

  // Calculations
  const numericPrice = Number(price) || 0;
  const numericInst = Math.max(1, Number(installmentCount) || 1);
  const pricePerInstallment = (numericPrice / numericInst).toFixed(2);

  let discountedPrice = numericPrice;
  if (discountType === 'percentuale') {
    discountedPrice = numericPrice - (numericPrice * (Number(discountValue) || 0)) / 100;
  } else if (discountType === 'fisso') {
    discountedPrice = Math.max(0, numericPrice - (Number(discountValue) || 0));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {title || (initialData ? 'Modifica Pacchetto / Servizio' : 'Crea Nuovo Pacchetto / Servizio')}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configura durata, rateizzazione, servizi inclusi e condizioni di vendita.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form id="package-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* SECTION 1: Informazioni Generali */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              1. Anagrafica & Informazioni Principali
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Nome Pacchetto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Abbonamento Annuale Gold Power"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Stato Pacchetto</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'attivo' | 'disattivato')}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                >
                  <option value="attivo">Attivo (Disponibile)</option>
                  <option value="disattivato">Disattivato (Nascosto)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Descrizione Dettagliata</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Spiega i vantaggi e cosa comprende l'offerta..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: Indipendenza Durata vs Pagamenti */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  2. Durata Servizio vs. Frequenza Pagamento (Indipendenti)
                </h4>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Puoi combinare qualsiasi durata con qualsiasi modalità di pagamento (es. Contratto Annuale pagato in 12 rate mensili oppure in unica soluzione).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Durata del Servizio */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  A. Durata del Servizio
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Valore</label>
                    <input
                      type="number"
                      min={1}
                      value={durationValue}
                      onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white text-center"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Unità Durata *</label>
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as PackageDurationUnit)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-amber-400"
                    >
                      {DURATION_UNITS_CONFIG.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {durationUnit === 'personalizzata' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Dettaglio Durata Personalizzata</label>
                    <input
                      type="text"
                      value={durationCustomText}
                      onChange={(e) => setDurationCustomText(e.target.value)}
                      placeholder="Es. 45 Giorni o 8 Settimane"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Frequenza di Pagamento & Rate */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  B. Modalità & Frequenza Pagamento
                </span>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Frequenza Addebito</label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => handlePaymentFrequencyChange(e.target.value as PaymentFrequency)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-emerald-400"
                  >
                    {PAYMENT_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Numero Complessivo di Rate</label>
                  <input
                    type="number"
                    min={1}
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Prezzo, Rateizzazione & Sconti */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              3. Prezzo, Sconti & Frazionamento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Prezzo Totale (€) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-xs">€</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-black text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Quota Iniziale (€)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-xs">€</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={initialFee}
                    onChange={(e) => setInitialFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Es. 30"
                    className="w-full pl-7 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Tipo Sconto</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                >
                  <option value="nessuno">Nessuno Sconto</option>
                  <option value="percentuale">Sconto %</option>
                  <option value="fisso">Sconto Fisso (€)</option>
                </select>
              </div>

              {discountType !== 'nessuno' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Valore Sconto ({discountType === 'percentuale' ? '%' : '€'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-amber-400 focus:ring-2 focus:ring-amber-500/50 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Price Preview Card */}
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold">
                  €{pricePerInstallment} / rata
                </div>
                <div>
                  <p className="font-bold text-white">
                    {numericInst} {numericInst === 1 ? 'Rata Unica' : 'Rate Frazionate'}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Prezzo base: €{numericPrice.toFixed(2)}
                    {discountType !== 'nessuno' && (
                      <span className="text-amber-400 font-bold ml-1">
                        (Prezzo Scontato: €{discountedPrice.toFixed(2)})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {Number(initialFee) > 0 && (
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-bold text-[11px]">
                    + €{initialFee} Quota Attivazione
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Politiche di Rinnovo e Sospensione */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              4. Rinnovo & Politica di Sospensione
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <label className="text-xs font-bold text-zinc-300">Modalità di Rinnovo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRenewalType('manuale')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      renewalType === 'manuale'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Rinnovo Manuale
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenewalType('automatico')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      renewalType === 'automatico'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Rinnovo Automatico
                  </button>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Possibilità di Sospensione</label>
                  <input
                    type="checkbox"
                    checked={canBeSuspended}
                    onChange={(e) => setCanBeSuspended(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {canBeSuspended ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Periodo Massimo Sospensione</label>
                    <input
                      type="text"
                      value={maxSuspensionPeriod}
                      onChange={(e) => setMaxSuspensionPeriod(e.target.value)}
                      placeholder="Es. 30 giorni o 1 mese"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic">Sospensione non consentita per questo contratto.</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: Servizi Inclusi & Note */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              5. Servizi Inclusi & Note Interne
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">Servizi Inclusi nel Pacchetto</label>

              {/* Presets buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_SERVICES.map((preset) => {
                  const isAdded = includedServices.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddPresetService(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        isAdded
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-default'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-white border-zinc-700/60 hover:bg-zinc-700'
                      }`}
                    >
                      + {preset}
                    </button>
                  );
                })}
              </div>

              {/* Added Services Tags */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomService}
                    onChange={(e) => setNewCustomService(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomService();
                      }
                    }}
                    placeholder="Aggiungi servizio personalizzato..."
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-3 py-1.5 bg-amber-500 text-zinc-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi
                  </button>
                </div>

                {includedServices.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic pt-1">Nessun servizio aggiunto ancora.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {includedServices.map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(srv)}
                          className="p-0.5 text-zinc-400 hover:text-rose-400 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Note e Condizioni Particolari</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note ad uso interno del personale o per la segreteria..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all"
          >
            Annulla
          </button>

          <button
            type="submit"
            form="package-form"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialData ? 'Salva Modifiche' : 'Crea Pacchetto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
