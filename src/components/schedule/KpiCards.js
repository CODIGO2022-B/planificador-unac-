'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { TimeUtils } from '@/lib/timeUtils';
import { Award, BookOpen, ShieldAlert, Clock, CalendarDays } from 'lucide-react';

export default function KpiCards() {
  const { selectedCourses, getConflict } = useSchedule();

  // Calculate KPIs
  const totalCredits = selectedCourses.reduce((acc, sc) => acc + (sc.curso.creditos || 3), 0);
  const selectedCount = selectedCourses.length;

  // Conflict calculation
  let conflictCount = 0;
  for (let i = 0; i < selectedCourses.length; i++) {
    const sc = selectedCourses[i];
    for (const clase of sc.seccion.clases) {
      // Temporarily check conflict against others
      const range = TimeUtils.parseTimeRange(clase.hora);
      for (let j = i + 1; j < selectedCourses.length; j++) {
        const otherSc = selectedCourses[j];
        for (const otherClase of otherSc.seccion.clases) {
          if (clase.dia === otherClase.dia) {
            const otherRange = TimeUtils.parseTimeRange(otherClase.hora);
            if (range.start < otherRange.end && range.end > otherRange.start) {
              conflictCount++;
            }
          }
        }
      }
    }
  }

  // Calculate total class hours & free time gaps
  let totalMinutes = 0;
  selectedCourses.forEach(sc => {
    sc.seccion.clases.forEach(clase => {
      const range = TimeUtils.parseTimeRange(clase.hora);
      totalMinutes += (range.end - range.start);
    });
  });
  const classHours = Math.round(totalMinutes / 60);

  // Free gap calculation
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
  const freeTimeHours = Math.round(totalGapMinutes / 60);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {/* KPI 1: Créditos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <Award size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">{totalCredits}</span>
            <span className="text-[10px] text-slate-400 font-semibold">/ 22 máx.</span>
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">Créditos totales</p>
        </div>
      </div>

      {/* KPI 2: Cursos Seleccionados */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <BookOpen size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">{selectedCount}</span>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">Cursos matriculados</p>
        </div>
      </div>

      {/* KPI 3: Conflictos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <span className={`text-xl font-semibold ${conflictCount > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
            {conflictCount}
          </span>
          <p className={`text-xs font-medium truncate ${conflictCount > 0 ? 'text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'}`}>
            Cruces de horario
          </p>
        </div>
      </div>

      {/* KPI 4: Horas de Clase */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <Clock size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">{classHours}h</span>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">Horas semanales de clase</p>
        </div>
      </div>

      {/* KPI 5: Tiempo Libre */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm col-span-2 sm:col-span-1">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <CalendarDays size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">{freeTimeHours}h</span>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">Tiempo libre entre cursos</p>
        </div>
      </div>
    </div>
  );
}
