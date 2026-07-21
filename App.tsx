import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './src/components/Header';
import AnimatedPage from './src/components/AnimatedPage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { getProducts } from './src/services/productsApi';
import { Product, AppConfig } from './types';
import PullToRefresh from './src/components/PullToRefresh';

// Lazy loaded components and modals to optimize bundle size
const AIChat = lazy(() => import('./src/components/AIChat'));
const RegisterModal = lazy(() => import('./src/components/RegisterModal'));
const LoginModal = lazy(() => import('./src/components/LoginModal'));
const ForgotPasswordModal = lazy(() => import('./src/components/ForgotPasswordModal'));
const ContactModal = lazy(() => import('./src/components/ContactModal'));
const AdminPanel = lazy(() => import('./src/components/AdminPanel'));
const SettingsModal = lazy(() => import('./src/components/SettingsModal'));
const AboutTeamPanel = lazy(() => import('./src/components/AboutTeamPanel'));
const CookiePreferences = lazy(() => import('./src/components/CookiePreferences'));

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
const TermsPage = lazy(() => import('./src/pages/TermsPage'));
const SiteMapPage = lazy(() => import('./src/pages/SiteMapPage'));
import NotificationsPage from './src/pages/NotificationsPage';
// const NotificationsPage = lazy(() => import('./src/pages/NotificationsPage'));
const OnlineShoppingPage = lazy(() => import('./src/pages/OnlineShoppingPage'));

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
  onOpenAbout: () => void;
  onOpenForgotPassword: (email?: string) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  config: AppConfig;
  setConfig: (c: AppConfig) => void;
}> = ({ onOpenRegister, onOpenContact, onOpenAbout, onOpenForgotPassword, onOpenSettings, onOpenAdmin, products, setProducts, config, setConfig }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<AnimatedPage><HomePage onOpenRegister={onOpenRegister} onOpenContact={onOpenContact} onOpenAbout={onOpenAbout} /></AnimatedPage>} />
        <Route path="/calendario" element={<AnimatedPage><CalendarPage /></AnimatedPage>} />
        <Route path="/tarifas" element={<AnimatedPage><RatesPage /></AnimatedPage>} />

        <Route path="/rastreo" element={<AnimatedPage><TrackingPage /></AnimatedPage>} />
        <Route path="/tienda" element={<AnimatedPage><StorePage products={products} /></AnimatedPage>} />
        <Route path="/acceso" element={<AnimatedPage><ClientPage onOpenForgotPassword={onOpenForgotPassword} /></AnimatedPage>} />
        <Route path="/money-transfer" element={<AnimatedPage><MoneyTransferPage /></AnimatedPage>} />
        <Route path="/compras-online" element={<AnimatedPage><OnlineShoppingPage /></AnimatedPage>} />
        <Route path="/dashboard" element={<AnimatedPage><DashboardPage onOpenSettings={onOpenSettings} onOpenAdmin={onOpenAdmin} onOpenForgotPassword={onOpenForgotPassword} /></AnimatedPage>} />
        <Route path="/privacidad" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
        <Route path="/condiciones" element={<AnimatedPage><TermsPage /></AnimatedPage>} />
        <Route path="/mapa-del-sitio" element={<AnimatedPage><SiteMapPage /></AnimatedPage>} />
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
  const [resetEmail, setResetEmail] = useState<string | undefined>(undefined);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCookieOpen, setIsCookieOpen] = useState(() => !localStorage.getItem('bb_cookie_consent'));
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

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    window.location.reload();
  };

  return (
    <>
      <ScrollToTop />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className={`min-h-screen flex flex-col selection:bg-teal-100 selection:text-teal-900 bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300`}>
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
              onOpenAbout={() => setIsAboutOpen(true)}
              onOpenForgotPassword={(email) => {
                setResetEmail(email);
                setIsForgotPasswordOpen(true);
              }}
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
          <footer className="relative z-50">

            <div className="bg-[#155e63] text-white">
              <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 text-xs sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
                <div className="flex items-center gap-3">
                  {config.customLogoUrl ? (
                    <img src={config.customLogoUrl} className="h-9 w-9 object-contain logo-white-outline" alt="Bodipo Business" />
                  ) : (
                    <span className="logo-font text-2xl text-white">{config.logoText}</span>
                  )}
                  <p className="font-bold tracking-wide">
                    © {new Date().getFullYear()} Bodipo Business
                  </p>
                </div>

                <nav className="grid grid-cols-1 gap-0 text-white/85 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center" aria-label="Enlaces del pie de página">
                  <Link to="/mapa-del-sitio" className="border-white/25 py-2 transition hover:text-white lg:border-l lg:px-4 lg:py-0">Mapa del sitio</Link>
                  <button onClick={() => setIsCookieOpen(true)} className="border-white/25 py-2 transition hover:text-white lg:border-l lg:px-4 lg:py-0">Consentimiento de cookies</button>
                  <Link to="/condiciones" className="border-white/25 py-2 transition hover:text-white lg:border-l lg:px-4 lg:py-0">Condiciones de uso</Link>
                  <Link to="/privacidad" className="border-white/25 py-2 transition hover:text-white lg:border-l lg:px-4 lg:py-0">Política de privacidad</Link>
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-bodipo-chat'))} className="inline-flex items-center gap-2 border-white/25 py-2 font-bold text-white transition hover:text-[#ffbd59] lg:border-l lg:pl-4 lg:py-0">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M5 18l-2 3v-5a9 9 0 1 1 4 4" /></svg>
                    Preguntar a Bodipo
                  </button>
                </nav>
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
              onOpenForgotPassword={(email) => {
                setIsLoginOpen(false);
                setResetEmail(email);
                setIsForgotPasswordOpen(true);
              }}
            />
          )}
          {isForgotPasswordOpen && (
            <ForgotPasswordModal 
              isOpen={isForgotPasswordOpen} 
              onClose={() => {
                setIsForgotPasswordOpen(false);
                setResetEmail(undefined);
              }} 
              initialEmail={resetEmail}
            />
          )}
          {isContactOpen && <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />}
          <AIChat config={config} />
          {isAboutOpen && <AboutTeamPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />}
          {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
          <CookiePreferences isOpen={isCookieOpen} onClose={() => setIsCookieOpen(false)} />
        </Suspense>
      </div>
      </PullToRefresh>
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
