'use client';
import { useSchedule } from '@/context/ScheduleContext';
import CourseCard from './CourseCard';
import { AnimatePresence } from 'framer-motion';

export default function SelectedCoursesList() {
  const { selectedCourses } = useSchedule();

  if (selectedCourses.length === 0) {
    return (
      <div id="selected-courses-list" className="flex gap-3 overflow-x-auto pb-2">
        <p className="text-xs text-slate-400 italic py-4 text-center w-full">
          Aún no has seleccionado ningún curso.
        </p>
      </div>
    );
  }

  return (
    <div id="selected-courses-list" className="flex gap-3 overflow-x-auto pb-2">
      <AnimatePresence>
        {selectedCourses.map((sc, idx) => (
          <CourseCard key={sc.curso.codigo} selectedCourse={sc} index={idx} />
        ))}
      </AnimatePresence>
    </div>
  );
}

