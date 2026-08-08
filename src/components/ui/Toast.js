'use client';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast || !toast.message) return null;

  const { message, type = 'success' } = toast;

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
    info: <Info size={18} className="text-sky-500 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-500 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100',
    info: 'border-sky-500/40 bg-sky-50/90 dark:bg-sky-950/90 text-sky-950 dark:text-sky-100',
    warning: 'border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100',
    error: 'border-red-500/40 bg-red-50/90 dark:bg-red-950/90 text-red-950 dark:text-red-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300] max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center justify-between gap-3 ${borderColors[type] || borderColors.info}`}>
        <div className="flex items-center gap-2.5">
          {icons[type]}
          <p className="text-xs font-semibold leading-snug">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
