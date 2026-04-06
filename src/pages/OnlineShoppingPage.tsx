import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import VirtualCard from '../components/VirtualCard';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const StoreLogoImage = ({ src, domain, name, googleLogoFn, initialsLogoFn }: { src: string, domain: string, name: string, googleLogoFn: (domain: string) => string, initialsLogoFn: (name: string) => string }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [errorStep, setErrorStep] = React.useState(0);

  return (
    <div className="relative h-12 md:h-16 w-full flex items-center justify-center mb-2">
      <img
        src={currentSrc}
        alt={name}
        className="max-h-full max-w-full object-contain transition-all group-hover:scale-110"
        onError={() => {
          if (errorStep === 0) {
            setCurrentSrc(googleLogoFn(domain));
            setErrorStep(1);
          } else if (errorStep === 1) {
            setCurrentSrc(initialsLogoFn(name));
            setErrorStep(2);
          }
        }}
      />
    </div>
  );
};

const OnlineShoppingPage: React.FC = () => {
  const { t, appConfig } = useSettings();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const eurRate = appConfig?.rates?.exchange?.eur_xaf || 655.957;
  const [destination, setDestination] = React.useState('Malabo');
  const [loading, setLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefreshUser = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (e) {
      console.error('Error al refrescar:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const defaultStores = [
    { name: 'Amazon', domain: 'amazon.es', url: 'https://amazon.es' },
    { name: 'Zara', domain: 'zara.com', url: 'https://zara.com' },
    { name: 'AliExpress', domain: 'aliexpress.com', url: 'https://aliexpress.com' },
    { name: 'Shein', domain: 'shein.com', url: 'https://shein.com' },
    { name: 'Temu', domain: 'temu.com', url: 'https://temu.com' },
    { name: 'Nike', domain: 'nike.com', url: 'https://nike.com' },
    { name: 'IKEA', domain: 'ikea.com', url: 'https://ikea.com' },
    { name: 'Apple', domain: 'apple.com', url: 'https://apple.com' },
    { name: 'H&M', domain: 'hm.com', url: 'https://hm.com' },
    { name: 'Bershka', domain: 'bershka.com', url: 'https://bershka.com' },
    { name: 'Pull&Bear', domain: 'pullandbear.com', url: 'https://pullandbear.com' },
    { name: 'Stradivarius', domain: 'stradivarius.com', url: 'https://stradivarius.com' },
    { name: 'Mango', domain: 'mango.com', url: 'https://mango.com' },
    { name: 'Decathlon', domain: 'decathlon.es', url: 'https://decathlon.es' },
    { name: 'MediaMarkt', domain: 'mediamarkt.es', url: 'https://mediamarkt.es' },
    { name: 'Sephora', domain: 'sephora.es', url: 'https://sephora.es' },
    { name: 'Massimo Dutti', domain: 'massimodutti.com', url: 'https://massimodutti.com' },
    { name: 'El Corte Inglés', domain: 'elcorteingles.es', url: 'https://elcorteingles.es' },
    { name: 'Booking', domain: 'booking.com', url: 'https://booking.com' },
    { name: 'Airbnb', domain: 'airbnb.com', url: 'https://airbnb.com' },
    { name: 'Ebay', domain: 'ebay.es', url: 'https://ebay.es' },
    { name: 'Adidas', domain: 'adidas.es', url: 'https://adidas.es' },
    { name: 'Puma', domain: 'puma.com', url: 'https://puma.com' },
    { name: 'Asos', domain: 'asos.com', url: 'https://asos.com' },
    { name: 'Zalando', domain: 'zalando.es', url: 'https://zalando.es' },
    { name: 'Pandora', domain: 'pandora.net', url: 'https://pandora.net' },
    { name: 'Nespresso', domain: 'nespresso.com', url: 'https://nespresso.com' },
    { name: 'Fnac', domain: 'fnac.es', url: 'https://fnac.es' },
    { name: 'Lego', domain: 'lego.com', url: 'https://lego.com' },
    { name: 'Disney Store', domain: 'disneystore.es', url: 'https://disneystore.es' },
    { name: 'Druni', domain: 'druni.es', url: 'https://druni.es' },
    { name: 'Wallapop', domain: 'wallapop.com', url: 'https://wallapop.com' },
  ];

  const getClearbitLogo = (domain: string) => `https://logo.clearbit.com/${domain}`;
  const getGoogleLogo = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  const getInitialsLogo = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&bold=true&size=128&font-size=0.4`;

  const directLogos: Record<string, string> = {
    'amazon.es': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'zara.com': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg',
    'aliexpress.com': 'https://www.google.com/s2/favicons?domain=aliexpress.com&sz=128',
    'shein.com': 'https://www.google.com/s2/favicons?domain=shein.com&sz=128',
    'temu.com': 'https://www.google.com/s2/favicons?domain=temu.com&sz=128',
    'nike.com': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    'ikea.com': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg',
    'apple.com': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    'hm.com': 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
    'adidas.es': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    'puma.com': 'https://www.google.com/s2/favicons?domain=puma.com&sz=128',
    'mango.com': 'https://www.google.com/s2/favicons?domain=mango.com&sz=128',
    'decathlon.es': 'https://www.google.com/s2/favicons?domain=decathlon.es&sz=128',
    'mediamarkt.es': 'https://www.google.com/s2/favicons?domain=mediamarkt.es&sz=128',
    'sephora.es': 'https://www.google.com/s2/favicons?domain=sephora.es&sz=128',
    'elcorteingles.es': 'https://www.google.com/s2/favicons?domain=elcorteingles.es&sz=128',
    'booking.com': 'https://www.google.com/s2/favicons?domain=booking.com&sz=128',
    'airbnb.com': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg',
    'ebay.es': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    'asos.com': 'https://www.google.com/s2/favicons?domain=asos.com&sz=128',
    'zalando.es': 'https://www.google.com/s2/favicons?domain=zalando.es&sz=128',
    'fnac.es': 'https://www.google.com/s2/favicons?domain=fnac.es&sz=128',
    'lego.com': 'https://www.google.com/s2/favicons?domain=lego.com&sz=128',
    'nespresso.com': 'https://www.google.com/s2/favicons?domain=nespresso.com&sz=128',
    'pandora.net': 'https://www.google.com/s2/favicons?domain=pandora.net&sz=128',
    'massimodutti.com': 'https://www.google.com/s2/favicons?domain=massimodutti.com&sz=128',
    'bershka.com': 'https://www.google.com/s2/favicons?domain=bershka.com&sz=128',
    'pullandbear.com': 'https://www.google.com/s2/favicons?domain=pullandbear.com&sz=128',
    'stradivarius.com': 'https://www.google.com/s2/favicons?domain=stradivarius.com&sz=128',
    'disneystore.es': 'https://www.google.com/s2/favicons?domain=disneystore.es&sz=128',
    'wallapop.com': 'https://www.google.com/s2/favicons?domain=wallapop.com&sz=128',
    'druni.es': 'https://www.google.com/s2/favicons?domain=druni.es&sz=128',
  };

  const getStoreLogo = (domain: string, customLogo?: string) => {
    if (customLogo) return customLogo;
    return directLogos[domain] || getClearbitLogo(domain);
  };

  const [clickCounts, setClickCounts] = React.useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('shopping_frequencies');
    return saved ? JSON.parse(saved) : {};
  });

  const handleStoreClick = (name: string) => {
    const newCounts = { ...clickCounts, [name]: (clickCounts[name] || 0) + 1 };
    setClickCounts(newCounts);
    localStorage.setItem('shopping_frequencies', JSON.stringify(newCounts));
  };

  const stores = React.useMemo(() => {
    const rawStores = appConfig?.content?.onlineStores && appConfig.content.onlineStores.length > 0 
      ? appConfig.content.onlineStores 
      : defaultStores;
    
    const normalized = rawStores.map((s: any) => {
      let domain = s.domain;
      if (!domain && s.url) {
        try {
          domain = new URL(s.url).hostname.replace('www.', '');
        } catch (e) {
          domain = s.name.toLowerCase().replace(/\s/g, '') + '.com';
        }
      }
      return { ...s, domain: domain || s.name.toLowerCase().replace(/\s/g, '') + '.com' };
    });

    return normalized.sort((a, b) => (clickCounts[b.name] || 0) - (clickCounts[a.name] || 0));
  }, [appConfig, clickCounts]);

  const [isRechargeModalOpen, setIsRechargeModalOpen] = React.useState(false);
  const [rechargeAmount, setRechargeAmount] = React.useState('');
  const [rechargeCurrency, setRechargeCurrency] = React.useState<'CFA' | 'EUR'>('CFA');
  const [screenshot, setScreenshot] = React.useState<File | null>(null);

  const [setIsRechargeModalOpen_alias, setIsRechargeModalOpen_fn] = [setIsRechargeModalOpen, setIsRechargeModalOpen]; // Minimal workaround for unused alias

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', rechargeAmount);
      if (screenshot) formData.append('proofImage', screenshot);
      formData.append('type', 'deposit');
      formData.append('description', `Recarga Tarjeta Virtual - Tienda (${rechargeCurrency})`);
      formData.append('method', 'Transferencia');
      formData.append('category', 'Recarga Tarjeta');

      formData.append('sender', JSON.stringify({ 
          name: user?.name, 
          phone: user?.phone, 
          email: user?.email, 
          idDocument: user?.idNumber || 'N/A' 
      }));
      formData.append('beneficiary', JSON.stringify({ 
          name: 'BODIPO BUSINESS', 
          phone: 'SYSTEM', 
          email: 'admin@bodipobusiness.com' 
      }));
      
      formData.append('direction', rechargeCurrency === 'EUR' ? 'ES_GQ' : 'GQ_ES');
      formData.append('currency', rechargeCurrency);
      if (user?._id) formData.append('user', user._id);

      await api.createTransfer(formData);
      
      alert('¡Solicitud enviada con éxito! Activaremos tu saldo en cuanto validemos el comprobante.');
      setIsRechargeModalOpen(false);
      setRechargeAmount('');
      setScreenshot(null);
    } catch (error: any) {
      console.error('Error al solicitar recarga:', error);
      alert(error.message || 'Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] transition-colors bg-transparent pt-24 sm:pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('/images/bg/store-net-v2.png')] bg-cover bg-center bg-fixed blur-[3px] brightness-[1.2]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-20 mb-20">
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-100/50 text-teal-600 text-[9px] font-black uppercase tracking-[0.3em] mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Servicio de Compras Global
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-5xl md:text-[5.6rem] font-black tracking-tighter leading-[0.8] mb-4"
            >
              <span className="inline-block text-[#00151a] uppercase italic">
                COMPRAS
              </span>
              <br />
              <span className="inline-block text-teal-600 italic uppercase">
                ONLINE
              </span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative lg:-mt-6 flex-1 w-full flex flex-col items-center gap-8"
          >
            <div className="absolute -inset-20 bg-teal-500/5 rounded-full blur-[100px] animate-pulse"></div>
            
            <div className="w-full max-w-[500px] relative transition-all duration-500">
               <VirtualCard 
                 number={user?.virtualCard?.number}
                 expiry={user?.virtualCard?.expiry}
                 cvv={user?.virtualCard?.cvv}
                 active={user?.virtualCard?.active}
                 holderName={user?.name?.toUpperCase()}
                 onClick={handleRefreshUser}
                 isRefreshing={isRefreshing}
               />

               {!user?.virtualCard?.active && (
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-[12px] z-30 flex flex-col items-center justify-center p-4 sm:p-8 text-center rounded-[1.2rem] sm:rounded-[2.5rem] border border-white/5">
                   <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-4 border border-white/20 shadow-2xl">🔒</div>
                   <button 
                     onClick={() => {
                       if (!user) {
                         if (window.confirm('Para activar tu tarjeta virtual, primero debes iniciar sesión o registrarte. ¿Quieres ir a la página de acceso ahora?')) { navigate('/acceso'); }
                         return;
                       }
                       setIsRechargeModalOpen(true);
                     }}
                     className="px-4 py-3 sm:px-8 sm:py-4 bg-teal-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(20,184,166,0.4)] hover:bg-teal-400 transition-all hover:scale-105 active:scale-95"
                   >
                     Activar Tarjeta
                   </button>
                   <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-white/50 mt-2 sm:mt-4 leading-tight">Mínimo 5.000 FCFA para activar</p>
                 </div>
               )}
            </div>

            <div className="w-full max-w-[500px] flex justify-between items-center px-8 py-6 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5">
                <div className={`text-left ${!user?.virtualCard?.active ? 'blur-[8px] opacity-20' : ''}`}>
                  <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.3em] mb-1">Tu Saldo Disponible</p>
                  <p className="text-3xl font-black tracking-tighter text-[#00151a]">{(user?.virtualCard?.balance || 0).toLocaleString()} <span className="text-teal-500 text-sm">FCFA</span></p>
                  <p className="text-xs font-black text-teal-600/60 tracking-wider">≈ {((user?.virtualCard?.balance || 0) / eurRate).toFixed(2)} <span className="text-[10px]">EUR</span></p>
                </div>
                <div className="flex flex-col items-end">
                   <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${user?.virtualCard?.active ? 'bg-teal-500 text-white border-teal-400' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                      {user?.virtualCard?.active ? 'Tarjeta Activa' : 'Solicitar'}
                   </div>
                </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 -mt-8">
          {stores.map((store, index) => (
            <motion.a
              key={store.name}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleStoreClick(store.name)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center group hover:border-teal-500 transition-all duration-300 relative overflow-hidden h-32 md:h-44"
            >
              <StoreLogoImage
                src={getStoreLogo(store.domain, store.logo)}
                domain={store.domain}
                name={store.name}
                googleLogoFn={getGoogleLogo}
                initialsLogoFn={getInitialsLogo}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-teal-600 transition-colors">{store.name}</p>
              {(clickCounts[store.name] || 0) >= 5 && (
                <div className="absolute top-4 right-6 bg-teal-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Frecuente</div>
              )}
            </motion.a>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isRechargeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1a1f]/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-gray-100 dark:border-white/5"
            >
              <button 
                onClick={() => setIsRechargeModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:scale-110 transition-transform"
              >✕</button>

              <h2 className="text-3xl font-black tracking-tighter text-[#00151a] dark:text-white mb-2 uppercase italic">Activar Tarjeta</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Recarga mínima 5.000 FCFA</p>

              <form onSubmit={handleRechargeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-teal-600 block px-2">Importe a recargar</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      min="5000"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="Ej: 5000"
                      className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-teal-500 transition-all pr-16"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                       <button 
                         type="button" 
                         onClick={() => setRechargeCurrency('CFA')}
                         className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all ${rechargeCurrency === 'CFA' ? 'bg-teal-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}
                       >CFA</button>
                       <button 
                         type="button" 
                         onClick={() => setRechargeCurrency('EUR')}
                         className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all ${rechargeCurrency === 'EUR' ? 'bg-teal-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}
                       >EUR</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-teal-600 block px-2">Comprobante de Pago</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl hover:border-teal-500 transition-colors cursor-pointer bg-gray-50 dark:bg-white/5">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-2xl mb-2">📸</span>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {screenshot ? screenshot.name : 'Subir Comprobante'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={loading || !rechargeAmount || !screenshot}
                    type="submit"
                    className="w-full py-4 bg-teal-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_15px_45px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all disabled:opacity-50 disabled:translate-y-0"
                  >
                    {loading ? 'Procesando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnlineShoppingPage;
