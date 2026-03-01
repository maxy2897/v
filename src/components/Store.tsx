import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { Product } from '../../types';

interface StoreProps {
  products: Product[];
}

const Store: React.FC<StoreProps> = ({ products }) => {
  const { t } = useSettings();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="tienda" className="py-16 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-50/20 -z-10 skew-x-12 transform translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-3 bg-teal-500/10 px-4 py-2 rounded-2xl mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-teal-800">{t('store.badge')}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-[#00151a] tracking-tighter leading-none mb-8">
              {t('store.title')} <br /><span className="text-[#007e85]">{t('store.title_highlight')}</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              {t('store.desc')}
            </p>
          </div>

        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 md:gap-x-4 md:gap-y-12"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="group flex flex-col group"
            >
              <div
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-zoom-in"
                onClick={() => setSelectedImage(product.image)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800";
                  }}
                />

                <div className="absolute top-2 left-2 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur px-2 py-1 shadow-sm flex flex-col items-start">
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-gray-900">
                      {product.tag}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 px-1 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{product.color}</p>
                  </div>
                  <div className="text-right shrink-0 relative top-[-1px]">
                    <span className="text-xs font-medium text-gray-900 block">{product.price}</span>
                  </div>
                </div>

                <div className="mt-1 mb-2">
                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest inline-block">{t('store.envio_incluido')} 0€</span>
                </div>

                <p className="text-[10px] text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-grow">
                  {product.description}
                </p>

                <div className="mt-auto">
                  <a
                    href={product.waLink}
                    target="_blank"
                    className="w-full flex items-center justify-center space-x-2 border border-gray-900 bg-transparent text-gray-900 px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.779-.877-2.053-.976-.275-.099-.475-.149-.675.15-.199.299-.773.973-.948 1.171-.175.199-.349.225-.651.075-.3-.15-1.266-.467-2.411-1.485-.892-.795-1.493-1.777-1.668-2.076-.175-.299-.019-.461.13-.61.135-.133.299-.349.449-.524.149-.175.199-.299.299-.498.1-.199.05-.374-.025-.524-.075-.15-.675-1.625-.925-2.224-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.299-1.05 1.023-1.05 2.495s1.075 2.893 1.225 3.093c.15.199 2.113 3.227 5.122 4.526.715.309 1.275.494 1.711.632.718.228 1.372.196 1.889.119.576-.085 1.779-.727 2.028-1.428.25-.7.25-1.298.175-1.428-.075-.13-.275-.209-.575-.359z" /></svg>
                    <span>{t('store.buy_wa')}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox / Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-[#00151a]/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
            title="Cerrar vista"
            aria-label="Cerrar vista"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={selectedImage}
            alt="Full size view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default Store;
