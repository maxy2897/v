import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const OnlineShoppingPage: React.FC = () => {
  const { t, appConfig } = useSettings();
  const { user } = useAuth();
  const eurRate = 655.957;

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
  ];

  const getLogo = (domain: string) => `https://unavatar.io/${domain}`;
  const getGoogleLogo = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

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
    
    // Normalizar para asegurar que todos tengan domain o logo
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
  const [screenshot, setScreenshot] = React.useState<File | null>(null);

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de envío
    alert(`Solicitud enviada:\nMonto: ${rechargeAmount} FCFA\nComprobante: ${screenshot?.name || 'No adjunto'}\n\nRevisaremos tu envío pronto.`);
    setIsRechargeModalOpen(false);
    setRechargeAmount('');
    setScreenshot(null);
  };

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
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[12px] z-30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl mb-3 border border-white/20">🔒</div>
                  <button 
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="px-5 py-2.5 bg-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-teal-500 transition-all hover:scale-105"
                  >
                    Activar Tarjeta
                  </button>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-3 leading-tight">Carga saldo para desbloquear</p>
                </div>
              )}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex justify-between items-center mb-6">
                <img src="/images/virtual-card.png" className="w-10 h-10 object-contain rounded-lg" alt="Card" />
                <div className={`text-right ${!user?.virtualCard?.active ? 'blur-[22px] opacity-10 select-none' : ''}`}>
                  <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest leading-none mb-1">Tu Saldo</p>
                  <p className="text-lg font-black tracking-tight">{(user?.virtualCard?.balance || 0).toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span></p>
                  <p className="text-[11px] font-black text-teal-500 tracking-widest mt-0.5">≈ {((user?.virtualCard?.balance || 0) / eurRate).toFixed(2)} €</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                 <p className={`text-[10px] font-mono tracking-widest opacity-60 ${!user?.virtualCard?.active ? 'blur-[22px] select-none opacity-5' : ''}`}>
                    **** **** **** {user?.virtualCard?.number?.slice(-4) || '3238'}
                 </p>
                 <div className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${user?.virtualCard?.active ? 'bg-white/5 border-white/10 text-teal-400' : 'bg-red-500/10 border-red-500/20 text-red-400 opacity-20'}`}>
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
                  src={store.logo || getLogo(store.domain)}
                  alt={store.name}
                  className="max-h-full max-w-full object-contain transition-all group-hover:scale-110"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src.includes('unavatar.io')) {
                      img.src = getGoogleLogo(store.domain);
                    } else if (img.src.includes('google.com')) {
                      img.src = `https://ui-avatars.com/api/?name=${store.name}&background=0D9488&color=fff&bold=true`;
                    }
                  }}
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

      {/* Recharge Modal */}
      <AnimatePresence>
        {isRechargeModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRechargeModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h3 className="text-2xl font-black text-teal-900 dark:text-white uppercase italic tracking-tighter mb-2">Solicitar Activación</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">Completa los datos de tu recarga</p>

              <form onSubmit={handleRechargeSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Monto a Recargar (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Ej: 50000"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 text-sm font-bold text-teal-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Comprobante de Pago</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      title="Subir comprobante de pago"
                      aria-label="Subir captura de pantalla del comprobante"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center group-hover:border-teal-500 transition-all">
                      <span className="text-2xl mb-2">📸</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {screenshot ? screenshot.name : 'Subir captura de pantalla'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-3 px-10 py-4 bg-teal-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-all"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnlineShoppingPage;
