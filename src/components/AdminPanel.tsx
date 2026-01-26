
import React, { useState } from 'react';
import { Product, AppConfig } from '../../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, products, setProducts, config, setConfig }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'branding'>('products');
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    color: '',
    price: '',
    description: '',
    image: '',
    tag: 'NOVEDAD',
    slogan: '',
    waLink: 'https://wa.me/34641992110'
  });

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (target === 'product') {
          setNewProduct({ ...newProduct, image: base64String });
        } else {
          setConfig({ ...config, customLogoUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    setProducts([...products, { ...newProduct, id }]);
    setNewProduct({
      name: '',
      color: '',
      price: '',
      description: '',
      image: '',
      tag: 'NOVEDAD',
      slogan: '',
      waLink: 'https://wa.me/34641992110'
    });
    alert('Producto añadido con éxito');
  };

  const deleteProduct = (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#00151a]/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
        <div className="bg-[#00151a] p-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">Panel de Administración</h2>
            <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mt-1">Gestión de Contenido</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10'}`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'branding' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10'}`}
            >
              Marca / Logo
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors ml-4"
            title="Cerrar panel de administración"
            aria-label="Cerrar panel de administración"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'products' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section>
                <h3 className="text-lg font-black text-[#00151a] mb-6 uppercase tracking-widest border-b pb-2">Añadir Nuevo Producto</h3>
                <form onSubmit={addProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="Nombre del producto" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    <input required type="text" placeholder="Precio (Ej: 25.000 FCFA)" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                  </div>
                  <input required type="text" placeholder="Color / Variante" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full" value={newProduct.color} onChange={e => setNewProduct({ ...newProduct, color: e.target.value })} />
                  <textarea required placeholder="Descripción detallada" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full h-24 resize-none" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Tag (Ej: TOP VENTAS)" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full" value={newProduct.tag} onChange={e => setNewProduct({ ...newProduct, tag: e.target.value })} />
                    <input type="text" placeholder="Eslogan (Entre comillas)" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full" value={newProduct.slogan} onChange={e => setNewProduct({ ...newProduct, slogan: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Imagen del Producto</label>
                    <div className="flex items-center gap-4">
                      {newProduct.image && <img src={newProduct.image} className="w-16 h-16 object-cover rounded-xl border" alt="Vista previa del producto" />}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} className="text-xs font-bold" title="Subir imagen de producto" />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#00151a] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-500 transition-all shadow-xl">
                    Publicar Producto
                  </button>
                </form>
              </section>

              <section>
                <h3 className="text-lg font-black text-[#00151a] mb-6 uppercase tracking-widest border-b pb-2">Productos Actuales</h3>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                      <div className="flex items-center gap-4">
                        <img src={product.image} className="w-12 h-12 object-cover rounded-lg" alt={product.name} />
                        <div>
                          <p className="text-sm font-black text-[#00151a] leading-none">{product.name}</p>
                          <p className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-widest">{product.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title={`Eliminar ${product.name}`}
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-center text-gray-400 font-bold py-10">No hay productos en la tienda.</p>}
                </div>
              </section>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-12">
              <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xl font-black text-[#00151a] mb-8 uppercase tracking-widest text-center">Configuración de Marca</h3>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Texto del Logo</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 text-xl font-black tracking-tighter"
                      value={config.logoText}
                      onChange={e => setConfig({ ...config, logoText: e.target.value })}
                      title="Editar texto del logo"
                      placeholder="Texto del logo"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Imagen de Logo (Sustituye al texto)</label>
                    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl border border-dashed border-gray-200">
                      {config.customLogoUrl && (
                        <div className="relative group">
                          <img src={config.customLogoUrl} className="h-24 object-contain" alt="Logo corporativo" />
                          <button
                            onClick={() => setConfig({ ...config, customLogoUrl: undefined })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar logo"
                            aria-label="Eliminar logo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="text-xs font-bold" title="Subir archivo de logo" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-xs font-bold text-teal-900 leading-snug">
                  Los cambios realizados en la marca se reflejan instantáneamente en toda la plataforma. Usa imágenes con fondo transparente para un mejor resultado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
