import React, { useEffect, useState } from 'react';

interface CookiePreferencesProps { isOpen: boolean; onClose: () => void; }

const CookiePreferences: React.FC<CookiePreferencesProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('bb_cookie_consent');
    if (saved) {
      try { setAnalytics(Boolean(JSON.parse(saved).analytics)); } catch { setAnalytics(false); }
    }
  }, [isOpen]);
  if (!isOpen) return null;

  const persist = (allowAnalytics: boolean) => {
    localStorage.setItem('bb_cookie_consent', JSON.stringify({ necessary: true, analytics: allowAnalytics, updatedAt: new Date().toISOString() }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#007e85]">Privacidad</p>
        <h2 id="cookie-title" className="mt-3 text-2xl font-black text-[#06272b]">Consentimiento de cookies</h2>
        <p className="mt-4 text-sm leading-6 text-[#5d716e]">Utilizamos almacenamiento necesario para el funcionamiento de tu cuenta. Puedes decidir si autorizas medición anónima para mejorar el servicio.</p>
        <div className="mt-6 divide-y divide-[#e5dfd5] border-y border-[#e5dfd5]">
          <div className="flex items-center justify-between gap-4 py-4">
            <div><p className="font-bold text-[#06272b]">Cookies necesarias</p><p className="mt-1 text-xs text-[#6f817e]">Acceso, seguridad y preferencias básicas.</p></div>
            <span className="text-right text-[10px] font-black uppercase text-[#007e85]">Siempre activas</span>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
            <div><p className="font-bold text-[#06272b]">Medición anónima</p><p className="mt-1 text-xs text-[#6f817e]">Ayuda a comprender el uso general del sitio.</p></div>
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="h-5 w-5 accent-[#007e85]" />
          </label>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={() => persist(false)} className="border border-[#155e63] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#155e63]">Solo necesarias</button>
          <button onClick={() => persist(analytics)} className="bg-[#155e63] px-5 py-3 text-xs font-black uppercase tracking-wider text-white">Guardar preferencias</button>
        </div>
      </div>
    </div>
  );
};
export default CookiePreferences;