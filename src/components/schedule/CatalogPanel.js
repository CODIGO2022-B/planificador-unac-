'use client';
import { useState, useMemo } from 'react';
import { Search, Plus, Check, ChevronDown } from 'lucide-react';
import { coursesData } from '@/data/courses';
import { useSchedule } from '@/context/ScheduleContext';
import ConflictModal from '../modals/ConflictModal';

const romanToInt = (s) => {
  if (!s || typeof s !== 'string') return 99;
  const map = { 'I': 1, 'V': 5, 'X': 10 };
  let result = 0;
  const str = s.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    const current = map[str[i]] || 0;
    const next = map[str[i + 1]] || 0;
    if (next > current) {
      result += next - current;
      i++;
    } else {
      result += current;
    }
  }
  return result || 99;
};

export default function CatalogPanel() {
  const { addCourse, removeCourse, selectedCourses, setPreviewCourse, getConflict } = useSchedule();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [openCycles, setOpenCycles] = useState({});
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [pendingCourseData, setPendingCourseData] = useState(null);

  // Unique cycles sorted by Roman numeral
  const cycles = useMemo(() => {
    const set = new Set();
    coursesData.forEach(c => {
      if (c.ciclo) set.add(c.ciclo);
    });
    return Array.from(set).sort((a, b) => romanToInt(a) - romanToInt(b));
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return coursesData.filter(course => {
      const matchCycle = !selectedCycle || course.ciclo === selectedCycle;
      if (!matchCycle) return false;

      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const nameMatch = course.nombre?.toLowerCase().includes(query);
      const codeMatch = course.codigo?.toLowerCase().includes(query);
      const teacherMatch = course.secciones?.some(s => s.docente?.toLowerCase().includes(query));

      return nameMatch || codeMatch || teacherMatch;
    });
  }, [searchQuery, selectedCycle]);

  // Group by cycle and sort courses numerically by code (codigo)
  const groupedByCycle = useMemo(() => {
    const map = {};
    filteredCourses.forEach(c => {
      if (!map[c.ciclo]) map[c.ciclo] = [];
      map[c.ciclo].push(c);
    });

    // Ordenar los cursos dentro de cada ciclo de menor a mayor por su código
    Object.keys(map).forEach(cycle => {
      map[cycle].sort((a, b) => {
        const numA = parseInt(a.codigo, 10);
        const numB = parseInt(b.codigo, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return String(a.codigo || '').localeCompare(String(b.codigo || ''));
      });
    });

    return map;
  }, [filteredCourses]);

  const toggleCycle = (cycle) => {
    setOpenCycles(prev => ({ ...prev, [cycle]: !prev[cycle] }));
  };

  const handleSelectSection = (course, sec) => {
    const isSelected = selectedCourses.some(sc => sc.curso.codigo === course.codigo && sc.seccion.id === sec.id);
    if (isSelected) {
      removeCourse(course.codigo);
      return;
    }

    // Check for conflict across all classes in sec
    let conflict = null;
    if (sec.clases) {
      for (const clase of sec.clases) {
        const found = getConflict(clase);
        if (found && found.selectedCourse.curso.codigo !== course.codigo) {
          conflict = found;
          break;
        }
      }
    }

    if (conflict) {
      setConflictInfo(conflict);
      setPendingCourseData({ curso: course, seccion: sec });
      setConflictModalOpen(true);
    } else {
      addCourse({ curso: course, seccion: sec });
    }
  };

  return (
    <>
      <aside id="catalog-section" className="lg:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Catálogo de Cursos</h2>
        </div>

        {/* Buscador & Filtros */}
        <div className="space-y-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar curso, código o docente..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <Search size={16} className="text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select 
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer outline-none"
            >
              <option value="">Todos los ciclos</option>
              {cycles.map(c => (
                <option key={c} value={c}>Ciclo {c}</option>
              ))}
            </select>

            <select 
              className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer outline-none"
            >
              <option value="">Todas las áreas</option>
            </select>
          </div>
        </div>

        {/* Lista de Cursos Agrupados por Ciclo */}
        <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No se encontraron cursos</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Prueba cambiando los términos de búsqueda.</p>
            </div>
          ) : (
            Object.keys(groupedByCycle)
              .sort((a, b) => romanToInt(a) - romanToInt(b))
              .map(ciclo => {
                const isCycleOpen = openCycles[ciclo] !== false;

                return (
                  <div key={ciclo} className="mb-1">
                    {/* Toggle Header for Cycle */}
                    <button 
                      onClick={() => toggleCycle(ciclo)}
                      className="w-full px-3 py-2 rounded-lg flex justify-between items-center transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-left"
                    >
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Ciclo {ciclo}
                      </span>
                      <ChevronDown 
                        size={14} 
                        className={`text-slate-400 transition-transform duration-200 ${isCycleOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Cycle Content */}
                    {isCycleOpen && (
                      <div className="space-y-2 pt-1 pb-1">
                        {groupedByCycle[ciclo].map(course => {
                          const sectionsCount = course.secciones ? course.secciones.length : 0;
                          const credits = course.creditos !== undefined && course.creditos !== null ? course.creditos : 3;

                          return (
                            <div 
                              key={course.codigo}
                              className="rounded-2xl bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/90 dark:border-slate-700/50 p-3 mb-3 space-y-2"
                            >
                              {/* Course Header */}
                              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-700/60">
                                <div>
                                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs leading-snug">
                                    {course.nombre}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-[9.5px] border border-indigo-100 dark:border-indigo-900/50">
                                      {course.codigo}
                                    </span>
                                    <span>• {credits} Créditos</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full shrink-0">
                                  {sectionsCount} {sectionsCount === 1 ? 'sección' : 'secciones'}
                                </span>
                              </div>

                              {/* Section Items */}
                              <div className="space-y-2">
                                {course.secciones?.map((sec, idx) => {
                                  const isSelected = selectedCourses.some(sc => sc.curso.codigo === course.codigo && sc.seccion.id === sec.id);
                                  const fakeVacancies = 8 + ((parseInt(course.codigo) || 12) * (idx + 1)) % 15;

                                  const badgeClass = isSelected
                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300';

                                  return (
                                    <div 
                                      key={sec.id}
                                      onMouseEnter={() => {
                                        if (!isSelected && setPreviewCourse) {
                                          setPreviewCourse({ course, section: sec });
                                        }
                                      }}
                                      onMouseLeave={() => {
                                        if (setPreviewCourse) {
                                          setPreviewCourse(null);
                                        }
                                      }}
                                      onClick={() => handleSelectSection(course, sec)}
                                      className={`group relative p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all duration-200 cursor-pointer ${
                                        isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${badgeClass}`}>
                                          Sección {sec.id}
                                        </span>

                                        <button 
                                          type="button"
                                          title={isSelected ? "Quitar curso" : "Agregar curso al horario (+)"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectSection(course, sec);
                                          }}
                                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
                                            isSelected 
                                              ? 'bg-indigo-600 text-white shadow-sm' 
                                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/50'
                                          }`}
                                        >
                                          {isSelected ? (
                                            <Check size={14} strokeWidth={3} />
                                          ) : (
                                            <Plus size={14} strokeWidth={2.5} />
                                          )}
                                        </button>
                                      </div>

                                      <div className="mt-1.5 flex items-center justify-between gap-1 text-[10.5px]">
                                        <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                                          {sec.docente || 'Prof. Por designar'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                                          Vacantes: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{sec.cupos !== undefined && sec.cupos !== null ? sec.cupos : sec.vacantes !== undefined && sec.vacantes !== null ? sec.vacantes : 40}</strong>
                                        </span>
                                      </div>

                                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 space-y-1">
                                        {sec.clases?.map((clase, i) => (
                                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                            <span className="font-bold text-slate-600 dark:text-slate-300 w-7 shrink-0">{clase.dia}</span>
                                            <span className="font-mono text-[9.5px]">{clase.hora}</span>
                                            <span className="ml-auto bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                              {clase.aula}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </aside>

      {/* Modal de Cruces con Sugerencia Inteligente */}
      <ConflictModal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        conflictInfo={conflictInfo}
        pendingCourseData={pendingCourseData}
        onSelectSuggestedSection={(suggestedCourseData) => {
          addCourse(suggestedCourseData);
        }}
        onForceReplace={(courseData) => {
          addCourse(courseData);
        }}
      />
    </>
  );
}
