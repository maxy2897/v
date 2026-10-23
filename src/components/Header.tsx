import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppConfig } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { BASE_URL } from '../services/api';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  config: AppConfig;
}

// Lleva a la portada y pone el cursor en la casilla del código de seguimiento.
export const useIrAlSeguimiento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    const enfocar = () => {
      const input = document.getElementById('home-tracking') as HTMLInputElement | null;
      if (!input) return false;
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
      return true;
    };
    if (location.pathname === '/' && enfocar()) return;
    navigate('/');
    let intentos = 0;
    const timer = window.setInterval(() => {
      intentos += 1;
      if (enfocar() || intentos > 30) window.clearInterval(timer);
    }, 100);
  };
};

const IconoBuscar = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m20 20-3.5-3.5" />
  </svg>
);

const IconoUsuario = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path strokeLinecap="round" d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onOpenRegister, onOpenLogin, config }) => {
  const location = useLocation();
  const irAlSeguimiento = useIrAlSeguimiento();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/tarifas', label: 'Tarifas' },
    { path: '/calendario', label: 'Salidas' },
    { path: '/compras-online', label: 'Compras online' },
    { path: '/money-transfer', label: 'Money Transfer' },
    { path: '/tienda', label: 'Tienda' },
  ];

  const logo = (
    <Link to="/" className="flex items-center gap-3" aria-label="Bodipo Business, inicio">
      <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-white md:h-[50px] md:w-[50px]">
        <img src="/images/logo-bodipo.png" className="h-auto w-[38px] md:w-[40px]" alt="" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-[22px] font-bold uppercase leading-none tracking-[.04em] text-white md:text-2xl">Bodipo Business</span>
        <span className="mt-1 text-[12px] uppercase tracking-[.12em] text-[#A9C3CB] md:text-[13px]">Cada envío cuenta</span>
      </span>
    </Link>
  );

  const idiomas = (clase: string, activo: string, inactivo: string) => (
    <div className={clase}>
      {(['es', 'en', 'fr'] as const).map((l) => (
        <button key={l} onClick={() => setLanguage(l)} className={language === l ? activo : inactivo}>{l.toUpperCase()}</button>
      ))}
    </div>
  );

  const enlaceMenu = (item: { path: string; label: string }) => {
    const activo = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`relative shrink-0 py-1 font-display text-base font-semibold uppercase tracking-[.05em] transition-colors ${activo ? 'text-white' : 'text-white/85 hover:text-white'}`}
      >
        {item.label}
        {activo && <span className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#ffbd59]" />}
      </Link>
    );
  };

  return (
    <div className="sticky top-0 z-50 flex w-full flex-col shadow-[0_2px_14px_rgba(0,0,0,.2)]">
      <header className="bg-[#155e63]">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pb-3 pt-3.5 sm:px-6 lg:flex-nowrap lg:px-16 lg:py-3.5 xl:px-24">
          {logo}

          {/* Ordenador: menú en la misma barra */}
          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8" aria-label="Menú principal">
            <button onClick={irAlSeguimiento} className="shrink-0 py-1 font-display text-base font-semibold uppercase tracking-[.05em] text-white/85 hover:text-white">Seguimiento</button>
            {navItems.map(enlaceMenu)}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {idiomas(
              'hidden items-center gap-2 text-[12px] font-semibold xl:flex',
              'text-white',
              'text-white/45 hover:text-white'
            )}

            {isAuthenticated && <NotificationBell />}

            {isAuthenticated && user ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white transition hover:border-[#ffbd59]"
                  aria-label="Mi cuenta"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#0E2A3B]">{user.name?.charAt(0)}</span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                    <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#F3F6F7]">
                      {t('nav.dashboard')}
                    </Link>
                    <Link to="/dashboard?tab=settings" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#F3F6F7]">
                      {t('nav.settings') || 'Ajustes'}
                    </Link>
                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-white lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2"
                aria-label={t('nav.login')}
              >
                <IconoUsuario className="h-5 w-5" />
                <span className="hidden font-display text-[15px] font-semibold uppercase tracking-[.05em] lg:inline">{t('nav.login')}</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-white lg:hidden"
              aria-label="Abrir menú"
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Móvil: menú en una segunda fila, como la web anterior */}
          <nav className="-mx-4 flex w-[calc(100%+2rem)] gap-6 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:hidden" aria-label="Secciones">
            <button onClick={irAlSeguimiento} className="shrink-0 py-1 font-display text-base font-semibold uppercase tracking-[.05em] text-white">Seguimiento</button>
            {navItems.map(enlaceMenu)}
          </nav>
        </div>
      </header>

      {/* Menú del móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-sm flex-col overflow-y-auto bg-[#0E2A3B] text-white shadow-2xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                {logo}
                <button onClick={() => setMobileMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Cerrar menú">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <button
                onClick={() => { setMobileMenuOpen(false); irAlSeguimiento(); }}
                className="mx-5 mt-5 flex items-center justify-center gap-2 rounded-full bg-[#ffbd59] py-3.5 text-sm font-black text-[#06272b]"
              >
                <IconoBuscar className="h-4 w-4" /> Seguimiento de envío
              </button>

              <nav className="mt-4 flex flex-col px-5" aria-label="Menú">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-lg font-bold"
                  >
                    {item.label}
                    <span className="text-[#ffbd59]">›</span>
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link to="/dashboard?tab=settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between border-b border-white/10 py-4 text-lg font-bold">
                    {t('nav.settings') || 'Ajustes'}
                    <span className="text-[#ffbd59]">›</span>
                  </Link>
                )}
              </nav>

              <div className="mt-auto flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Cambiar tema">
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </button>
                  {idiomas(
                    'flex items-center gap-1 rounded-xl bg-white/10 p-1',
                    'rounded-lg bg-white px-3 py-1.5 text-xs font-black text-[#0E2A3B]',
                    'px-3 py-1.5 text-xs font-black text-white/60'
                  )}
                </div>

                {!isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <button onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }} className="w-full rounded-full border border-white/40 py-3 text-sm font-bold">
                      {t('nav.login')}
                    </button>
                    <button onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }} className="w-full rounded-full bg-white py-3 text-sm font-black text-[#0E2A3B]">
                      {t('nav.register')}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="w-full rounded-full bg-red-500/15 py-3 text-sm font-bold text-red-300">
                    {t('nav.logout')}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
