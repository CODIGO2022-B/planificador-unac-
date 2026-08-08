'use client';
import { AlertTriangle, Sparkles, CheckCircle, X } from 'lucide-react';
import { useSchedule } from '@/context/ScheduleContext';

export default function ConflictModal({ isOpen, onClose, conflictInfo, pendingCourseData, onSelectSuggestedSection, onForceReplace }) {
  const { getNonConflictingSections } = useSchedule();

  if (!isOpen || !conflictInfo || !pendingCourseData) return null;

  const { selectedCourse, conflictDetails } = conflictInfo;
  const { curso } = pendingCourseData;

  // Obtenemos las secciones alternativas del mismo curso que NO tienen cruce
  const suggestions = getNonConflictingSections(curso);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 fade-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-black font-black flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer z-50"
          title="Cerrar"
        >
          <X size={18} strokeWidth={3} className="text-black" />
        </button>

        {/* Header de Alerta */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            ¡Cruce de Horario Detectado!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            La sección <strong className="text-red-600 dark:text-red-400">{pendingCourseData.seccion.id}</strong> del curso <strong>{curso.nombre}</strong> genera un cruce.
          </p>
        </div>

        {/* Detalle del Cruce */}
        <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl mb-5 text-xs text-red-900 dark:text-red-200 leading-relaxed">
          <strong>Detalle del cruce:</strong> El día <strong>{conflictDetails.day}</strong> a las <strong>{conflictDetails.time}</strong> se cruza a la misma hora con tu clase inscrita de <strong>{conflictDetails.courseName}</strong>.
        </div>

        {/* 💡 Sugerencias Inteligentes de Secciones Libres (Sin Cruce) */}
        {suggestions.length > 0 ? (
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-2xl mb-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Sugerencia Inteligente de Secciones Libres</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Las siguientes secciones de este curso están <strong>libres y no se cruzan</strong> con tu horario actual:
            </p>

            <div className="space-y-2">
              {suggestions.map(sec => (
                <div 
                  key={sec.id}
                  className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div>
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                      Sección {sec.id}
                    </span>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                      {sec.docente || 'Docente por asignar'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSuggestedSection({ curso, seccion: sec });
                      onClose();
                    }}
                    className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <CheckCircle size={14} /> Seleccionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-2xl mb-6 text-xs text-amber-900 dark:text-amber-200">
            <strong>Sin secciones libres adicionales:</strong> Todas las demás secciones alternativas de este curso también se cruzan con las clases de tu horario.
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            onClick={() => {
              onForceReplace(pendingCourseData);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Reemplazar Curso
          </button>
        </div>

      </div>
    </div>
  );
}
