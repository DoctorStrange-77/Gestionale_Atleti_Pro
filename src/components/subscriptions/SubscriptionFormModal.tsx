import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  User,
  Package,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Info,
  HelpCircle,
  FileText,
  Percent,
} from 'lucide-react';
import {
  AthleteSubscription,
  PackageItem,
  PackageDurationUnit,
  PaymentFrequency,
  PreferredPaymentMethod,
  SubscriptionInstallment,
  SubscriptionStatus,
  DiscountType,
} from '../../types';
import { useAthletes } from '../../context/AthletesContext';
import { usePackages } from '../../context/PackagesContext';
import {
  calculateEndDate,
  generateInstallmentPlan,
  verifyInstallmentsTotal,
} from '../../lib/subscriptionHelpers';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AthleteSubscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: AthleteSubscription | null;
  preselectedAthleteId?: string;
  preselectedPackageId?: string;
  title?: string;
}

const PREFERRED_PAYMENT_METHODS: { value: PreferredPaymentMethod; label: string }[] = [
  { value: 'bonifico', label: 'Bonifico Bancario' },
  { value: 'carta', label: 'Carta di Credito / Debito' },
  { value: 'rid_sepa', label: 'Addebito Diretto SEPA (SDD / RID)' },
  { value: 'contanti', label: 'Contanti in Sede' },
  { value: 'pos', label: 'POS in Struttura' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'altro', label: 'Altro Metodo' },
];

const DURATION_UNITS_CONFIG: { value: PackageDurationUnit; label: string }[] = [
  { value: 'mensile', label: 'Mesi' },
  { value: 'bimestrale', label: 'Bimestrale (2 Mesi)' },
  { value: 'trimestrale', label: 'Trimestrale (3 Mesi)' },
  { value: 'quadrimestrale', label: 'Quadrimestrale (4 Mesi)' },
  { value: 'semestrale', label: 'Semestrale (6 Mesi)' },
  { value: 'annuale', label: 'Annuale (12 Mesi)' },
  { value: 'personalizzata', label: 'Durata Personalizzata' },
  { value: 'servizio_singolo', label: 'Servizio Singolo' },
  { value: 'numero_consulenze', label: 'Numero Consulenze' },
  { value: 'numero_checkin', label: 'Numero Check-in' },
];

const PAYMENT_FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'unica_soluzione', label: 'Unica Soluzione (1 Rata)' },
  { value: 'mensile', label: 'Mensile' },
  { value: 'bimestrale', label: 'Ogni 2 Mesi' },
  { value: 'trimestrale', label: 'Ogni 3 Mesi' },
  { value: 'quadrimestrale', label: 'Ogni 4 Mesi' },
  { value: 'semestrale', label: 'Ogni 6 Mesi' },
  { value: 'personalizzata', label: 'Personalizzata' },
];

export const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  preselectedAthleteId,
  preselectedPackageId,
  title,
}) => {
  const { athletes } = useAthletes();
  const { packages } = usePackages();

  // Wizard Step: 1 = Configurazione Parametri, 2 = Anteprima & Verifica Rate
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [packageName, setPackageName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [durationValue, setDurationValue] = useState<number>(12);
  const [durationUnit, setDurationUnit] = useState<PackageDurationUnit>('mensile');
  const [durationCustomText, setDurationCustomText] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isCustomEndDate, setIsCustomEndDate] = useState<boolean>(false);

  // Pricing & Payments
  const [listPrice, setListPrice] = useState<number | ''>(0);
  const [discountFixed, setDiscountFixed] = useState<number | ''>(0);
  const [discountPercent, setDiscountPercent] = useState<number | ''>(0);
  const [agreedPrice, setAgreedPrice] = useState<number | ''>(0);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('mensile');
  const [installmentCount, setInstallmentCount] = useState<number>(12);
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [firstInstallmentDate, setFirstInstallmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PreferredPaymentMethod>('bonifico');
  const [renewalType, setRenewalType] = useState<'automatico' | 'manuale'>('manuale');
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(10);
  const [status, setStatus] = useState<SubscriptionStatus>('attivo');
  const [notes, setNotes] = useState<string>('');

  // Generated Installments (editable in preview step)
  const [generatedInstallments, setGeneratedInstallments] = useState<SubscriptionInstallment[]>([]);

  // Load initial data or defaults
  useEffect(() => {
    if (initialData) {
      setSelectedAthleteId(initialData.athleteId || '');
      setSelectedPackageId(initialData.packageId || '');
      setPackageName(initialData.packageName || '');
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setDurationValue(initialData.durationValue || 12);
      setDurationUnit(initialData.durationUnit || 'mensile');
      setDurationCustomText(initialData.durationCustomText || '');
      setEndDate(initialData.endDate || '');
      setIsCustomEndDate(initialData.isCustomEndDate || false);
      setListPrice(initialData.listPrice || 0);
      setDiscountFixed(initialData.discountFixed || 0);
      setDiscountPercent(initialData.discountPercent || 0);
      setAgreedPrice(initialData.agreedPrice || 0);
      setPaymentFrequency(initialData.paymentFrequency || 'mensile');
      setInstallmentCount(initialData.installmentCount || 12);
      setDownPayment(initialData.downPayment || 0);
      setFirstInstallmentDate(initialData.firstInstallmentDate || initialData.startDate);
      setPreferredPaymentMethod(initialData.preferredPaymentMethod || 'bonifico');
      setRenewalType(initialData.renewalType || 'manuale');
      setGracePeriodDays(initialData.gracePeriodDays ?? 10);
      setStatus(initialData.status || 'attivo');
      setNotes(initialData.notes || '');
      setGeneratedInstallments(initialData.installments || []);
      setStep(1);
    } else {
      // Defaults
      const today = new Date().toISOString().split('T')[0];
      const athId = preselectedAthleteId || (athletes[0]?.id || '');
      const pkgId = preselectedPackageId || (packages[0]?.id || '');

      setSelectedAthleteId(athId);
      setSelectedPackageId(pkgId);

      const targetPkg = packages.find((p) => p.id === pkgId);
      if (targetPkg) {
        setPackageName(targetPkg.name);
        setListPrice(targetPkg.price);
        setDurationValue(targetPkg.durationValue);
        setDurationUnit(targetPkg.durationUnit);
        setDurationCustomText(targetPkg.durationCustomText || '');
        setPaymentFrequency(targetPkg.paymentFrequency);
        setInstallmentCount(targetPkg.installmentCount);
        setDownPayment(targetPkg.initialFee || 0);
        setRenewalType(targetPkg.renewalType);
        setAgreedPrice(targetPkg.price);
      } else {
        setPackageName('Abbonamento Personalizzato');
        setListPrice(600);
        setDurationValue(12);
        setDurationUnit('mensile');
        setPaymentFrequency('mensile');
        setInstallmentCount(12);
        setDownPayment(0);
        setAgreedPrice(600);
      }

      setStartDate(today);
      setFirstInstallmentDate(today);
      setDiscountFixed(0);
      setDiscountPercent(0);
      setIsCustomEndDate(false);
      setPreferredPaymentMethod('bonifico');
      setGracePeriodDays(10);
      setStatus('attivo');
      setNotes('');
      setStep(1);
    }
  }, [initialData, isOpen, preselectedAthleteId, preselectedPackageId]);

  // Auto-calculate End Date whenever startDate, durationValue, durationUnit changes (if not manually overridden)
  useEffect(() => {
    if (!isCustomEndDate) {
      const calcEnd = calculateEndDate(startDate, durationValue, durationUnit);
      setEndDate(calcEnd);
    }
  }, [startDate, durationValue, durationUnit, isCustomEndDate]);

  // When package selection changes in dropdown
  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const targetPkg = packages.find((p) => p.id === pkgId);
    if (targetPkg) {
      setPackageName(targetPkg.name);
      setListPrice(targetPkg.price);
      setDurationValue(targetPkg.durationValue);
      setDurationUnit(targetPkg.durationUnit);
      setDurationCustomText(targetPkg.durationCustomText || '');
      setPaymentFrequency(targetPkg.paymentFrequency);
      setInstallmentCount(targetPkg.installmentCount);
      setDownPayment(targetPkg.initialFee || 0);
      setRenewalType(targetPkg.renewalType);

      // Discount calculation
      let calcAgreed = targetPkg.price;
      if (targetPkg.discountType === 'percentuale' && targetPkg.discountValue > 0) {
        setDiscountPercent(targetPkg.discountValue);
        setDiscountFixed(0);
        calcAgreed = targetPkg.price - (targetPkg.price * targetPkg.discountValue) / 100;
      } else if (targetPkg.discountType === 'fisso' && targetPkg.discountValue > 0) {
        setDiscountFixed(targetPkg.discountValue);
        setDiscountPercent(0);
        calcAgreed = Math.max(0, targetPkg.price - targetPkg.discountValue);
      } else {
        setDiscountFixed(0);
        setDiscountPercent(0);
      }
      setAgreedPrice(Math.round(calcAgreed * 100) / 100);
    }
  };

  // Recompute Agreed Price when List Price or Discounts change
  const handleDiscountChange = (fixed: number | '', percent: number | '') => {
    const listP = Number(listPrice) || 0;
    const fixVal = Number(fixed) || 0;
    const pctVal = Number(percent) || 0;

    let finalPrice = listP;
    if (pctVal > 0) {
      finalPrice = finalPrice - (listP * pctVal) / 100;
    }
    if (fixVal > 0) {
      finalPrice = Math.max(0, finalPrice - fixVal);
    }

    setAgreedPrice(Math.round(finalPrice * 100) / 100);
  };

  // Generate Installment Plan when entering Step 2 (Preview)
  const handleGoToPreview = () => {
    const plan = generateInstallmentPlan({
      agreedPrice: Number(agreedPrice) || 0,
      downPayment: Number(downPayment) || 0,
      installmentCount: Number(installmentCount) || 1,
      startDate,
      firstInstallmentDate: firstInstallmentDate || startDate,
      paymentFrequency,
    });

    setGeneratedInstallments(plan);
    setStep(2);
  };

  // Allow manual edit of individual installment amounts in Preview
  const handleInstallmentAmountChange = (index: number, newAmount: number) => {
    setGeneratedInstallments((prev) =>
      prev.map((inst, idx) => (idx === index ? { ...inst, amount: newAmount } : inst))
    );
  };

  // Verification of installment total vs agreed price
  const totalVerification = useMemo(() => {
    return verifyInstallmentsTotal(generatedInstallments, Number(agreedPrice) || 0);
  }, [generatedInstallments, agreedPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteId) return;

    const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);
    const athleteName = selectedAthlete
      ? `${selectedAthlete.firstName} ${selectedAthlete.lastName}`
      : 'Atleta';

    onSave({
      athleteId: selectedAthleteId,
      athleteName,
      packageId: selectedPackageId,
      packageName: packageName || 'Abbonamento Personalizzato',
      startDate,
      durationValue: Number(durationValue) || 1,
      durationUnit,
      durationCustomText,
      endDate,
      isCustomEndDate,
      listPrice: Number(listPrice) || 0,
      discountFixed: Number(discountFixed) || 0,
      discountPercent: Number(discountPercent) || 0,
      agreedPrice: Number(agreedPrice) || 0,
      paymentFrequency,
      installmentCount: Number(installmentCount) || 1,
      downPayment: Number(downPayment) || 0,
      firstInstallmentDate: firstInstallmentDate || startDate,
      preferredPaymentMethod,
      renewalType,
      gracePeriodDays: Number(gracePeriodDays) || 5,
      status,
      notes,
      installments: generatedInstallments,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {title || (initialData ? 'Modifica Contratto Abbonamento' : 'Nuovo Abbonamento Atleta')}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Passo {step} di 2: {step === 1 ? 'Parametri & Condizioni Economiche' : 'Anteprima Piano Rate & Verifica'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 mr-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  step === 1 ? 'bg-amber-400 ring-4 ring-amber-400/20' : 'bg-emerald-500'
                }`}
              />
              <span
                className={`w-3 h-3 rounded-full ${
                  step === 2 ? 'bg-amber-400 ring-4 ring-amber-400/20' : 'bg-zinc-700'
                }`}
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {step === 1 ? (
          /* STEP 1: CONFIGURAZIONE PARAMETRI */
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {/* 1. Selezione Atleta & Pacchetto */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                1. Atleta & Pacchetto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Atleta Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Seleziona Atleta *</label>
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                  >
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} ({a.discipline || 'Generale'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pacchetto Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Seleziona Pacchetto Listino *</label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => handlePackageSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-amber-400 focus:ring-2 focus:ring-amber-500/50 outline-none"
                  >
                    <option value="">-- Pacchetto Personalizzato --</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (€{p.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Nome Personalizzato Contratto / Descrizione</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Es. Abbonamento Annuale Gold Power (Personalizzato)"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                />
              </div>
            </div>

            {/* 2. Date, Durata & Calcolo Automatico Scadenza */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                2. Data Inizio, Durata & Scadenza
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Data di Inizio *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (!firstInstallmentDate) setFirstInstallmentDate(e.target.value);
                    }}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Valore Durata</label>
                  <input
                    type="number"
                    min={1}
                    value={durationValue}
                    onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-white text-center focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Unità Durata</label>
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value as PackageDurationUnit)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-amber-400 focus:ring-2 focus:ring-blue-500/50 outline-none"
                  >
                    {DURATION_UNITS_CONFIG.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calcolo Automatico / Personalizzato Data Fine */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">Data di Fine *</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomEndDate(!isCustomEndDate)}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      {isCustomEndDate ? 'Ricalcola Auto' : 'Modifica Manuale'}
                    </button>
                  </div>

                  <input
                    type="date"
                    required
                    readOnly={!isCustomEndDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-xs font-black ${
                      isCustomEndDate
                        ? 'bg-zinc-900 border-amber-500 text-amber-300'
                        : 'bg-zinc-900/60 border-zinc-800 text-emerald-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {!isCustomEndDate && (
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Data di fine calcolata automaticamente in base alla data di inizio e alla durata impostata.
                </p>
              )}
            </div>

            {/* 3. Condizioni Economiche, Sconti & Prezzo Concordato */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                3. Condizioni Economiche & Sconti
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Prezzo di Listino (€) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={listPrice}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setListPrice(val);
                      handleDiscountChange(discountFixed, discountPercent);
                    }}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Sconto Fisso (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discountFixed}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setDiscountFixed(val);
                      handleDiscountChange(val, discountPercent);
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Sconto Percentuale (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={discountPercent}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setDiscountPercent(val);
                      handleDiscountChange(discountFixed, val);
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>

                {/* Prezzo Concordato Finale */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400">Prezzo Concordato (€) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-emerald-500/40 rounded-xl text-xs font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Modalità di Pagamento & Rateizzazione */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                4. Piano di Rateizzazione & Pagamenti
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Frequenza Pagamento</label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => {
                      const freq = e.target.value as PaymentFrequency;
                      setPaymentFrequency(freq);
                      if (freq === 'unica_soluzione') setInstallmentCount(1);
                    }}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-purple-300 focus:ring-2 focus:ring-purple-500/50 outline-none"
                  >
                    {PAYMENT_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Numero Rate Complessivo</label>
                  <input
                    type="number"
                    min={1}
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Acconto / Quota Iniziale (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Data Prima Rata *</label>
                  <input
                    type="date"
                    required
                    value={firstInstallmentDate}
                    onChange={(e) => setFirstInstallmentDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Metodo Pagamento Preferito</label>
                  <select
                    value={preferredPaymentMethod}
                    onChange={(e) => setPreferredPaymentMethod(e.target.value as PreferredPaymentMethod)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 outline-none"
                  >
                    {PREFERRED_PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Rinnovo</label>
                  <select
                    value={renewalType}
                    onChange={(e) => setRenewalType(e.target.value as 'automatico' | 'manuale')}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 outline-none"
                  >
                    <option value="manuale">Rinnovo Manuale</option>
                    <option value="automatico">Rinnovo Automatico</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Giorni Tolleranza Scadenza</label>
                  <input
                    type="number"
                    min={0}
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Note e Accordi Particolari</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condizioni particolari, accordi di rateizzazione o note amministrative..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
              />
            </div>
          </div>
        ) : (
          /* STEP 2: ANTEPRIMA PIANO RATE & VERIFICA TOTALE */
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-800 animate-fadeIn">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Anteprima Piano Rate generato
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Verifica le date e le singole scadenze prima di confermare. Puoi rettificare gli importi delle singole rate.
                  </p>
                </div>
              </div>

              {/* Total Check Badge */}
              <div
                className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-black text-xs shrink-0 ${
                  totalVerification.valid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {totalVerification.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Totale Rate Coincide (€{totalVerification.total.toFixed(2)})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    <span>
                      Differenza: €{totalVerification.diff.toFixed(2)} (Tot Rate: €
                      {totalVerification.total.toFixed(2)} / Concordato: €
                      {Number(agreedPrice).toFixed(2)})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Sub Summary Card */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block font-medium">Atleta:</span>
                <strong className="text-white font-bold">
                  {athletes.find((a) => a.id === selectedAthleteId)?.firstName}{' '}
                  {athletes.find((a) => a.id === selectedAthleteId)?.lastName}
                </strong>
              </div>

              <div>
                <span className="text-zinc-500 block font-medium">Pacchetto:</span>
                <strong className="text-amber-400 font-bold truncate block">{packageName}</strong>
              </div>

              <div>
                <span className="text-zinc-500 block font-medium">Periodo Validità:</span>
                <strong className="text-zinc-200 font-bold">
                  {startDate} &rarr; {endDate}
                </strong>
              </div>

              <div>
                <span className="text-zinc-500 block font-medium">Prezzo Concordato:</span>
                <strong className="text-emerald-400 font-black text-sm">
                  €{Number(agreedPrice).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Installments Schedule Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">
                  Programma Scadenze Rate ({generatedInstallments.length} Scadenze)
                </h4>
                <button
                  type="button"
                  onClick={handleGoToPreview}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Rigenera Standard
                </button>
              </div>

              <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Descrizione Rata</th>
                      <th className="p-3">Data Scadenza</th>
                      <th className="p-3 text-right">Importo (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-200">
                    {generatedInstallments.map((inst, idx) => (
                      <tr key={inst.id} className="hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-zinc-500">{inst.number}</td>
                        <td className="p-3 font-bold text-white">{inst.label}</td>
                        <td className="p-3 font-semibold text-amber-400">{inst.dueDate}</td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={inst.amount}
                            onChange={(e) =>
                              handleInstallmentAmountChange(
                                idx,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-28 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-right font-black text-emerald-400 outline-none focus:border-amber-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all"
              >
                Annulla
              </button>

              <button
                type="button"
                onClick={handleGoToPreview}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <span>Vai all'Anteprima & Verifica</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Torna ai Parametri</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!totalVerification.valid}
                className={`px-6 py-2.5 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 ${
                  totalVerification.valid
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Conferma e Attiva Abbonamento</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
