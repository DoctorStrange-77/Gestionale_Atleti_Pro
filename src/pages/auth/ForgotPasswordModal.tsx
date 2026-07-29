import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const success = await resetPassword(email);
    setIsSubmitting(false);

    if (success) {
      setIsSent(true);
    }
  };

  const handleClose = () => {
    setIsSent(false);
    setEmail('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recupero Password Coach"
      subtitle="Builder Athlete Manager • Doctor Strength"
    >
      {isSent ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-zinc-100">Funzione Dimostrativa</h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200">
            Funzione dimostrativa: nessuna email è stata realmente inviata.
          </p>
          <button
            id="btn-close-recovery-success"
            onClick={handleClose}
            className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            Torna al Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Inserisci l'indirizzo email associato al tuo account Coach per ricevere un link di ripristino sicuro.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              Email Registrata
            </label>
            <input
              id="input-recovery-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@doctorstrength.it"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              id="btn-cancel-recovery"
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Annulla
            </button>

            <button
              id="btn-submit-recovery"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Invio in corso...</span>
              ) : (
                <>
                  <span>Invia Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
