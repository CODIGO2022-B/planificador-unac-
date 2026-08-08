'use client';
import { 
  CalendarDays, 
  FolderKanban, 
  BookOpen, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ 
  isOpen, 
  setIsOpen,
  openSavedModal,
  openStatsModal,
  openSettingsModal
}) {
  const [activeTab, setActiveTab] = useState('planner');

  const handleNavClick = (tabKey, action) => {
    setActiveTab(tabKey);
    if (action) action();
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const scrollToCatalog = () => {
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPlanner = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen shrink-0 bg-white dark:bg-slate-900 flex flex-col justify-between transition-all duration-300 overflow-hidden
        ${isOpen ? 'translate-x-0 w-64 p-5 border-r border-slate-200 dark:border-slate-800 opacity-100' : '-translate-x-full lg:-translate-x-full w-0 p-0 border-0 opacity-0 pointer-events-none'}
      `}>
        <div>
          {/* UNAC Logo & Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img 
                src="/img/Universidad-nacional-del-callao.png" 
                alt="UNAC Logo" 
                className="h-14 w-auto object-contain shrink-0 drop-shadow-sm transition-transform hover:scale-105" 
              />
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-tight tracking-tight">UNAC</h2>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                  Universidad Nacional<br />del Callao
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer"
              title="Cerrar menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => handleNavClick('planner', scrollToPlanner)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <CalendarDays size={16} />
              Planificador
            </button>

            <button 
              onClick={() => handleNavClick('schedules', openSavedModal)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FolderKanban size={16} />
              Mis Horarios
            </button>

            <button 
              onClick={() => handleNavClick('catalog', scrollToCatalog)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen size={16} />
              Catálogo de Cursos
            </button>

            <button 
              onClick={() => handleNavClick('stats', openStatsModal)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 size={16} />
              Estadísticas
            </button>

            <button 
              onClick={() => handleNavClick('settings', openSettingsModal)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Settings size={16} />
              Ajustes
            </button>
          </nav>
        </div>

        {/* Bottom CTA Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2">
            <Sparkles size={16} />
          </div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs mb-1">Optimiza tu horario</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-snug">
            Función de optimización inteligente. <span className="text-amber-500 font-bold">Próximamente disponible.</span>
          </p>
          <button 
            disabled 
            className="w-full py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-medium text-xs cursor-not-allowed relative"
          >
            Optimizar horario
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-sm">
              Pronto
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
