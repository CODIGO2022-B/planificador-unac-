'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseCard({ selectedCourse, index = 0 }) {
  const { removeCourse, getCourseCredits } = useSchedule();
  
  const course = selectedCourse.curso;
  const section = selectedCourse.seccion;
  const credits = getCourseCredits(course);

  const badgeColors = [
    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
  ];
  const badgeClass = badgeColors[index % badgeColors.length];
  const daysList = Array.from(new Set(section.clases?.map(c => c.dia) || [])).join(' • ');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200 w-44 shrink-0 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase ${badgeClass}`}>
            Sección {section.id}
          </span>
          <button 
            onClick={() => removeCourse(course.codigo)}
            className="text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md transition-colors cursor-pointer"
            title="Quitar curso"
          >
            <X size={14} />
          </button>
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug truncate" title={course.nombre}>
          {course.nombre}
        </h4>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
          {credits} Créditos
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
          {daysList || 'Sin horario'}
        </span>
      </div>
    </motion.div>
  );
}

