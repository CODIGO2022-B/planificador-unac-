'use client';
import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { coursesData } from '@/data/courses';
import { useSchedule } from '@/context/ScheduleContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseSearch() {
  const { searchQuery, setSearchQuery, addCourse, selectedCourses } = useSchedule();
  const [isFocused, setIsFocused] = useState(false);

  // Group by ciclo first, then filter by search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    for (const course of coursesData) {
      if (
        course.nombre.toLowerCase().includes(query) ||
        course.codigo.toLowerCase().includes(query) ||
        course.docente?.toLowerCase().includes(query) // some old formats
      ) {
        // Find if this course is already selected (which section?)
        const isSelected = selectedCourses.some(sc => sc.curso.codigo === course.codigo);
        results.push({ ...course, isSelected });
      }
      if (results.length > 50) break; // limit to 50 results
    }
    return results;
  }, [searchQuery, selectedCourses]);

  return (
    <div className="relative w-full">
      {/* Search Bar */}
      <div className={`relative flex items-center bg-white dark:bg-slate-900 border transition-all duration-300 rounded-xl overflow-hidden ${
        isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700'
      }`}>
        <div className="pl-4 pr-3 text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Buscar por código, curso o docente..."
          className="w-full py-3 pr-4 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 font-sans"
        />
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isFocused && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-[60vh] overflow-y-auto"
          >
            {filteredCourses.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No se encontraron cursos
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredCourses.map(course => (
                  <div key={course.codigo} className="mb-2 border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {course.codigo} • Ciclo {course.ciclo}
                    </div>
                    <div className="px-2 font-medium text-slate-900 dark:text-white mb-2">
                      {course.nombre}
                    </div>
                    <div className="space-y-1">
                      {course.secciones.map(sec => (
                        <div 
                          key={sec.id}
                          onClick={() => {
                            addCourse({ curso: course, seccion: sec });
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                              Sección {sec.id}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {sec.docente || 'Por asignar'}
                            </div>
                          </div>
                          <button className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-md transition-all">
                            <Plus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
