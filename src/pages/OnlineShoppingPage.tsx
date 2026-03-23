import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const OnlineShoppingPage: React.FC = () => {
  const { t, appConfig } = useSettings();
  const { user } = useAuth();
  const eurRate = 655.957;

  const defaultStores = [
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', url: 'https://amazon.es' },
    { name: 'Zara', logo: 'https://static.cdnlogo.com/logos/z/41/zara.svg', url: 'https://zara.com' },
    { name: 'AliExpress', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Aliexpress_logo.svg', url: 'https://aliexpress.com' },
    { name: 'Shein', logo: 'https://logos-world.net/wp-content/uploads/2022/11/Shein-Logo.png', url: 'https://shein.com' },
    { name: 'Temu', logo: 'https://logo-pk.com/logos/temu-logo.png', url: 'https://temu.com' },
    { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Logo_nike_black.png', url: 'https://nike.com' },
    { name: 'IKEA', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg', url: 'https://ikea.com' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', url: 'https://apple.com' },
    { name: 'H&M', logo: 'https://static.cdnlogo.com/logos/h/63/h-m.svg', url: 'https://hm.com' },
    { name: 'Bershka', logo: 'https://static.cdnlogo.com/logos/b/70/bershka.svg', url: 'https://bershka.com' },
    { name: 'Pull&Bear', logo: 'https://static.cdnlogo.com/logos/p/44/pull-bear.svg', url: 'https://pullandbear.com' },
    { name: 'Stradivarius', logo: 'https://static.cdnlogo.com/logos/s/22/stradivarius.svg', url: 'https://stradivarius.com' },
    { name: 'Mango', logo: 'https://static.cdnlogo.com/logos/m/8/mango.svg', url: 'https://mango.com' },
    { name: 'Decathlon', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Decathlon_logo.svg', url: 'https://decathlon.com' },
    { name: 'MediaMarkt', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/MediaMarkt_logo.svg', url: 'https://mediamarkt.es' },
    { name: 'Sephora', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Sephora_logo.svg', url: 'https://sephora.es' },
    { name: 'Massimo Dutti', logo: 'https://static.cdnlogo.com/logos/m/92/massimo-dutti.svg', url: 'https://massimodutti.com' },
    { name: 'El Corte Inglés', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Logo_El_Corte_Ingle%CC%81s.svg', url: 'https://elcorteingles.es' },
    { name: 'Booking', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg', url: 'https://booking.com' },
    { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Belo.svg', url: 'https://airbnb.com' },
    { name: 'Ebay', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg', url: 'https://ebay.com' },
    { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', url: 'https://adidas.es' },
    { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_complete_logo.svg', url: 'https://puma.com' },
    { name: 'Asos', logo: 'https://static.cdnlogo.com/logos/a/82/asos.svg', url: 'https://asos.com' },
    { name: 'Zalando', logo: 'https://static.cdnlogo.com/logos/z/4/zalando.svg', url: 'https://zalando.es' },
    { name: 'Pandora', logo: 'https://static.cdnlogo.com/logos/p/62/pandora.svg', url: 'https://pandora.net' },
    { name: 'Nespresso', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Nespresso_logo.svg', url: 'https://nespresso.com' },
    { name: 'Fnac', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Fnac_Logo.svg', url: 'https://fnac.es' },
    { name: 'Lego', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg', url: 'https://lego.com' },
    { name: 'Disney Store', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Disney_Store_logo.svg', url: 'https://disneystore.es' },
  ];

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
    const all = appConfig?.content?.onlineStores && appConfig.content.onlineStores.length > 0 
      ? appConfig.content.onlineStores 
      : defaultStores;
    
    return [...all].sort((a, b) => (clickCounts[b.name] || 0) - (clickCounts[a.name] || 0));
  }, [appConfig, clickCounts]);

  const [isCardVisible, setIsCardVisible] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 relative">
      <div className="max-w-7xl mx-auto px-4">
        <header className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 text-center lg:text-left">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              Servicio de Compras
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black text-teal-900 dark:text-white tracking-tighter uppercase italic leading-[0.9] mb-6"
            >
              {t('nav.online_shopping')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 max-w-xl font-medium"
            >
              Compra en tus tiendas favoritas de todo el mundo y nosotros nos encargamos de que tus paquetes lleguen a tu puerta en Guinea Ecuatorial.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            className="relative group shrink-0"
          >
            <div className="absolute -inset-4 bg-teal-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
            <div className="w-72 md:w-80 bg-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 text-white relative overflow-hidden">
              {!user?.virtualCard?.active && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-6 text-center">
                  <div className="px-4 py-2 bg-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Activar para ver datos</div>
                </div>
              )}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex justify-between items-center mb-6">
                <img src="/images/virtual-card.png" className="w-10 h-10 object-contain rounded-lg" alt="Card" />
                <div className={`text-right ${!user?.virtualCard?.active ? 'blur-[15px] opacity-20' : ''}`}>
                  <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest leading-none mb-1">Tu Saldo</p>
                  <p className="text-lg font-black tracking-tight">{(user?.virtualCard?.balance || 0).toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span></p>
                  <p className="text-[11px] font-black text-teal-500 tracking-widest mt-0.5">≈ {((user?.virtualCard?.balance || 0) / eurRate).toFixed(2)} €</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                 <p className={`text-[10px] font-mono tracking-widest opacity-60 ${!user?.virtualCard?.active ? 'blur-[15px] select-none' : ''}`}>
                    **** **** **** {user?.virtualCard?.number?.slice(-4) || '3238'}
                 </p>
                 <div className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${user?.virtualCard?.active ? 'bg-white/5 border-white/10 text-teal-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {user?.virtualCard?.active ? 'Card Active' : 'Inactive'}
                 </div>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              <div className="relative h-12 md:h-16 w-full flex items-center justify-center mb-2">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="max-h-full max-w-full object-contain transition-all group-hover:scale-110"
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-teal-600 transition-colors">{store.name}</p>
              {(clickCounts[store.name] || 0) > 0 && (
                <div className="absolute top-4 right-6 bg-teal-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Frecuente</div>
              )}
            </motion.a>
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: stores.length * 0.05 }}
            className="bg-teal-600 p-8 rounded-[2.5rem] shadow-xl shadow-teal-500/20 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group cursor-pointer h-32 md:h-44"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">➕</span>
            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Muchas más Tiendas</p>
          </motion.div>
        </div>

        <section className="mt-24 bg-white dark:bg-gray-800 rounded-[3rem] p-12 border border-black/[0.03] dark:border-white/[0.03] shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-teal-900 dark:text-white uppercase italic tracking-tighter mb-6 leading-none">
                ¿Cómo funciona nuestro servicio de compra?
              </h2>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Compra', desc: 'Realiza tu pedido en cualquier tienda de España u online.' },
                  { step: '02', title: 'Envía a Almacén', desc: 'Usa nuestra dirección de Madrid como destino de tus compras.' },
                  { step: '03', title: 'Nosotros lo llevamos', desc: 'En cuanto llegue, lo procesamos y lo enviamos a Guinea.' },
                  { step: '04', title: 'Recibe tu Paquete', desc: 'Te notificaremos para que lo recojas o te lo llevemos a casa.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-xl font-black text-teal-500/20">{item.step}</span>
                    <div>
                      <h4 className="font-black text-teal-900 dark:text-white uppercase text-sm tracking-tight">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-black text-[#00151a] dark:text-white uppercase italic mb-6">Nuestra Dirección en España</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre / Cliente</p>
                  <p className="font-bold text-sm text-[#00151a] dark:text-white">{user?.name || 'TU NOMBRE COMPLETO'} (BODIPO)</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dirección Línea 1</p>
                  <p className="font-bold text-sm text-[#00151a] dark:text-white">Calle de la Metalurgia, 14</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localidad / CP</p>
                  <p className="font-bold text-sm text-[#00151a] dark:text-white">Fuenlabrada, 28946 (Madrid)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Card Widget */}
      <div className="fixed bottom-8 right-28 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isCardVisible && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="w-80 bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-white/10 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              {/* Card Face */}
              <div className={`relative transition-all duration-500 ${!user?.virtualCard?.active ? 'opacity-30 grayscale select-none' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                  <img src="/images/virtual-card.png" className="w-12 h-12 object-contain rounded-lg" alt="Card" />
                  <div className={`text-right ${!user?.virtualCard?.active ? 'blur-[15px]' : ''}`}>
                    <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest leading-none mb-1">Virtual Card</p>
                    <p className="text-[10px] font-mono opacity-60">**** {user?.virtualCard?.number?.slice(-4) || '3238'}</p>
                  </div>
                </div>
                <div className="space-y-4 font-mono tracking-widest">
                  <div className={!user?.virtualCard?.active ? 'blur-[20px]' : ''}>
                    <p className="text-[8px] opacity-40 uppercase mb-1">Número</p>
                    <p className="text-xs font-black flex justify-between items-center">
                      {user?.virtualCard?.number || '4918 5004 2135 3238'}
                      {user?.virtualCard?.active && <button onClick={() => navigator.clipboard.writeText(user?.virtualCard?.number || '')} className="text-teal-400 text-[10px] hover:scale-110 transition-transform">📋</button>}
                    </p>
                  </div>
                  <div className={`flex justify-between ${!user?.virtualCard?.active ? 'blur-[20px]' : ''}`}>
                    <div>
                      <p className="text-[8px] opacity-40 uppercase mb-1">EXP</p>
                      <p className="text-[10px] font-black">{user?.virtualCard?.expiry || '04/2029'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-40 uppercase mb-1">CVV</p>
                      <p className="text-[10px] font-black">{user?.virtualCard?.cvv || '043'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section (Below the card) */}
              <div className="mt-8 pt-6 border-t border-white/5">
                {!user?.virtualCard?.active ? (
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Tarjeta Inactiva</p>
                    <button className="w-full px-6 py-4 bg-teal-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-teal-500 transition-all active:scale-95">Solicitar Activación</button>
                    <p className="text-[8px] font-bold text-gray-500 uppercase mt-4 leading-relaxed">Carga saldo para activar tu tarjeta y ver los datos completos.</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest mb-1">Saldo Disponible</p>
                      <p className="text-xl font-black tracking-tight">{(user?.virtualCard?.balance || 0).toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span></p>
                      <p className="text-[11px] font-black text-teal-500 tracking-widest mt-1">≈ {((user?.virtualCard?.balance || 0) / eurRate).toFixed(2)} €</p>
                    </div>
                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 text-xl font-black">✓</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCardVisible(!isCardVisible)}
          className="w-16 h-16 bg-teal-600 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all text-white relative group"
        >
          <span className="group-hover:rotate-12 transition-transform">💳</span>
          {!isCardVisible && (
            <span className="absolute -top-1 -right-1 bg-white text-teal-600 p-1 rounded-full text-[10px] font-black animate-bounce shadow-sm">!</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnlineShoppingPage;
