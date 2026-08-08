'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { 
  CalendarDays, 
  Save, 
  Share2, 
  Trash2, 
  RotateCcw, 
  Download, 
  ChevronDown,
  CalendarCheck
} from 'lucide-react';
import { exportToICS } from '@/lib/icsUtils';
import DesignPickerModal from '../export/DesignPickerModal';
import SaveScheduleModal from '../modals/SaveScheduleModal';
import Toast from '../ui/Toast';
import BottomSections from './BottomSections';
import ScheduleGrid from './ScheduleGrid';
import { useState } from 'react';

export default function ScheduleTable() {
  const { 
    selectedCourses, 
    clearSchedule, 
    undo, 
    canUndo, 
    saveSchedule, 
    getShareableLink,
    toast,
    closeToast
  } = useSchedule();
  
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6 w-full flex-1 min-w-0">
        {/* Main Schedule Container */}
        <div id="schedule-container" className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 transition-all duration-300 w-full">
          
          {/* Schedule Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <CalendarDays size={18} className="text-slate-400" />
                Mi Horario
              </h2>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                Horario Semanal
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
              {selectedCourses.length > 0 && (
                <>
                  <button 
                    onClick={() => setIsSaveModalOpen(true)}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                    title="Guardar este horario"
                  >
                    <Save size={14} />
                    <span className="hidden sm:inline">Guardar horario</span>
                  </button>

                  <button 
                    onClick={async () => {
                      await getShareableLink();
                    }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Compartir enlace de este horario"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Compartir</span>
                  </button>

                  <button 
                    onClick={() => exportToICS(selectedCourses)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Exportar archivo .ics para Google Calendar y celulares"
                  >
                    <CalendarCheck size={14} />
                    <span className="hidden sm:inline">Google Calendar (.ics)</span>
                  </button>

                  <button 
                    onClick={clearSchedule}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Vaciar horario"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Vaciar Horario</span>
                  </button>
                </>
              )}

              <button 
                onClick={undo}
                disabled={!canUndo}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center justify-center transition disabled:opacity-40"
                title="Deshacer (Ctrl+Z)"
              >
                <RotateCcw size={14} />
              </button>

              {/* Main Download Button Destacado (Abre Galería de Diseños) */}
              {selectedCourses.length > 0 && (
                <div className="relative flex items-center shadow-md rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white transition-all transform hover:scale-[1.02]">
                  <button 
                    onClick={() => setIsDesignModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer border-r border-indigo-500/40"
                  >
                    <Download size={16} className="animate-bounce" />
                    <span>Descargar Horario</span>
                  </button>
                  <button 
                    onClick={() => setIsDesignModalOpen(true)}
                    title="Elegir Plantilla de Diseño"
                    className="px-2.5 py-2 text-xs font-bold hover:bg-white/10 transition cursor-pointer rounded-r-xl"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Schedule View / Grid */}
          {selectedCourses.length === 0 ? (
            <div className="space-y-4">
              <ScheduleGrid />
              <div id="schedule-empty-state" className="flex flex-col items-center justify-center py-8 px-6 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="empty-state-icon text-4xl mb-3">📋</div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">Tu horario está vacío</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Haz clic en cualquier curso del catálogo a la izquierda para comenzar a armar tu horario semanal.
                </p>
              </div>
            </div>
          ) : (
            <ScheduleGrid />
          )}

        </div>

        {/* Cursos Seleccionados Horizontales & Bottom Stats */}
        <BottomSections />
      </div>

      {/* Modal Galería de Diseños */}
      <DesignPickerModal 
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
      />

      {/* Modal Guardar Horario Favorito */}
      <SaveScheduleModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={(name) => {
          saveSchedule(name);
        }}
      />

      {/* Toast Notification Flotante */}
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
