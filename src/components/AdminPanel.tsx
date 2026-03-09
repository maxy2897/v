
import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, AppConfig, ShippingStatus } from '../../types';
import { AdminNotifications } from './AdminNotifications';
import { AdminUsers } from './AdminUsers';
import { createNotification } from '../services/notificationsApi';
import { createProduct as apiCreateProduct, deleteProduct as apiDeleteProduct, getProducts } from '../services/productsApi';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';

interface Shipment {
  _id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  description: string;
  weight: number;
  price: number;
  status: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  recipient: {
    name: string;
    phone: string;
  };
}

interface UserShipmentGroup {
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  shipments: Shipment[];
}

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, config, setConfig }) => {
  const { appConfig, updateConfig, language, t } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'user';

  // Define allowed tabs per role
  const getTabs = () => {
    const tabs = ['dashboard'];
    if (role === 'admin_local') {
      tabs.push('shipments', 'pos', 'notifications', 'pickup');
    } else if (role === 'admin_finance') {
      tabs.push('shipments', 'transactions', 'reports', 'notifications', 'pos');
    } else {
      tabs.push('products', 'branding', 'reports', 'config', 'content', 'operational', 'transactions', 'shipments', 'notifications', 'pickup', 'pos');
      if (['admin', 'admin_tech'].includes(role as string)) {
        tabs.push('users');
      }
    }
    return tabs;
  };

  const allowedTabs = getTabs();
  const [activeTab, setActiveTab] = useState(allowedTabs[0] as any);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] as any);
    }
  }, [role, allowedTabs, activeTab]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [shipmentGroups, setShipmentGroups] = useState<UserShipmentGroup[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserShipmentGroup | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedTxFolder, setSelectedTxFolder] = useState<string | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: { shipments: 0, users: 0, products: 0, transactions: 0 },
    recentActivity: [] as any[]
  });

  const [txSearch, setTxSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    color: '',
    description: '',
    tag: '',
    slogan: ''
  });

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'shipments') fetchShipments();
    if (activeTab === 'dashboard') fetchDashboardData();
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await fetch(`${BASE_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const txs = Array.isArray(data) ? data : (data.transactions || []);
        setTransactions(txs);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchShipments = async () => {
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      const res = await fetch(`${BASE_URL}/api/shipments/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const shipments = Array.isArray(data) ? data : (data.shipments || []);
        setAllShipments(shipments);
        
        // Group by user
        const groups: Record<string, UserShipmentGroup> = {};
        shipments.forEach((ship: Shipment) => {
          if (!ship.user) return;
          if (!groups[ship.user._id]) {
            groups[ship.user._id] = {
              userId: ship.user._id,
              user: ship.user,
              shipments: []
            };
          }
          groups[ship.user._id].shipments.push(ship);
        });
        setShipmentGroups(Object.values(groups));
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = user?.token || localStorage.getItem('token') || '';
      
      const [resUsers, resProducts, resShipments, resTransactions] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/products`),
        fetch(`${BASE_URL}/api/shipments/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [dataUsers, dataProducts, dataShipments, dataTransactions] = await Promise.all([
        resUsers.json(), resProducts.json(), resShipments.json(), resTransactions.json()
      ]);

      const users = dataUsers.users || [];
      const productsList = Array.isArray(dataProducts) ? dataProducts : [];
      const shipments = Array.isArray(dataShipments) ? dataShipments : (dataShipments.shipments || []);
      const txs = Array.isArray(dataTransactions) ? dataTransactions : (dataTransactions.transactions || []);

      setDashboardData({
        stats: {
          shipments: shipments.length || 0,
          users: users.length || 0,
          products: productsList.length || 0,
          transactions: txs.length || 0
        },
        recentActivity: shipments.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo' | 'hero' | 'money') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dppvnotpx/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (type === 'product') setNewProduct({ ...newProduct, image: data.secure_url });
      else if (type === 'logo') setConfig({ ...config, customLogoUrl: data.secure_url });
      else if (type === 'hero') updateConfig?.({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, heroImage: data.secure_url } } } as any);
      else if (type === 'money') updateConfig?.({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, moneyTransferImage: data.secure_url } } } as any);
      
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const productToCreate = {
        ...newProduct,
        id: Date.now().toString(),
        waLink: `https://wa.me/34643521042?text=Hola,%20estoy%20interesado%20en%20el%20producto%20${encodeURIComponent(newProduct.name)}`,
        price: newProduct.price.includes('FCFA') ? newProduct.price : `${newProduct.price} FCFA`
      };
      const created = await apiCreateProduct(productToCreate as any);
      setProducts([...products, created]);
      setNewProduct({ name: '', price: '', image: '', color: '', description: '', tag: '', slogan: '' });
      alert('Producto creado con éxito');
    } catch (error) {
      alert('Error al crear producto');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      setIsDeletingId(id);
      await apiDeleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert('Error al eliminar producto');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pendiente')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('transito') || s.includes('en camino')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('llegada') || s.includes('destino')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (s.includes('entregado')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getAssignedFolder = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleString('es-ES', { month: 'long' })} ${d.getFullYear()}`;
  };

  const exportToExcel = () => {
      alert('Función de exportación PDF/Excel se activará en la próxima versión.');
  };

  const renderDashboard = () => {
    const stats = [
      { label: 'Envíos del Mes', value: dashboardData.stats.shipments, icon: '📦', color: 'bg-teal-50 text-teal-600', trend: '+12%' },
      { label: 'Usuarios Activos', value: dashboardData.stats.users, icon: '👥', color: 'bg-indigo-50 text-indigo-600', trend: '+5%' },
      { label: 'Productos Tienda', value: dashboardData.stats.products, icon: '🛍️', color: 'bg-emerald-50 text-emerald-600', trend: '+8%' },
      { label: 'Transacciones', value: dashboardData.stats.transactions, icon: '💳', color: 'bg-amber-50 text-amber-600', trend: '+2%' },
    ];

    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-green-50 text-green-600 rounded-full tracking-widest">{stat.trend}</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 border-l-2 border-teal-500 pl-3 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Últimos Envíos</h4>
              <button onClick={() => setActiveTab('shipments')} className="text-[10px] font-black text-teal-600 hover:underline uppercase tracking-widest flex items-center gap-2">Ver todos <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((ship: Shipment) => (
                <div key={ship._id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">📦</div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{ship.trackingNumber}</p>
                      <p className="text-[10px] font-bold text-gray-400">{ship.origin} → {ship.destination}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(ship.status)}`}>
                    {ship.status}
                  </span>
                </div>
              ))}
              {dashboardData.recentActivity.length === 0 && <p className="text-center py-10 text-gray-400 font-bold italic">No hay actividad reciente</p>}
            </div>
          </div>

          <div className="bg-teal-600 p-8 rounded-[3rem] shadow-xl shadow-teal-500/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V9zm0 6a1 1 0 112 0 1 1 0 01-2 0z"/></svg>
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl mb-6">🔔</div>
              <h4 className="text-3xl font-black tracking-tighter uppercase leading-none mb-3">0</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-8 border-l-2 border-white/30 pl-3">Notificaciones Pendientes</p>
              <button 
                onClick={() => setActiveTab('notifications')}
                className="mt-auto w-full py-4 bg-white text-teal-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg"
              >
                Gestionar Alertas
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setActiveTab('pos')} title="Registrar nuevo envío" className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/5 transition-all flex flex-col items-center gap-3 group">
            <span className="text-2xl group-hover:scale-125 transition-transform">➕</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Nuevo Envío</span>
          </button>
          <button onClick={() => setActiveTab('products')} title="Gestionar catálogo" className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col items-center gap-3 group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🛍️</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Subir Producto</span>
          </button>
          <button onClick={() => setActiveTab('transactions')} title="Ir a contabilidad" className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all flex flex-col items-center gap-3 group">
            <span className="text-2xl group-hover:scale-125 transition-transform">💳</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Contabilidad</span>
          </button>
          <button onClick={() => setActiveTab('notifications')} title="Enviar notificación" className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col items-center gap-3 group">
            <span className="text-2xl group-hover:scale-125 transition-transform">📢</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Anunciar</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden italic-none">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#00151a] text-white flex flex-col justify-between p-8 shrink-0 overflow-y-auto h-screen sticky top-0 border-r border-teal-900/20">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="mb-12 flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-teal-500/30">
              {config.customLogoUrl ? <img src={config.customLogoUrl} className="h-6 object-contain invert" alt="Logo" /> : config.logoText[0]}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter leading-none italic">Panel Admin</h2>
              <p className="text-teal-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Bodipo Business</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-2 hidden md:block">Principal</p>
             <button onClick={() => setActiveTab('dashboard')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'dashboard' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard
             </button>

             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-8 hidden md:block">Logística</p>
             {allowedTabs.includes('shipments') && (
               <button onClick={() => setActiveTab('shipments')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'shipments' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                 Envíos
               </button>
             )}
             {allowedTabs.includes('pos') && (
               <button onClick={() => setActiveTab('pos')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'pos' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                 Registro POS
               </button>
             )}

             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-8 hidden md:block">Gestión Comercial</p>
             {allowedTabs.includes('products') && (
               <button onClick={() => setActiveTab('products')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'products' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                 Productos
               </button>
             )}
             {allowedTabs.includes('transactions') && (
               <button onClick={() => setActiveTab('transactions')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'transactions' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 Contabilidad
               </button>
             )}
             {allowedTabs.includes('users') && (
               <button onClick={() => setActiveTab('users')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'users' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 Usuarios
               </button>
             )}

             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-8 hidden md:block">Configuración</p>
             {allowedTabs.includes('branding') && (
               <button onClick={() => setActiveTab('branding')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'branding' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 Marca
               </button>
             )}
             {allowedTabs.includes('content') && (
               <button onClick={() => setActiveTab('content')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'content' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 Web
               </button>
             )}
             {allowedTabs.includes('config') && (
               <button onClick={() => setActiveTab('config')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'config' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Sistema
               </button>
             )}
          </nav>
        </div>

        <button onClick={() => navigate('/')} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors mt-8">
           <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           Cerrar Panel
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-8">
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-teal-600/50 uppercase tracking-widest">{activeTab}</p>
              <h2 className="text-2xl font-black text-teal-900 tracking-tighter italic uppercase leading-none mt-1">{activeTab === 'dashboard' ? 'Vista General' : activeTab}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-[11px] font-black text-teal-900 leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest mt-1 italic">{role}</p>
              </div>
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-teal-500/20 overflow-hidden border-2 border-white">
                {user?.profileImage ? (
                  <img src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`} className="w-full h-full object-cover" alt="Perfil" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'A'
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">Nuevo Producto</h3>
                  <form onSubmit={addProduct} className="space-y-4">
                     <input required type="text" placeholder="Nombre" className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                     <input required type="text" placeholder="Precio" className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                     <button type="submit" disabled={isUploading} className="w-full py-4 bg-[#00151a] text-white rounded-2xl font-black uppercase text-xs">Publicar</button>
                  </form>
               </section>
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shipmentGroups.map(group => (
                    <div key={group.userId} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-teal-200 transition-all">
                       <h4 className="font-black text-teal-900 border-b pb-4 mb-4">{group.user.name}</h4>
                       <p className="text-xs text-gray-500 mb-4">{group.shipments.length} Envíos registrados</p>
                       <button onClick={() => setSelectedUserGroup(group)} className="w-full py-3 bg-teal-50 text-teal-600 rounded-xl text-[10px] font-black uppercase">Ver Detalles</button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {Object.keys(transactions.reduce((acc, tx) => {
                  const label = getAssignedFolder(tx.createdAt);
                  acc[label] = true;
                  return acc;
               }, {} as any)).map(folder => (
                 <div key={folder} onClick={() => setSelectedTxFolder(folder)} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl cursor-pointer transition-all flex flex-col items-center gap-4 group">
                    <div className="text-4xl group-hover:scale-110 transition-transform">📁</div>
                    <span className="font-black text-teal-900 uppercase text-[10px] tracking-widest">{folder}</span>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'notifications' && <AdminNotifications />}
          
          {activeTab === 'branding' && (
             <div className="max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="font-black text-teal-900 uppercase text-xs mb-8">Configuración de Marca</h3>
                <div className="space-y-6">
                   <input type="text" title="Texto del Logo" placeholder="Texto del Logo" className="w-full p-4 bg-gray-50 rounded-2xl font-black" value={config.logoText} onChange={e => setConfig({...config, logoText: e.target.value})} />
                   <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-4">
                      {config.customLogoUrl && <img src={config.customLogoUrl} className="h-12 object-contain" alt="Logo" />}
                      <input type="file" title="Subir Logo Personalizado" onChange={e => handleImageUpload(e, 'logo')} className="text-xs font-bold" />
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'pos' && (
            <div className="bg-white p-12 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
               <h3 className="text-2xl font-black text-teal-900 mb-4 uppercase">Terminal POS</h3>
               <p className="text-gray-400 mb-8 italic">Funcionalidad de registro de ventas físicas activa.</p>
               <button className="px-12 py-4 bg-orange-500 text-white rounded-3xl font-black uppercase text-xs shadow-xl shadow-orange-500/20">Abrir Terminal</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
