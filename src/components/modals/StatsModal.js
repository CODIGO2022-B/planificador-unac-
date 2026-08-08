'use client';
import { X, BarChart3 } from 'lucide-react';
import { useSchedule } from '@/context/ScheduleContext';
import { TimeUtils } from '@/lib/timeUtils';

export default function StatsModal({ isOpen, onClose }) {
  const { selectedCourses } = useSchedule();

  if (!isOpen) return null;

  const totalCredits = selectedCourses.reduce((acc, sc) => acc + (sc.curso.creditos || 3), 0);
  const totalCourses = selectedCourses.length;

  let totalMinutes = 0;
  let teoriaCount = 0;
  let practicaCount = 0;
  let labCount = 0;

  selectedCourses.forEach(sc => {
    sc.seccion.clases.forEach(clase => {
      const range = TimeUtils.parseTimeRange(clase.hora);
      totalMinutes += (range.end - range.start);

      const tipo = (clase.tipo || '').toUpperCase();
      if (tipo.includes('T')) teoriaCount++;
      else if (tipo.includes('P')) practicaCount++;
      else if (tipo.includes('L')) labCount++;
    });
  });

  const classHours = Math.round(totalMinutes / 60);

  // Gap calculation
  let totalGapMinutes = 0;
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  days.forEach(day => {
    const dayClasses = [];
    selectedCourses.forEach(sc => {
      sc.seccion.clases.forEach(clase => {
        if (clase.dia === day) {
          dayClasses.push(TimeUtils.parseTimeRange(clase.hora));
        }
      });
    });

    if (dayClasses.length > 1) {
      dayClasses.sort((a, b) => a.start - b.start);
      for (let k = 0; k < dayClasses.length - 1; k++) {
        const gap = dayClasses[k + 1].start - dayClasses[k].end;
        if (gap > 0) totalGapMinutes += gap;
      }
    }
  });
  const freeHours = Math.round(totalGapMinutes / 60);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative border border-slate-200 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-black font-black flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer z-50"
          title="Cerrar"
        >
          <X size={18} strokeWidth={3} className="text-black" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-indigo-500" size={22} />
            Estadísticas del Horario
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resumen de métricas de carga académica y distribución de tiempo.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Créditos Inscritos</span>
              <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{totalCredits} Cr.</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Asignaturas</span>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">{totalCourses}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Horas de Clase</span>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{classHours}h</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Horas Libres (Huecos)</span>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1">{freeHours}h</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/60">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Distribución por Tipo de Clase</h4>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Teoría: <b>{teoriaCount}</b>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Práctica: <b>{practicaCount}</b>
              </span>
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Laboratorio: <b>{labCount}</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
