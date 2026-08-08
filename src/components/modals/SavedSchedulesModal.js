'use client';
import { X, FolderKanban, Trash2, Play, Calendar } from 'lucide-react';
import { useSchedule } from '@/context/ScheduleContext';

export default function SavedSchedulesModal({ isOpen, onClose }) {
  const { savedSchedules, loadSavedSchedule, deleteSavedSchedule } = useSchedule();

  if (!isOpen) return null;

  const handleLoad = (scheduleItem) => {
    loadSavedSchedule(scheduleItem);
    onClose();
  };

  const handleDelete = (id, name) => {
    if (confirm(`¿Eliminar el horario "${name}" de tus guardados?`)) {
      deleteSavedSchedule(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-black font-black flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer z-50"
          title="Cerrar"
        >
          <X size={18} strokeWidth={3} className="text-black" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="text-indigo-600 dark:text-indigo-400" size={24} />
            Mis Horarios Guardados
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Carga o elimina tus distintas alternativas de horarios guardados previamente.
          </p>
        </div>

        {savedSchedules.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
            <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={36} />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Aún no has guardado ningún horario.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Haz clic en "Guardar Horario" en la barra de herramientas para guardar tu combinación actual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedSchedules.map(item => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate flex-1" title={item.name}>
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md shrink-0">
                      {item.courses?.length || 0} Cursos
                    </span>
                  </div>

                  {item.thumbnail ? (
                    <div className="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-700 mb-3">
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Guardado: {item.date || new Date(item.id).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button 
                    onClick={() => handleLoad(item)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Play size={14} /> Cargar Horario
                  </button>

                  <button 
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
