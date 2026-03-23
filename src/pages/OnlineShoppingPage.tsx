import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const OnlineShoppingPage: React.FC = () => {
  const { t, appConfig } = useSettings();
  const { user } = useAuth();

  const defaultStores = [
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', url: 'https://amazon.es' },
    { name: 'Zara', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1280px-Zara_Logo.svg.png', url: 'https://zara.com' },
    { name: 'AliExpress', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Aliexpress_logo.svg', url: 'https://aliexpress.com' },
    { name: 'Shein', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Shein_logo.svg/2560px-Shein_logo.svg.png', url: 'https://shein.com' },
    { name: 'Temu', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Temu_logo.svg/2560px-Temu_logo.svg.png', url: 'https://temu.com' },
    { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', url: 'https://nike.com' },
    { name: 'IKEA', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg', url: 'https://ikea.com' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', url: 'https://apple.com' },
    { name: 'H&M', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/2560px-H%26M-Logo.svg.png', url: 'https://hm.com' },
    { name: 'Bershka', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bershka_logo.svg/2560px-Bershka_logo.svg.png', url: 'https://bershka.com' },
    { name: 'Pull&Bear', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Pull_and_bear_logo.svg/2560px-Pull_and_bear_logo.svg.png', url: 'https://pullandbear.com' },
    { name: 'Stradivarius', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Stradivarius_logo.svg/2560px-Stradivarius_logo.svg.png', url: 'https://stradivarius.com' },
    { name: 'Mango', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Mango_logo.svg/2560px-Mango_logo.svg.png', url: 'https://mango.com' },
    { name: 'Decathlon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Decathlon_logo.svg/2560px-Decathlon_logo.svg.png', url: 'https://decathlon.com' },
    { name: 'MediaMarkt', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/MediaMarkt_logo.svg/2560px-MediaMarkt_logo.svg.png', url: 'https://mediamarkt.es' },
    { name: 'Sephora', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sephora_logo.svg/2560px-Sephora_logo.svg.png', url: 'https://sephora.es' },
    { name: 'Massimo Dutti', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Massimo_Dutti_logo.svg/2560px-Massimo_Dutti_logo.svg.png', url: 'https://massimodutti.com' },
    { name: 'El Corte Inglés', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Logo_El_Corte_Ingle%CC%81s.svg/2560px-Logo_El_Corte_Ingle%CC%81s.svg.png', url: 'https://elcorteingles.es' },
    { name: 'Booking', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png', url: 'https://booking.com' },
    { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Belo.svg/2560px-Airbnb_Logo_Belo.svg.png', url: 'https://airbnb.com' },
    { name: 'Ebay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png', url: 'https://ebay.com' },
    { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png', url: 'https://adidas.es' },
    { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Puma_complete_logo.svg/2560px-Puma_complete_logo.svg.png', url: 'https://puma.com' },
    { name: 'Asos', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Asos_logo.svg/2560px-Asos_logo.svg.png', url: 'https://asos.com' },
    { name: 'Zalando', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Zalando_logo.svg/2560px-Zalando_logo.svg.png', url: 'https://zalando.es' },
    { name: 'Pandora', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Pandora_logo.svg/2560px-Pandora_logo.svg.png', url: 'https://pandora.net' },
    { name: 'Nespresso', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Nespresso_logo.svg/2560px-Nespresso_logo.svg.png', url: 'https://nespresso.com' },
    { name: 'Fnac', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Fnac_Logo.svg/2560px-Fnac_Logo.svg.png', url: 'https://fnac.es' },
    { name: 'Lego', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png', url: 'https://lego.com' },
    { name: 'Disney Store', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Disney_Store_logo.svg/2560px-Disney_Store_logo.svg.png', url: 'https://disneystore.es' },
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
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            Servicio de Compras
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-teal-900 dark:text-white tracking-tighter uppercase italic leading-none mb-6"
          >
            {t('nav.online_shopping')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Compra en tus tiendas favoritas de todo el mundo y nosotros nos encargamos de que tus paquetes lleguen a tu puerta en Guinea Ecuatorial.
          </motion.p>
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
              className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group hover:border-teal-500 transition-all duration-300 relative overflow-hidden h-32 md:h-40"
            >
              <img
                src={store.logo}
                alt={store.name}
                className="h-10 md:h-12 w-auto object-contain transition-all"
              />
              {(clickCounts[store.name] || 0) > 0 && (
                <div className="absolute top-4 right-6 bg-teal-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Frecuente</div>
              )}
            </motion.a>
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: stores.length * 0.05 }}
            className="bg-teal-600 p-8 rounded-[2.5rem] shadow-xl shadow-teal-500/20 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group cursor-pointer h-32 md:h-40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <span className="text-3xl mb-2">➕</span>
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
      {user?.virtualCard?.active && (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isCardVisible && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="w-80 bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-white/10 text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex justify-between items-center mb-6">
                  <img src="/images/virtual-card.png" className="w-12 h-12 object-contain rounded-lg" alt="Card" />
                  <div className="text-right">
                    <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Saldo</p>
                    <p className="text-sm font-black tracking-tight">{(user.virtualCard.balance || 0).toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="space-y-4 font-mono tracking-widest">
                  <div>
                    <p className="text-[8px] opacity-40 uppercase mb-1">Número de Tarjeta</p>
                    <p className="text-xs font-black flex justify-between items-center">
                      {user.virtualCard.number || '4918 5004 2135 3238'}
                      <button onClick={() => navigator.clipboard.writeText(user.virtualCard?.number || '')} className="text-teal-400 text-[10px] hover:scale-110 transition-transform">📋</button>
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[8px] opacity-40 uppercase mb-1">EXP</p>
                      <p className="text-[10px] font-black">{user.virtualCard.expiry || '04/2029'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-40 uppercase mb-1">CVV</p>
                      <p className="text-[10px] font-black">{user.virtualCard.cvv || '043'}</p>
                    </div>
                  </div>
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
      )}
    </div>
  );
};

export default OnlineShoppingPage;
