import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './src/components/Header';
import AnimatedPage from './src/components/AnimatedPage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { getProducts } from './src/services/productsApi';
import { Product, AppConfig } from './types';

// Lazy loaded components and modals to optimize bundle size
const AIChat = lazy(() => import('./src/components/AIChat'));
const RegisterModal = lazy(() => import('./src/components/RegisterModal'));
const LoginModal = lazy(() => import('./src/components/LoginModal'));
const ForgotPasswordModal = lazy(() => import('./src/components/ForgotPasswordModal'));
const ContactModal = lazy(() => import('./src/components/ContactModal'));
const AdminPanel = lazy(() => import('./src/components/AdminPanel'));
const SettingsModal = lazy(() => import('./src/components/SettingsModal'));

// Lazy loaded Pages
const HomePage = lazy(() => import('./src/pages/HomePage'));
const CalendarPage = lazy(() => import('./src/pages/CalendarPage'));

const TrackingPage = lazy(() => import('./src/pages/TrackingPage'));
const RatesPage = lazy(() => import('./src/pages/RatesPage'));
const StorePage = lazy(() => import('./src/pages/StorePage'));
const ClientPage = lazy(() => import('./src/pages/ClientPage'));
const MoneyTransferPage = lazy(() => import('./src/pages/MoneyTransferPage'));
const DashboardPage = lazy(() => import('./src/pages/DashboardPage'));
const PrivacyPage = lazy(() => import('./src/pages/PrivacyPage'));
const NotificationsPage = lazy(() => import('./src/pages/NotificationsPage'));

// Fallback loader for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-teal-600 animate-pulse">Cargando...</p>
    </div>
  </div>
);


const INITIAL_CONFIG: AppConfig = {
  logoText: 'bb',
  customLogoUrl: './images/logo-n.png'
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
  useEffect(() => {
    console.log('🚀 App Mounting');
  }, []);
  return null;
};

const AnimatedRoutes: React.FC<{
  onOpenRegister: () => void;
  onOpenContact: () => void;
  onOpenForgotPassword: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  config: AppConfig;
  setConfig: (c: AppConfig) => void;
}> = ({ onOpenRegister, onOpenContact, onOpenForgotPassword, onOpenSettings, onOpenAdmin, products, setProducts, config, setConfig }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<AnimatedPage><HomePage onOpenRegister={onOpenRegister} onOpenContact={onOpenContact} /></AnimatedPage>} />
        <Route path="/calendario" element={<AnimatedPage><CalendarPage /></AnimatedPage>} />
        <Route path="/tarifas" element={<AnimatedPage><RatesPage /></AnimatedPage>} />

        <Route path="/rastreo" element={<AnimatedPage><TrackingPage /></AnimatedPage>} />
        <Route path="/tienda" element={<AnimatedPage><StorePage products={products} /></AnimatedPage>} />
        <Route path="/acceso" element={<AnimatedPage><ClientPage onOpenForgotPassword={onOpenForgotPassword} /></AnimatedPage>} />
        <Route path="/money-transfer" element={<AnimatedPage><MoneyTransferPage /></AnimatedPage>} />
        <Route path="/dashboard" element={<AnimatedPage><DashboardPage onOpenSettings={onOpenSettings} onOpenAdmin={onOpenAdmin} /></AnimatedPage>} />
        <Route path="/privacidad" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
        <Route path="/notificaciones" element={<AnimatedPage><NotificationsPage /></AnimatedPage>} />
        <Route path="/admin" element={
          <AnimatedPage>
            <AdminPanel 
              products={products} 
              setProducts={setProducts} 
              config={config} 
              setConfig={setConfig} 
            />
          </AnimatedPage>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// AppContent component contains all the main logic that requires Contexts
const AppContent: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  // Dynamic State
  const [products, setProducts] = useState<Product[]>([]);

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('bb_config');
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch (e) {
      return INITIAL_CONFIG;
    }
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
    const isAdmin = user && (user.role === 'admin' || user.role?.startsWith('admin_'));
    if (isAdmin) {
      window.scrollTo(0, 0);
      navigate('/admin');
    } else {
      alert('Acceso denegado. Se requieren permisos de administrador.');
    }
  };

  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col selection:bg-teal-100 selection:text-teal-900 bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300">
        {!isAdminRoute && (
          <Header
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            config={config}
          />
        )}

        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenContact={() => setIsContactOpen(true)}
              onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAdmin={handleAdminLogin}
              products={products}
              setProducts={setProducts}
              config={config}
              setConfig={setConfig}
            />
          </Suspense>
        </main>

        {!isAdminRoute && (
          <footer className="bg-[#00151a] py-12 text-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center border-[4px] border-white shadow-lg">
                      {config.customLogoUrl && (
                        <img
                          src={config.customLogoUrl}
                          className="h-10 object-contain"
                          alt="Logo"
                        />
                      )}
                      {!config.customLogoUrl && (
                        <span className="logo-font text-4xl logo-color leading-none select-none pt-1">{config.logoText}</span>
                      )}
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase">BODIPO BUSINESS</span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                    {t('footer.logistics_desc')}
                  </p>
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
                    <li><Link to="/tarifas" className="hover:text-white transition-colors">{t('footer.calc_rates')}</Link></li>
                    <li><Link to="/calendario" className="hover:text-white transition-colors">{t('footer.calendar')}</Link></li>
                    <li><Link to="/rastreo" className="hover:text-white transition-colors">{t('footer.tracking')}</Link></li>
                    <li><Link to="/calendario" className="hover:text-white transition-colors">{t('footer.advisor')}</Link></li>
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
        )}

        <Suspense fallback={null}>
          {isRegisterOpen && <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />}
          {isLoginOpen && (
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onOpenForgotPassword={() => {
                setIsLoginOpen(false);
                setIsForgotPasswordOpen(true);
              }}
            />
          )}
          {isForgotPasswordOpen && <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />}
          {isContactOpen && <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />}
          <AIChat config={config} />
          {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
        </Suspense>
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
