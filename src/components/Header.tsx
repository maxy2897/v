import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AppConfig } from '../../types';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { BASE_URL } from '../../services/api';

interface HeaderProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  config: AppConfig;
}

const Header: React.FC<HeaderProps> = ({ onOpenRegister, onOpenLogin, config }) => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(location.pathname);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 mr-2">
                <button
                  onClick={() => window.history.back()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-teal-100 text-teal-700 hover:bg-teal-50 hover:scale-110 transition-all shadow-sm"
                  title={t('btn.back') || 'Volver atrás'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => window.history.forward()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-teal-100 text-teal-700 hover:bg-teal-50 hover:scale-110 transition-all shadow-sm"
                  title={t('btn.forward') || 'Ir adelante'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                <div className="w-px h-8 bg-gray-200 mx-2"></div>
              </div>

              <Link to="/" className="flex items-center space-x-4 group">
                <div className="flex items-center justify-center w-20 h-20 group-hover:scale-105 transition-transform p-2">
                  {config.customLogoUrl ? (
                    <img src={config.customLogoUrl} className="h-full w-full object-contain" alt="Logo" />
                  ) : (
                    <span className="logo-font text-4xl text-green-900 leading-none select-none pt-1">{config.logoText}</span>
                  )}
                </div>
                <div className="flex flex-col -space-y-1">
                  <span className="text-xl font-black tracking-tighter text-[#00151a] uppercase group-hover:text-[#007e85] transition-colors">
                    Bodipo
                  </span>
                  <span className="text-sm font-bold tracking-[0.2em] text-[#007e85] uppercase">
                    Business
                  </span>
                </div>
              </Link>
            </div>
            <nav
              className="hidden lg:flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"
              onMouseLeave={() => setHoveredPath(location.pathname)}
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 transition-colors duration-300 z-10 ${location.pathname === item.path ? 'text-[#007e85]' : 'hover:text-[#007e85]'
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

              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-100">
                {/* Settings Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                  >
                    {theme === 'dark' ? (
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                  </button>
                  <div className="flex items-center text-[10px] font-black uppercase gap-1">
                    <button onClick={() => setLanguage('es')} className={`${language === 'es' ? 'text-teal-600' : 'text-gray-400'}`}>ES</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => setLanguage('en')} className={`${language === 'en' ? 'text-teal-600' : 'text-gray-400'}`}>EN</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => setLanguage('fr')} className={`${language === 'fr' ? 'text-teal-600' : 'text-gray-400'}`}>FR</button>
                  </div>
                </div>

                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-teal-500 hover:border-teal-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      title={user.username || user.name}
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 normal-case tracking-normal text-sm font-medium z-50">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-700"
                        >
                          {t('nav.dashboard')}
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {t('nav.logout')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={onOpenLogin}
                      className="bg-white text-[#00151a] px-6 py-2.5 rounded-full hover:bg-gray-50 transition-all border-2 border-[#00151a]"
                    >
                      {t('nav.login')}
                    </button>
                    <button
                      onClick={onOpenRegister}
                      className="bg-[#00151a] text-white px-6 py-2.5 rounded-full hover:bg-[#007e85] transition-all shadow-lg shadow-teal-900/20"
                    >
                      {t('nav.register')}
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;

