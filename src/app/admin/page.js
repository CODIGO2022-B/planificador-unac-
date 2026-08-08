'use client';
import { useState, useEffect } from 'react';
import AdminLoginModal from '@/components/admin/AdminLoginModal';
import ExcelConverterView from '@/components/admin/ExcelConverterView';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('is_admin_logged_in');
      if (session === 'true') {
        setIsLoggedIn(true);
      }
    }
    setIsCheckingSession(false);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('is_admin_logged_in');
    }
    setIsLoggedIn(false);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
        Verificando sesión administrativa...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLoginModal onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return <ExcelConverterView onLogout={handleLogout} />;
}
