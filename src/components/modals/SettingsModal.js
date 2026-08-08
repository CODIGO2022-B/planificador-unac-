'use client';
import { X, Settings, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useSchedule } from '@/context/ScheduleContext';

export default function SettingsModal({ isOpen, onClose, openUploadModal }) {
  const { clearSchedule } = useSchedule();

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer la configuración inicial y limpiar la memoria local?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearAll = () => {
    if (confirm('¿Deseas quitar todos los cursos seleccionados de tu horario?')) {
      clearSchedule();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-black font-black flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer z-50"
          title="Cerrar"
        >
          <X size={18} strokeWidth={3} className="text-black" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="text-indigo-500" size={22} />
            Ajustes Avanzados del Sistema
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personaliza la visibilidad de la interfaz y gestiona los datos de horarios.
          </p>
        </div>

        <div className="space-y-6">
          {/* Seccion 1: Visibilidad de Botones de Interfaz */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalizar Interfaz y Botones
            </h4>
            
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mostrar botón 'Guardar Horario'</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mostrar botón 'Compartir'</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mostrar Tarjeta 'Optimiza tu horario'</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />
            </label>
          </div>

          {/* Seccion 2: Gestion y Carga de Horarios */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Actualización y Carga de Horarios
            </h4>
            
            <button 
              onClick={() => { onClose(); openUploadModal(); }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Upload size={16} /> Cargar Nuevo Horario Actualizado (Excel / XLSX)
            </button>

            <button 
              onClick={handleClearAll}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Trash2 size={16} /> Limpiar Todos los Cursos Seleccionados
            </button>

            <button 
              onClick={handleResetDefaults}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={16} /> Restablecer Configuración Inicial por Defecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
