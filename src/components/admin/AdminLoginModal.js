'use client';
import { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminLoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'misael' && password === '12345') {
      setError(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('is_admin_logged_in', 'true');
      }
      onLoginSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner transform rotate-3">
          <Lock size={32} />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
          Acceso Privado
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
          Panel Administrativo de Horarios UNAC
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
              Usuario
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="misael"
              className="w-full px-4 py-3 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-semibold text-sm transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-bold text-sm transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
              <ShieldAlert size={16} /> Credenciales incorrectas
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            Entrar al Sistema <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-8">
          © 2026 Admin Panel • ErikMisael
        </p>
      </div>
    </div>
  );
}
