import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './src/components/Header';
import AIChat from './src/components/AIChat';
import RegisterModal from './src/components/RegisterModal';
import LoginModal from './src/components/LoginModal';
import ForgotPasswordModal from './src/components/ForgotPasswordModal';
import ContactModal from './src/components/ContactModal';
import AdminPanel from './src/components/AdminPanel';
import { Product, AppConfig } from './types';
import AnimatedPage from './src/components/AnimatedPage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { getProducts } from './src/services/productsApi';

// Pages
import HomePage from './src/pages/HomePage';
import CalendarPage from './src/pages/CalendarPage';
import ServicesPage from './src/pages/ServicesPage';
import TrackingPage from './src/pages/TrackingPage';
import RatesPage from './src/pages/RatesPage';
import StorePage from './src/pages/StorePage';
import ClientPage from './src/pages/ClientPage';
import MoneyTransferPage from './src/pages/MoneyTransferPage';
import DashboardPage from './src/pages/DashboardPage';
import PrivacyPage from './src/pages/PrivacyPage';
import NotificationsPage from './src/pages/NotificationsPage';


const INITIAL_CONFIG: AppConfig = {
  logoText: 'bb',
  customLogoUrl: '/images/logo-n.png'
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Component to handle "First Visit" logic
const FirstVisitRedirect = () => {
  const location = useLocation();
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('has_visited_session');
    if (!hasVisited && location.pathname !== '/') {
      // Only redirect if it's the very first load and not already on home
      // But wait... actually if they refresh, session storage persists.
      // If they close tab and open again, session storage clears.
      // That matches "First access -> Home", "Refresh -> Stay".
      window.location.replace('/');
    }
    sessionStorage.setItem('has_visited_session', 'true');
    setIsFirstVisit(false);
  }, []);

  return null;
};

const AnimatedRoutes: React.FC<{
  onOpenRegister: () => void;
  onOpenContact: () => void;
  onOpenForgotPassword: () => void;
  products: Product[];
}> = ({ onOpenRegister, onOpenContact, onOpenForgotPassword, products }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<AnimatedPage><HomePage onOpenRegister={onOpenRegister} onOpenContact={onOpenContact} /></AnimatedPage>} />
        <Route path="/calendario" element={<AnimatedPage><CalendarPage /></AnimatedPage>} />
        <Route path="/tarifas" element={<AnimatedPage><RatesPage /></AnimatedPage>} />
        <Route path="/servicios" element={<AnimatedPage><ServicesPage /></AnimatedPage>} />
        <Route path="/rastreo" element={<AnimatedPage><TrackingPage /></AnimatedPage>} />
        <Route path="/tienda" element={<AnimatedPage><StorePage products={products} /></AnimatedPage>} />
        <Route path="/acceso" element={<AnimatedPage><ClientPage onOpenForgotPassword={onOpenForgotPassword} /></AnimatedPage>} />
        <Route path="/money-transfer" element={<AnimatedPage><MoneyTransferPage /></AnimatedPage>} />
        <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
        <Route path="/privacidad" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
        <Route path="/notificaciones" element={<AnimatedPage><NotificationsPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

// AppContent component contains all the main logic that requires Contexts
const AppContent: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Dynamic State
  const [products, setProducts] = useState<Product[]>([]);

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('bb_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (data && data.length > 0) {
          console.log('📦 Productos cargados:', data.length);
          setProducts(data);
        } else {
          console.log('📦 No hay productos en BD.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('bb_config', JSON.stringify(config));
  }, [config]);

  // Admin Login Logic using AuthContext
  const { user } = useAuth();
  const { appConfig, t } = useSettings();

  const handleAdminLogin = () => {
    if (user && user.role === 'admin') {
      setIsAdminOpen(true);
    } else {
      alert('Acceso denegado. Se requieren permisos de administrador.');
    }
  };

  return (
    <>
      <ScrollToTop />
      <FirstVisitRedirect />
      <div className="min-h-screen flex flex-col selection:bg-teal-100 selection:text-teal-900 bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <Header
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          config={config}
        />

        <main className="flex-grow">
          <AnimatedRoutes
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
            products={products}
          />
        </main>

        <footer className="bg-[#00151a] py-12 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
              <div className="col-span-1 lg:col-span-1">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center border-[4px] border-white shadow-lg">
                    {config.customLogoUrl ? (
                      <img src={config.customLogoUrl} className="h-10 object-contain" alt="Logo" />
                    ) : (
                      <span className="logo-font text-4xl logo-color leading-none select-none pt-1">{config.logoText}</span>
                    )}
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase">BODIPO BUSINESS</span>
                </div>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                  {t('footer.logistics_desc')}
                </p>

                <button
                  onClick={handleAdminLogin}
                  className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 hover:text-teal-400 transition-all flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  {t('footer.admin_access')}
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">{t('footer.direct_contact')}</p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                      <span className="text-sm">🇪🇸</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('footer.spain')}</p>
                      <p className="text-sm font-bold">{appConfig?.contact?.phones?.es || '+34 641 992 110'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                      <span className="text-sm">🇨🇲</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('footer.cameroon')}</p>
                      <p className="text-sm font-bold">{appConfig?.contact?.phones?.cm || '+237 687528854'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                      <span className="text-sm">🇬🇶</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('footer.guinea')}</p>
                      <p className="text-sm font-bold">{appConfig?.contact?.phones?.gq || '+240 222 667 763'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">{t('footer.logistics_services')}</p>
                <ul className="space-y-3 text-sm font-medium text-gray-400">
                  <li><a href="/tarifas" className="hover:text-white transition-colors">{t('footer.calc_rates')}</a></li>
                  <li><a href="/calendario" className="hover:text-white transition-colors">{t('footer.calendar')}</a></li>
                  <li><a href="/rastreo" className="hover:text-white transition-colors">{t('footer.tracking')}</a></li>
                  <li><a href="/servicios" className="hover:text-white transition-colors">{t('footer.advisor')}</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">{t('footer.locations')}</p>
                <ul className="space-y-3 text-sm font-medium text-gray-400">
                  <li>{appConfig?.contact?.addresses?.es || t('footer.loc.madrid')}</li>
                  <li>{t('footer.loc.yaounde')}</li>
                  <li>{appConfig?.contact?.addresses?.gq || t('footer.loc.gq')}</li>
                </ul>
                <div className="pt-4">
                  <p className="text-[10px] font-black text-teal-500/50 uppercase tracking-widest">{t('footer.copyright')}</p>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onOpenForgotPassword={() => {
            setIsLoginOpen(false);
            setIsForgotPasswordOpen(true);
          }}
        />
        <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          products={products}
          setProducts={setProducts}
          config={config}
          setConfig={setConfig}
        />
        <AIChat config={config} />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
