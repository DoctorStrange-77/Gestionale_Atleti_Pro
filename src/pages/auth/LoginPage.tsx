import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { DemoBanner } from '../../components/common/DemoBanner';
import {
  Dumbbell,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isSupabaseConnected, isLoading, ownerProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Inserisci il tuo indirizzo email');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (!success) {
      setErrorMessage('Credenziali non valide o errore durante l\'accesso.');
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    await login(ownerProfile.email || 'owner.demo@example.com', 'demo123');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gold Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-2xl shadow-amber-500/25 mx-auto border border-amber-300/40">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-amber-400 uppercase">
              BUILDER ATHLETE
            </h1>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-1">
              Manager • Doctor Strength Brand
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Demo Banner for Login */}
          <DemoBanner variant="login" />

          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-100">Accesso Riservato Coach</h2>
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200/90 leading-relaxed">
              Il modulo email e password è presente per dimostrare come potrebbe funzionare un’autenticazione reale. Nella versione attuale l’accesso è simulato.
            </div>
          </div>

          {/* Red error alert (Red strictly used for errors as specified) */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-600/60 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Errore di Accesso</p>
                <p className="mt-0.5 text-red-300">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                Email
              </label>
              <input
                id="input-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ownerProfile.email || 'owner.demo@example.com'}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all placeholder:text-zinc-600"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Password
                </label>
                <button
                  id="btn-forgot-password-link"
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                >
                  Password dimenticata?
                </button>
              </div>
              <div className="relative">
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all placeholder:text-zinc-600"
                />
                <button
                  id="btn-toggle-login-password-visibility"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Mostra/Nascondi Password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
                <input
                  id="chk-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-amber-500/50"
                />
                <span>Ricordami su questo dispositivo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Autenticazione in corso...</span>
              ) : (
                <>
                  <span>Accedi all'Area Coach</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center space-y-3">
            <p className="text-[11px] text-zinc-400">
              {isSupabaseConnected
                ? 'Connessione Supabase (Predisposizione futura — non attiva nella demo)'
                : 'Modalità Demo Locale (Dati salvati nel browser)'}
            </p>
            <button
              id="btn-login-demo"
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-amber-400 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Accedi Subito in Modalità Demo</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-zinc-400 text-[11px] space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Versione dimostrativa locale — autenticazione reale non configurata</span>
          </p>
          <p>© {new Date().getFullYear()} Builder Athlete Manager • Doctor Strength Method</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};
