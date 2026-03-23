import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'framer-motion';

const OnlineShoppingPage: React.FC = () => {
  const { t } = useSettings();

  const stores = [
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', url: 'https://amazon.es' },
    { name: 'Zara', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg', url: 'https://zara.com' },
    { name: 'AliExpress', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/AliExpress_logo.svg', url: 'https://aliexpress.com' },
    { name: 'Shein', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Shein_logo.svg', url: 'https://shein.com' },
    { name: 'IKEA', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg', url: 'https://ikea.com' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', url: 'https://apple.com' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group hover:border-teal-500 transition-all duration-300"
            >
              <img
                src={store.logo}
                alt={store.name}
                className="h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100"
              />
            </motion.a>
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: stores.length * 0.05 }}
            className="bg-teal-600 p-8 rounded-[2.5rem] shadow-xl shadow-teal-500/20 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group"
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
                      <h4 className="font-black text-teal-900 dark:text-white uppercase text-xs tracking-widest mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center text-4xl mb-6">📦</div>
               <h3 className="text-xl font-black text-teal-900 dark:text-white uppercase tracking-widest mb-4">Nuestra Dirección en España</h3>
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full text-left border border-gray-200 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Destinatario</p>
                  <p className="text-sm font-black text-teal-600 mb-4">[Tu Nombre] - Bodipo Business</p>
                  
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dirección</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white mb-4 italic">C/ Ferrocarril 33, Planta 2, Puerta 1</p>
                  
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Ciudad / CP / Provincia</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white">Alcalá de Henares, 28801, Madrid</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OnlineShoppingPage;
