'use client';
import { useState } from 'react';
import { Save, X, BookmarkCheck } from 'lucide-react';

export default function SaveScheduleModal({ isOpen, onClose, onSave }) {
  const [scheduleName, setScheduleName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleName.trim()) return;
    onSave(scheduleName.trim());
    setScheduleName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 fade-in duration-200">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookmarkCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Guardar Horario Favorito
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Asigna un nombre a esta alternativa de clases
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer"
            title="Cerrar"
          >
            <X size={18} strokeWidth={3} className="text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
              Nombre del Horario
            </label>
            <input
              type="text"
              required
              autoFocus
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="Ej. Opción 1 - Mañana Libre"
              className="w-full px-4 py-3 mt-1 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> Guardar Horario
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
