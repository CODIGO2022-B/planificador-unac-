'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { TimeUtils } from '@/lib/timeUtils';
import { X } from 'lucide-react';
import { useMemo } from 'react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const PIXELS_PER_MINUTE = 0.9; // 54px per hour

export default function ScheduleGrid() {
  const { selectedCourses, removeCourse, getColor, previewCourse } = useSchedule();

  // Smart Day Trimming: Sábado solo aparece si hay clases en sábado
  const days = useMemo(() => {
    const checkIn = (scList) => (scList || []).some(sc =>
      sc.seccion?.clases?.some(c => (c.dia || '').toLowerCase().includes('sáb') || (c.dia || '').toLowerCase().includes('sab'))
    );
    const hasSat = checkIn(selectedCourses) || (previewCourse && checkIn([previewCourse]));
    return hasSat ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  }, [selectedCourses, previewCourse]);

  // Dynamic hour bounds (8:00 to 22:00 by default, or auto-fit earliest/latest)
  const bounds = useMemo(() => {
    if (!selectedCourses || selectedCourses.length === 0) return { start: 8, end: 22 };
    let earliest = 24;
    let latest = 0;
    selectedCourses.forEach(({ seccion }) => {
      seccion?.clases?.forEach(clase => {
        const range = TimeUtils.parseTimeRange(clase.hora);
        const startHour = Math.floor(range.start / 60);
        const endHour = Math.round(range.end / 60);
        if (startHour < earliest) earliest = startHour;
        if (endHour > latest) latest = endHour;
      });
    });
    if (earliest === 24) earliest = 8;
    if (latest === 0) latest = 22;
    const start = Math.max(0, earliest);
    const end = Math.min(24, latest);
    return { start, end: end <= start ? start + 1 : end };
  }, [selectedCourses]);

  const startHour = bounds.start;
  const endHour = bounds.end;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Group and merge adjacent blocks of the same course on the same day
  const mergedBlocks = useMemo(() => {
    const dayMap = {};
    days.forEach((_, i) => (dayMap[i] = []));

    selectedCourses.forEach(selected => {
      const { curso, seccion } = selected;
      seccion.clases?.forEach(clase => {
        const range = TimeUtils.parseTimeRange(clase.hora);
        const dayIndex = days.indexOf(clase.dia);
        if (dayIndex === -1) return;
        dayMap[dayIndex].push({ curso, seccion, clase, range });
      });
    });

    const result = [];
    Object.entries(dayMap).forEach(([dayIndexStr, items]) => {
      const dayIndex = parseInt(dayIndexStr, 10);
      if (items.length === 0) return;

      items.sort((a, b) => a.range.start - b.range.start);

      const merged = [];
      items.forEach(item => {
        const last = merged[merged.length - 1];
        if (
          last &&
          last.curso.codigo === item.curso.codigo &&
          last.mergedEnd === item.range.start &&
          last.clase.tipo === item.clase.tipo
        ) {
          last.mergedEnd = item.range.end;
          last.aulas.push(item.clase.aula);
        } else {
          merged.push({
            dayIndex,
            curso: item.curso,
            seccion: item.seccion,
            clase: item.clase,
            mergedStart: item.range.start,
            mergedEnd: item.range.end,
            aulas: [item.clase.aula],
          });
        }
      });

      result.push(...merged);
    });

    return result;
  }, [selectedCourses]);

  // Helper for T/P/L badge
  const getClassTypeBadge = (clase) => {
    if (!clase) return null;
    let tipo = clase.tipo || '';
    if (!tipo) {
      const aula = (clase.aula || '').toUpperCase();
      if (aula.includes('LAB') || aula.includes('COMP')) tipo = 'L';
      else if (aula.includes('P') || aula.includes('PRACT')) tipo = 'P';
      else tipo = 'T';
    }
    const t = tipo.toUpperCase();
    if (t === 'T') return <span className="badge-tpl badge-teoria">T</span>;
    if (t === 'P') return <span className="badge-tpl badge-practica">P</span>;
    if (t === 'L') return <span className="badge-tpl badge-lab">L</span>;
    return <span className="badge-tpl badge-teoria">{tipo}</span>;
  };

  // Format time range display (e.g. 08:00 a 09:40)
  const formatTimeRange = (startMins, endMins) => {
    const format = mins =>
      `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    return `${format(startMins)} a ${format(endMins)}`;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Header Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-20">
        <div className="w-16 flex-shrink-0 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
          Hora
        </div>
        {days.map(day => (
          <div
            key={day}
            className="flex-1 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800/50 last:border-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex relative overflow-x-auto w-full">
        {/* Time Labels Column */}
        <div className="w-16 flex-shrink-0 bg-slate-50/60 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800 relative z-10 select-none">
          {hours.map(hour => (
            <div
              key={hour}
              className="border-b border-slate-200/80 dark:border-slate-800/60 flex items-start justify-center pt-1 font-mono text-xs font-black text-slate-900 dark:text-slate-100"
              style={{ height: `${60 * PIXELS_PER_MINUTE}px` }}
            >
              <span>
                {String(hour).padStart(2, '0')}
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">:00</span>
              </span>
            </div>
          ))}
        </div>

        {/* Days Columns & Absolute Events Layer */}
        <div className="flex-1 flex relative w-full" style={{ height: `${hours.length * 60 * PIXELS_PER_MINUTE}px` }}>
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            {hours.map(hour => (
              <div
                key={hour}
                className="border-b border-slate-100 dark:border-slate-800/60 w-full"
                style={{ height: `${60 * PIXELS_PER_MINUTE}px` }}
              ></div>
            ))}
          </div>

          <div className="absolute inset-0 flex pointer-events-none">
            {days.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 border-r border-slate-100 dark:border-slate-800/60 h-full last:border-0"
              ></div>
            ))}
          </div>

          {/* Ghost Preview Overlay */}
          {previewCourse &&
            previewCourse.section?.clases?.map((clase, idx) => {
              const dayIndex = days.indexOf(clase.dia);
              if (dayIndex === -1) return null;
              const range = TimeUtils.parseTimeRange(clase.hora);
              const top = (range.start - startHour * 60) * PIXELS_PER_MINUTE;
              const height = (range.end - range.start) * PIXELS_PER_MINUTE;

              return (
                <div
                  key={`ghost-${idx}`}
                  className="ghost-class-block"
                  style={{
                    left: `calc(${(dayIndex / days.length) * 100}% + 2px)`,
                    width: `calc(${(1 / days.length) * 100}% - 4px)`,
                    top: `${top}px`,
                    height: `${height}px`,
                  }}
                >
                  <span className="truncate max-w-full font-bold text-[10px]">
                    {previewCourse.course.nombre}
                  </span>
                  <span className="text-[9px] opacity-90 font-mono">{clase.hora}</span>
                </div>
              );
            })}

          {/* Render Merged Course Event Blocks */}
          {mergedBlocks.map((block, idx) => {
            const { dayIndex, curso, seccion, clase, mergedStart, mergedEnd, aulas } = block;
            const color = getColor(curso.codigo);
            const top = (mergedStart - startHour * 60) * PIXELS_PER_MINUTE;
            const height = (mergedEnd - mergedStart) * PIXELS_PER_MINUTE;
            const durationMin = mergedEnd - mergedStart;
            const aulaText = Array.from(new Set(aulas)).join(', ');
            const horaDisplay = formatTimeRange(mergedStart, mergedEnd);
            const badge = getClassTypeBadge(clase);

            return (
              <div
                key={`${curso.codigo}-${dayIndex}-${mergedStart}-${idx}`}
                className="class-block group absolute rounded-xl p-1.5 border-l-[4px] shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 z-20 cursor-pointer overflow-hidden flex flex-col justify-between"
                style={{
                  left: `calc(${(dayIndex / days.length) * 100}% + 2px)`,
                  width: `calc(${(1 / days.length) * 100}% - 4px)`,
                  top: `${top}px`,
                  height: `${height}px`,
                  minHeight: '36px',
                  backgroundColor: color,
                  borderColor: 'rgba(0,0,0,0.2)',
                }}
                title={`${curso.nombre} — ${seccion.docente}`}
              >
                {/* Remove button ✕ */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Eliminar "${curso.nombre}" del horario?`)) {
                      removeCourse(curso.codigo);
                    }
                  }}
                  className="remove-grid-course-btn absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-900/60 hover:bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-30 shadow-sm"
                  title={`Eliminar ${curso.nombre}`}
                >
                  <X size={12} />
                </button>

                {/* Content */}
                <div className="flex flex-col h-full justify-center items-center text-center p-0.5 overflow-hidden pointer-events-none text-slate-950 dark:text-white font-sans">
                  <strong className="font-black leading-[1.1] text-[10px] sm:text-[11px] tracking-tight uppercase line-clamp-2 drop-shadow-xs">
                    {curso.nombre}
                  </strong>

                  {durationMin > 40 && (
                    <div className="flex items-center justify-center gap-1 mt-0.5 flex-wrap">
                      <span className="text-[8.5px] sm:text-[9.5px] font-extrabold leading-none">
                        📍 {aulaText} • Sec. {seccion.id}
                      </span>
                      {badge}
                    </div>
                  )}

                  {durationMin > 75 && (
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold leading-none mt-0.5 truncate w-full">
                      {seccion.docente}
                    </span>
                  )}

                  {durationMin > 95 && (
                    <span className="text-[8.5px] sm:text-[9.5px] font-extrabold mt-0.5 leading-none">
                      ⏰ {horaDisplay}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
