'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { Sun, Moon, Menu, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header({ toggleSidebar }) {
  const { setPalette, activePalette } = useSchedule();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme') || localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
    window.dispatchEvent(new Event('theme-changed'));
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer"
          title="Mostrar menú lateral"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Planificador de Horarios
          </h1>
          <p className="text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
            Administración • 2026-B
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select 
          value={activePalette}
          onChange={(e) => setPalette(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer outline-none"
        >
          <option value="default">Tonos Suaves</option>
          <option value="vibrant">Color Vibrante</option>
          <option value="pastel">Tonos Pastel</option>
        </select>

        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition cursor-pointer"
          aria-label="Alternar Modo Oscuro"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link
          href="/admin"
          className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer flex items-center justify-center"
          title="Panel Admin Privado & Conversor de Horarios"
        >
          <Lock size={18} />
        </Link>
      </div>
    </header>
  );
}
