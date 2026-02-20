import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
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

const Header: React.FC<HeaderProps> = ({ onOpenRegister, onOpenLogin, onOpenSettings, config }) => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(location.pathname);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/calendario', label: t('nav.calendar') },
    { path: '/tarifas', label: t('nav.rates') },
    { path: '/money-transfer', label: t('nav.money_transfer') },
    { path: '/tienda', label: t('nav.store') },
    { path: '/rastreo', label: t('nav.tracking') },
    { path: '/servicios', label: t('nav.services') },
  ];

  return (
    <div className="flex flex-col w-full sticky top-0 z-50">
      <header className="bg-teal-50/95 backdrop-blur-md border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-1 xl:gap-4 shrink-0">
              <div className="hidden md:flex items-center gap-1 mr-1 xl:mr-2">
                <button
                  onClick={() => window.history.back()}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-teal-100 text-teal-700 hover:bg-teal-50 hover:scale-110 transition-all shadow-sm"
                  title={t('btn.back') || 'Volver atrás'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => window.history.forward()}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-teal-100 text-teal-700 hover:bg-teal-50 hover:scale-110 transition-all shadow-sm"
                  title={t('btn.forward') || 'Ir adelante'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
              </div>

              <Link to="/" className="flex items-center space-x-2 group relative z-20">
                <div className="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 xl:w-28 xl:h-28 bg-transparent rounded-full group-hover:scale-110 transition-transform p-1">
                  {config.customLogoUrl ? (
                    <img src={config.customLogoUrl} className="h-full w-full object-contain filter drop-shadow-md" alt="Logo" />
                  ) : (
                    <span className="logo-font text-xl md:text-4xl xl:text-5xl text-green-900 leading-none select-none pt-1">{config.logoText}</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col -space-y-0.5 xl:-space-y-1">
                  <span className="text-lg xl:text-2xl font-black tracking-tighter text-[#00151a] uppercase group-hover:text-[#007e85] transition-colors shadow-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                    Bodipo
                  </span>
                  <span className="text-xs xl:text-sm font-bold tracking-[0.2em] text-[#007e85] uppercase">
                    Business
                  </span>
                </div>
              </Link>
            </div>

            {/* Language Switcher and Actions */}
            <div className="flex items-center gap-1.5 md:gap-4">
              {/* Mobile Language Switcher */}
              <div className="flex lg:hidden items-center text-[10px] font-bold uppercase bg-teal-600 text-white px-2 py-1.5 rounded-xl gap-2 shadow-sm">
                <button onClick={() => setLanguage('es')} className={`${language === 'es' ? 'opacity-100' : 'opacity-50'}`}>ES</button>
                <span className="opacity-30">|</span>
                <button onClick={() => setLanguage('en')} className={`${language === 'en' ? 'opacity-100' : 'opacity-50'}`}>EN</button>
                <span className="opacity-30">|</span>
                <button onClick={() => setLanguage('fr')} className={`${language === 'fr' ? 'opacity-100' : 'opacity-50'}`}>FR</button>
              </div>

              {/* Desktop Nav */}
              <nav
                className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 text-[9px] xl:text-[10px] font-black uppercase tracking-[0.1em] xl:tracking-[0.2em] text-gray-400 shrink-0"
                onMouseLeave={() => setHoveredPath(location.pathname)}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-2 py-2 transition-colors duration-300 z-10 whitespace-nowrap ${location.pathname === item.path ? 'text-[#007e85]' : 'hover:text-[#007e85]'
                      }`}
                    onMouseEnter={() => setHoveredPath(item.path)}
                  >
                    {item.path === hoveredPath && (
                      <motion.div
                        layoutId="bubble"
                        className="absolute inset-0 bg-teal-200/50 rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {item.label}
                  </Link>
                ))}

                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-100 shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleTheme}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      )}
                    </button>
                    <div className="flex items-center text-[9px] font-black uppercase gap-0.5">
                      <button onClick={() => setLanguage('es')} className={`${language === 'es' ? 'text-teal-600' : 'text-gray-400'}`}>ES</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => setLanguage('en')} className={`${language === 'en' ? 'text-teal-600' : 'text-gray-400'}`}>EN</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => setLanguage('fr')} className={`${language === 'fr' ? 'text-teal-600' : 'text-gray-400'}`}>FR</button>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Common Actions (Bell, Auth/User) */}
              <div className="flex items-center gap-2">
                {isAuthenticated && <NotificationBell />}

                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-teal-500 hover:border-teal-600 transition-all shadow-md overflow-hidden"
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-teal-700 font-bold text-xs">{user.name.charAt(0)}</div>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                        >
                          {t('nav.dashboard')}
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenSettings();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                        >
                          {t('nav.settings') || 'Ajustes'}
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          {t('nav.logout')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <button onClick={onOpenLogin} className="bg-white text-[#00151a] px-4 py-2 rounded-full hover:bg-gray-50 border-2 border-[#00151a] text-xs font-bold">
                      {t('nav.login')}
                    </button>
                    <button onClick={onOpenRegister} className="bg-[#00151a] text-white px-4 py-2 rounded-full hover:bg-[#007e85] shadow-lg text-xs font-bold">
                      {t('nav.register')}
                    </button>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-[#00151a]"
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-[70%] max-w-sm bg-white p-6 lg:hidden overflow-y-auto shadow-2xl border-l border-teal-100"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-black text-teal-900 uppercase tracking-widest">Menú</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-50 text-teal-900" aria-label="Cerrar menú">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex flex-col space-y-4 flex-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-black text-[#00151a] py-2 border-b border-gray-50 uppercase tracking-tighter"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="flex items-center gap-3 text-lg font-black text-teal-600 py-4 border-b border-gray-50 group uppercase tracking-tighter"
                  >
                    <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">⚙️</span>
                    {t('nav.settings') || 'Ajustes'}
                  </button>
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between py-4 border-b border-gray-50">
                    <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50">
                      {theme === 'dark' ? '🌙' : '☀️'}
                    </button>
                    <div className="flex items-center bg-gray-50 p-1 rounded-xl">
                      <button onClick={() => setLanguage('es')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${language === 'es' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'}`}>ES</button>
                      <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${language === 'en' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'}`}>EN</button>
                      <button onClick={() => setLanguage('fr')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${language === 'fr' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'}`}>FR</button>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }} className="w-full py-3 bg-white border-2 border-[#00151a] rounded-xl font-black text-[#00151a] uppercase text-xs">
                        {t('nav.login')}
                      </button>
                      <button onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }} className="w-full py-3 bg-[#00151a] text-white rounded-xl font-black uppercase text-xs">
                        {t('nav.register')}
                      </button>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="flex flex-col gap-2 border-t border-gray-50 pt-4">
                      <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="w-full py-4 text-red-600 font-bold text-xs uppercase tracking-widest bg-red-50 rounded-2xl">
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
