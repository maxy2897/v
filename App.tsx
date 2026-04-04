import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import AIChat from './components/AIChat';
import RegisterModal from './components/RegisterModal';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import { Product, AppConfig } from './types';
import AnimatedPage from './src/components/AnimatedPage';
import AboutTeamPanel from './components/AboutTeamPanel';

import { AuthProvider } from './src/context/AuthContext';

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

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Camiseta Oficial Bodipo 'SOMOS TU MEJOR OPCIÓN'",
    color: "Blanco Premium",
    price: "25.000 FCFA",
    description: "Diseño exclusivo 2026. Algodón de alta calidad con logotipo BB en el pecho y diseño artístico 'Somos tu mejor opción' en la espalda. Incluye el lema 'Recibe bultos desde Europa'. ¡Envío gratuito incluido a Malabo y Bata!",
    image: "/images/camisa-bodipo.png",
    tag: "TOP VENTAS",
    slogan: "Recibe bultos desde Europa",
    waLink: "https://wa.me/34641992110?text=Hola!%20Quiero%20comprar%20la%20camiseta%20blanca%20oficial%20de%20Bodipo%20Business."
  },
  {
    id: '2',
    name: "Camiseta Oficial Negra Edición 'KIENTEM'",
    color: "Negro Premium",
    price: "15.000 FCFA",
    description: "Edición especial en negro con el lema 'SOMOS TU MEJOR OPCIÓN' y 'KIENTEM' en la espalda. Algodón premium.",
    image: "/images/camiseta-negra.jpg",
    tag: "NUEVO",
    slogan: "Estilo y Pertenencia",
    waLink: "https://wa.me/34641992110?text=Hola!%20Quiero%20comprar%20la%20camiseta%20negra%20Edición%20Kientem."
  },
  {
    id: '3',
    name: "Camiseta Oficial Blanca Edición 'ECUATO'",
    color: "Blanco Puro",
    price: "15.000 FCFA",
    description: "Diseño exclusivo blanco con detalles en vinilo dorado 'ECUATO'. Elegancia y orgullo nacional.",
    image: "/images/camiseta-blanca.jpg",
    tag: "EXCLUSIVO",
    slogan: "Los negocios no tienen fronteras",
    waLink: "https://wa.me/34641992110?text=Hola!%20Quiero%20comprar%20la%20camiseta%20blanca%20Edición%20Ecuato."
  }
];

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

const AnimatedRoutes: React.FC<{
  onOpenRegister: () => void;
  products: Product[];
}> = ({ onOpenRegister, products }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<AnimatedPage><HomePage onOpenRegister={onOpenRegister} /></AnimatedPage>} />
        <Route path="/calendario" element={<AnimatedPage><CalendarPage /></AnimatedPage>} />
        <Route path="/tarifas" element={<AnimatedPage><RatesPage /></AnimatedPage>} />
        <Route path="/servicios" element={<AnimatedPage><ServicesPage /></AnimatedPage>} />
        <Route path="/rastreo" element={<AnimatedPage><TrackingPage /></AnimatedPage>} />
        <Route path="/tienda" element={<AnimatedPage><StorePage products={products} /></AnimatedPage>} />
        <Route path="/acceso" element={<AnimatedPage><ClientPage /></AnimatedPage>} />
        <Route path="/money-transfer" element={<AnimatedPage><MoneyTransferPage /></AnimatedPage>} />
        <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
        <Route path="/privacidad" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('bb_admin_token'));
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Dynamic State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bb_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('bb_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('bb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bb_config', JSON.stringify(config));
  }, [config]);

  const handleAdminLogin = () => {
    if (adminToken) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminAuthSuccess = (token: string) => {
    localStorage.setItem('bb_admin_token', token);
    setAdminToken(token);
    setIsAdminOpen(true);
  };

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col selection:bg-teal-100 selection:text-teal-900 bg-white">
          <Header
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            config={config}
          />

          <main className="flex-grow">
            <AnimatedRoutes onOpenRegister={() => setIsRegisterOpen(true)} products={products} />
          </main>

          <footer className="bg-[#00151a] py-24 text-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center border-[4px] border-white shadow-lg">
                      {config.customLogoUrl ? (
                        <img src={config.customLogoUrl} alt="Bodipo Business Logo" className="h-10 object-contain" />
                      ) : (
                        <span className="logo-font text-4xl logo-color leading-none select-none pt-1">{config.logoText}</span>
                      )}
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase">BODIPO BUSINESS</span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                    Logística de excelencia conectando España 🇪🇸, Camerún 🇨🇲 y Guinea Ecuatorial 🇬🇶. Operaciones diarias con los más altos estándares de seguridad.
                  </p>

                  <div className="flex flex-col gap-4 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500/80">Nuestro Equipo</p>
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Member 1: Nguema */}
                      <button 
                        onClick={() => setIsAboutOpen(true)}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 overflow-hidden group-hover:border-teal-400 transition-all shadow-lg group-hover:scale-105 duration-300">
                          <img 
                            src="./images/dv-nguema.jpeg" 
                            alt="Director" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black uppercase tracking-tight text-white group-hover:text-teal-400 transition-colors leading-none">D. V. Nguema</span>
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1 group-hover:text-teal-400/50">Director</span>
                        </div>
                      </button>

                      <div className="w-px h-8 bg-gray-800" />

                      {/* Member 2: Martin Ndong */}
                      <button 
                        onClick={() => setIsAboutOpen(true)}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 overflow-hidden group-hover:border-teal-400 transition-all shadow-lg group-hover:scale-105 duration-300">
                          <img 
                            src="./images/da-martin.jpg" 
                            alt="Product Design" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black uppercase tracking-tight text-white group-hover:text-teal-400 transition-colors leading-none">D.A. Martin</span>
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1 group-hover:text-teal-400/50">Product Design</span>
                        </div>
                      </button>

                      <div className="w-px h-8 bg-gray-800" />

                      {/* Member 3: D.R. Nguema */}
                      <button 
                        onClick={() => setIsAboutOpen(true)}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 overflow-hidden group-hover:border-teal-400 transition-all shadow-lg group-hover:scale-105 duration-300">
                          <img 
                            src="./images/dr-nguema.jpg" 
                            alt="Legal Affairs" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black uppercase tracking-tight text-white group-hover:text-teal-400 transition-colors leading-none">D.R. NGUEMA</span>
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1 group-hover:text-teal-400/50">Legal Affairs</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAdminLogin}
                    className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 hover:text-teal-400 transition-all flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Acceso Admin
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">Contacto Directo</p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                        <span className="text-sm">🇪🇸</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">España</p>
                        <p className="text-sm font-bold">+34 641 992 110</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                        <span className="text-sm">🇨🇲</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Camerún</p>
                        <p className="text-sm font-bold">+237 658 497 349</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                        <span className="text-sm">🇬🇶</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Guinea Ecuatorial</p>
                        <p className="text-sm font-bold">+240 222 667 763</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">Servicios Logísticos</p>
                  <ul className="space-y-3 text-sm font-medium text-gray-400">
                    <li><a href="/tarifas" className="hover:text-white transition-colors">Calculadora de Tarifas</a></li>
                    <li><a href="/calendario" className="hover:text-white transition-colors">Calendario Mensual</a></li>
                    <li><a href="/rastreo" className="hover:text-white transition-colors">Rastreo en Tiempo Real</a></li>
                    <li><a href="/servicios" className="hover:text-white transition-colors">Asesor de Servicios</a></li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">Bodipo S.A.</p>
                  <ul className="space-y-3 text-sm font-medium text-gray-400">
                    <li>Alcalá de Henares, Madrid 🇪🇸</li>
                    <li>Universidad Católica, Yaoundé 🇨🇲</li>
                    <li>Malabo & Bata, G.E. 🇬🇶</li>
                  </ul>
                  <div className="pt-4">
                    <p className="text-[10px] font-black text-teal-500/50 uppercase tracking-widest">© 2026 BODIPOBUSINESS S.A.</p>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            products={products}
            setProducts={setProducts}
            config={config}
            setConfig={setConfig}
          />
          <AboutTeamPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onSuccess={handleAdminAuthSuccess}
          />
          <AIChat config={config} />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
