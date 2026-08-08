'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { X, Play, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BottomSections() {
  const { selectedCourses, removeCourse, setSelectedCourses, getColor } = useSchedule();
  const [savedSchedules, setSavedSchedules] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('saved-schedules');
    if (data) {
      try {
        setSavedSchedules(JSON.parse(data));
      } catch (e) {
        setSavedSchedules([]);
      }
    }
  }, [selectedCourses]);

  const handleLoadSchedule = (schedule) => {
    setSelectedCourses(schedule.courses || []);
  };

  const handleDeleteSchedule = (id) => {
    if (confirm('¿Eliminar este horario guardado?')) {
      const updated = savedSchedules.filter(s => s.id !== id);
      setSavedSchedules(updated);
      localStorage.setItem('saved-schedules', JSON.stringify(updated));
    }
  };

  const badgeColors = [
    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. Cursos Seleccionados Horizontales */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Cursos Seleccionados
        </h3>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {selectedCourses.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center w-full">
              Aún no has seleccionado ningún curso.
            </p>
          ) : (
            selectedCourses.map((s, idx) => {
              const badgeClass = badgeColors[idx % badgeColors.length];
              const daysList = [...new Set(s.seccion.clases.map(c => c.dia))].join(' • ');
              const credits = s.curso.creditos || 3;

              return (
                <div 
                  key={s.curso.codigo}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200 w-44 shrink-0 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase ${badgeClass}`}>
                        Sección {s.seccion.id}
                      </span>
                      <button 
                        onClick={() => removeCourse(s.curso.codigo)}
                        className="text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md transition"
                        title="Quitar curso"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug truncate" title={s.curso.nombre}>
                      {s.curso.nombre}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {credits} Créditos
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                      {daysList}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Horarios Guardados */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Horarios Guardados
        </h3>
        
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {savedSchedules.length === 0 ? (
            <p className="text-slate-400 text-xs col-span-full text-center py-6 italic">
              Aún no has guardado ningún horario.
            </p>
          ) : (
            savedSchedules.map((s) => (
              <div 
                key={s.id} 
                className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate flex-1">{s.name}</h4>
                  <span className="text-[9px] text-slate-400 font-mono ml-1">{new Date(s.id).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleLoadSchedule(s)}
                    className="flex-1 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Play size={10} /> Cargar
                  </button>

                  <button 
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="p-1 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-200 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
