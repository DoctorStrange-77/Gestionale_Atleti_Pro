import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Info className="w-5 h-5 text-amber-400 shrink-0" />;
          let borderStyle = 'border-amber-500/40 bg-zinc-900/95 text-zinc-100';
          let titleColor = 'text-amber-400';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />;
            borderStyle = 'border-amber-500/50 bg-zinc-900/95 text-zinc-100 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
            titleColor = 'text-amber-400 font-semibold';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
            borderStyle = 'border-red-600/60 bg-zinc-950/95 text-zinc-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            titleColor = 'text-red-400 font-semibold';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />;
            borderStyle = 'border-yellow-600/50 bg-zinc-900/95 text-zinc-100';
            titleColor = 'text-yellow-400 font-semibold';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              id={`toast-item-${toast.id}`}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${borderStyle}`}
            >
              {icon}
              <div className="flex-1 min-w-0 pr-2">
                <p className={`text-sm ${titleColor}`}>{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                id={`btn-close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Chiudi notifica"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
