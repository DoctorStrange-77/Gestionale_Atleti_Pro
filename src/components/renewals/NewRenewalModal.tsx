import React, { useState } from 'react';
import { X, Plus, RefreshCw, User, Package, Calendar, Euro, FileText } from 'lucide-react';
import { RenewalStatus, AthletePaymentStatus } from '../../types';
import { useRenewals } from '../../context/RenewalsContext';
import { useAthletes } from '../../context/AthletesContext';
import { usePackages } from '../../context/PackagesContext';

interface NewRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRenewalModal: React.FC<NewRenewalModalProps> = ({ isOpen, onClose }) => {
  const { addRenewal } = useRenewals();
  const { athletes } = useAthletes();
  const { packages } = usePackages();

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [packageName, setPackageName] = useState<string>('');
  const [price, setPrice] = useState<number>(350);
  const [coachName, setCoachName] = useState<string>('Salvatore Carotenuto');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<RenewalStatus>('da contattare');
  const [responsibleName, setResponsibleName] = useState<string>('Salvatore Carotenuto');
  const [nextAction, setNextAction] = useState<string>('Chiamata di contatto per proposta rinnovo');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleAthleteChange = (athId: string) => {
    setSelectedAthleteId(athId);
    const ath = athletes.find((a) => a.id === athId);
    if (ath) {
      setPackageName(ath.activePackage || 'Abbonamento Standard');
      setCoachName(ath.assignedCoachName || 'Coach');
      setResponsibleName(ath.assignedCoachName || 'Coach');
      setEndDate(ath.expirationDate || new Date().toISOString().split('T')[0]);
    }
  };

  const handlePackageChange = (pkgTitle: string) => {
    setPackageName(pkgTitle);
    const pkg = packages.find((p) => p.title === pkgTitle);
    if (pkg) {
      setPrice(pkg.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteId) return;

    const athleteObj = athletes.find((a) => a.id === selectedAthleteId);
    const athleteName = athleteObj ? `${athleteObj.firstName} ${athleteObj.lastName}` : 'Atleta';

    const todayStr = new Date().toISOString().split('T')[0];
    const daysRemaining = endDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24))
      : 0;

    addRenewal({
      athleteId: selectedAthleteId,
      athleteName,
      currentPackageName: packageName || 'Abbonamento Standard',
      price: price || 0,
      coachName,
      endDate: endDate || todayStr,
      daysRemaining,
      paymentStatus: athleteObj?.paymentStatus || ('regolare' as AthletePaymentStatus),
      lastCommunicationDate: todayStr,
      lastCommunicationNote: 'Creata nuova proposta di rinnovo',
      nextAction: nextAction || 'Contattare atleta per rinnovo',
      nextActionDate: todayStr,
      responsibleName: responsibleName || 'Operatore',
      status,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Nuova Scheda Rinnovo</h3>
              <p className="text-xs text-zinc-400">Inserisci una nuova proposta o sollecito di rinnovo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-zinc-300 mb-1 block">Atleta *</label>
            <select
              required
              value={selectedAthleteId}
              onChange={(e) => handleAthleteChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Seleziona Atleta --</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName} ({a.activePackage || 'Nessun pacchetto attivo'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Pacchetto Proposto</label>
              <select
                value={packageName}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Seleziona o personalizza --</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title} (€{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Prezzo (€)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Scadenza Attuale/Prevista</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Stato Iniziale Rinnovo</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RenewalStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="da contattare">da contattare</option>
                <option value="contattato">contattato</option>
                <option value="interessato">interessato</option>
                <option value="in valutazione">in valutazione</option>
                <option value="confermato">confermato</option>
                <option value="rinnovato">rinnovato</option>
                <option value="non rinnovato">non rinnovato</option>
                <option value="irraggiungibile">irraggiungibile</option>
                <option value="rinviato">rinviato</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Coach Assegnato</label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Responsabile Rinnovo</label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 mb-1 block">Prossima Azione</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              placeholder="es. Inviare preventivo via WhatsApp"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 mb-1 block">Note</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Annotazioni sulla trattativa o preferenze dell'atleta..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crea Scheda Rinnovo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
