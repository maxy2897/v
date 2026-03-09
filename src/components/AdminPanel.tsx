
import React, { useState, useEffect, useRef } from 'react';
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
import { BASE_URL, updateShipmentStatus, createManifest, getManifest, updateManifestStatus } from '../services/api';

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
  console.log('Rendering AdminPanel for role:', role);

  // Define allowed tabs per role
  const getTabs = () => {
    const tabs = ['dashboard'];
    if (role === 'admin_local') {
      tabs.push('shipments', 'pos', 'notifications', 'pickup');
    } else if (role === 'admin_finance') {
      tabs.push('shipments', 'transactions', 'reports', 'notifications', 'pos');
    } else {
      tabs.push('products', 'branding', 'reports', 'config', 'content', 'operational', 'manifests', 'transactions', 'shipments', 'notifications', 'pickup', 'pos');
      if (['admin', 'admin_tech'].includes(role as string)) {
        tabs.push('users');
      }
    }
    return tabs;
  };

  const allowedTabs = getTabs();
  const [activeTab, setActiveTab] = useState(allowedTabs[0] as any);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] as any);
    }
    // Close sidebar on tab change on mobile
    setSidebarOpen(false);
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
  const [posData, setPosData] = useState({
    trackingNumber: '',
    senderName: '',
    recipientName: '',
    destination: '',
    weight: '',
    price: '',
    description: ''
  });

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
    if (activeTab === 'users' && (['admin', 'admin_tech'].includes(role as string))) {
       // Users tab logic handled in AdminUsers component
    }
  }, [activeTab, role]);

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedShipment, setScannedShipment] = useState<Shipment | null>(null);
  const [bulkScanList, setBulkScanList] = useState<Shipment[]>([]);
  const [qrMode, setQrMode] = useState<'single' | 'bulk'>('single');
  const [operationalInputMode, setOperationalInputMode] = useState<'qr' | 'manual'>('qr');
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Manifest / Bulto Colectivo state
  const [manifestTab, setManifestTab] = useState<'create' | 'scan'>('create');
  const [manifestDescription, setManifestDescription] = useState('');
  const [manifestDestFilter, setManifestDestFilter] = useState<'all' | 'Malabo' | 'Bata'>('all');
  const [selectedForManifest, setSelectedForManifest] = useState<string[]>([]);
  const [createdManifest, setCreatedManifest] = useState<any>(null);
  const [scannedManifest, setScannedManifest] = useState<any>(null);
  const [manifestScanInput, setManifestScanInput] = useState('');
  const [manifestStatusUpdate, setManifestStatusUpdate] = useState('Llegado a destino');
  const [isCreatingManifest, setIsCreatingManifest] = useState(false);

  const startScanner = async () => {
    // Only proceed if we are in the right tab and mode, and not already scanning
    const element = document.getElementById("reader");
    if (!element || scannerRef.current?.isScanning) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanResult(decodedText);
          if (qrMode === 'single') {
            handleQuickTrack(decodedText);
            stopScanner();
          } else {
            handleBulkTrack(decodedText);
          }
        },
        () => {}
      );
    } catch (err) {
      console.error("Scanner Start Error:", err);
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      const s = scannerRef.current;
      scannerRef.current = null; // Clear ref first to avoid re-entry
      try {
        if (s.isScanning) {
          await s.stop();
        }
      } catch (err) {
        console.error("Stop Scanner Error:", err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    if (activeTab === 'operational' && operationalInputMode === 'qr') {
      const timer = setTimeout(() => {
        if (mounted) startScanner();
      }, 800);
      return () => {
        mounted = false;
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    return () => { mounted = false; };
  }, [activeTab, operationalInputMode]);

  const handleQuickTrack = async (code: string) => {
     try {
        const res = await fetch(`${BASE_URL}/api/shipments/tracking/${code}`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
           const data = await res.json();
           setScannedShipment(data);
        } else {
           alert('Paquete no encontrado');
        }
     } catch (err) {
        console.error('QR Search Error:', err);
     }
  };
  const handleBulkTrack = async (code: string) => {
      try {
         const res = await fetch(`${BASE_URL}/api/shipments/tracking/${code}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
         });
         if (res.ok) {
            const data = await res.json();
            if (!bulkScanList.find(s => s._id === data._id)) {
               setBulkScanList(prev => [...prev, data]);
            }
         } else {
            alert('Paquete no encontrado');
         }
      } catch (err) {
         console.error('Bulk QR Error:', err);
      }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateShipmentStatus(id, newStatus);
      alert('Estado actualizado con éxito');
      if (scannedShipment?._id === id) {
        setScannedShipment(prev => prev ? { ...prev, status: newStatus } : null);
      }
      fetchShipments();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleCreateManifest = async () => {
    if (selectedForManifest.length === 0) { alert('Selecciona al menos un paquete'); return; }
    setIsCreatingManifest(true);
    try {
      const result = await createManifest(selectedForManifest, manifestDescription);
      setCreatedManifest(result);
      setSelectedForManifest([]);
      setManifestDescription('');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCreatingManifest(false);
    }
  };

  const handleLookupManifest = async (id: string) => {
    try {
      const result = await getManifest(id.trim().toUpperCase());
      setScannedManifest(result);
    } catch (err: any) {
      alert(`Bulto no encontrado: ${err.message}`);
    }
  };

  const handleManifestStatusUpdate = async () => {
    if (!scannedManifest) return;
    if (!window.confirm(`¿Actualizar todos los paquetes del bulto "${scannedManifest.manifestId}" a "${manifestStatusUpdate}"?`)) return;
    try {
      const result = await updateManifestStatus(scannedManifest.manifestId, manifestStatusUpdate);
      alert(`Éxito. ${result.message}`);
      setScannedManifest((prev: any) => prev ? { ...prev, status: manifestStatusUpdate } : null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const safeFetch = async (url: string, options: RequestInit = {}) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        console.warn(`ï¿½sï¿½ï¸ Request to ${url} failed with status ${res.status}`);
        return null;
      }
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error(`ï¿½O Non-JSON response from ${url}:`, text.slice(0, 100));
        return null;
      }
    } catch (e) {
      console.error(`ï¿½O Network error for ${url}:`, e);
      return null;
    }
  };

  const fetchTransactions = async () => {
    const token = user?.token || localStorage.getItem('token') || '';
    const data = await safeFetch(`${BASE_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (data) {
      const txs = Array.isArray(data) ? data : (data.transactions || []);
      setTransactions(txs);
    }
  };

  const fetchShipments = async () => {
    const token = user?.token || localStorage.getItem('token') || '';
    const data = await safeFetch(`${BASE_URL}/api/shipments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (data) {
      const shipments = Array.isArray(data) ? data : (data.shipments || []);
      setAllShipments(shipments);
      
      const groups: Record<string, UserShipmentGroup> = {};
      shipments.forEach((ship: Shipment) => {
        if (!ship.user?._id) return;
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
  };

  const fetchDashboardData = async () => {
    const token = user?.token || localStorage.getItem('token') || '';
    console.log('📦S Fetching dashboard data (v2)...');
    
    const [dataUsers, dataProducts, dataShipments, dataTransactions] = await Promise.all([
      safeFetch(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      safeFetch(`${BASE_URL}/api/products`),
      safeFetch(`${BASE_URL}/api/shipments`, { headers: { Authorization: `Bearer ${token}` } }),
      safeFetch(`${BASE_URL}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const users = dataUsers?.users || [];
    const productsList = Array.isArray(dataProducts) ? dataProducts : [];
    const shipments = Array.isArray(dataShipments) ? dataShipments : (dataShipments?.shipments || []);
    const txs = Array.isArray(dataTransactions) ? dataTransactions : (dataTransactions?.transactions || []);

    setDashboardData({
      stats: {
        shipments: shipments.length,
        users: users.length,
        products: productsList.length,
        transactions: txs.length
      },
      recentActivity: shipments.slice(0, 5)
    });
    console.log('ï¿½o. Dashboard data state updated');
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
      { label: 'Usuarios Activos', value: dashboardData.stats.users, icon: '👤', color: 'bg-indigo-50 text-indigo-600', trend: '+5%' },
      { label: 'Productos Tienda', value: dashboardData.stats.products, icon: '🛍️', color: 'bg-emerald-50 text-emerald-600', trend: '+8%' },
      { label: 'Transacciones', value: dashboardData.stats.transactions, icon: '👤', color: 'bg-amber-50 text-amber-600', trend: '+2%' },
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
                      <p className="text-[10px] font-bold text-gray-400">{ship.origin} ➔ {ship.destination}</p>
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
            <span className="text-2xl group-hover:scale-125 transition-transform">✨</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Nuevo Envío</span>
          </button>
          <button onClick={() => setActiveTab('products')} title="Gestionar catálogo" className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col items-center gap-3 group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🛍️</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Subir Producto</span>
          </button>
          <button onClick={() => setActiveTab('transactions')} title="Ir a contabilidad" className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all flex flex-col items-center gap-3 group">
            <span className="text-2xl group-hover:scale-125 transition-transform">👤</span>
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row h-screen overflow-hidden italic-none relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#00151a] text-white flex flex-col p-8 transition-all duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'} shrink-0 overflow-y-auto border-r border-teal-900/20`}>
          <div className="flex flex-col h-full">
            {/* Logo Section */}
             <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-teal-500/30">
                  {config.customLogoUrl ? <img src={config.customLogoUrl} className="h-6 object-contain invert" alt="Logo" /> : config.logoText[0]}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tighter leading-none italic">Panel Admin</h2>
                  <p className="text-teal-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Bodipo Business</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-teal-400 hover:text-white" aria-label="Cerrar menú lateral" title="Cerrar menú">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <button onClick={() => navigate('/')} title="Cerrar Panel" className="mb-10 w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 border border-white/10 group animate-pulse">
               <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               Cerrar Panel
            </button>

            <nav className="flex flex-col gap-1">
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
               <button onClick={() => setActiveTab('branding')} title="Branding" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'branding' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 Marca
               </button>
             )}
             {allowedTabs.includes('content') && (
               <button onClick={() => setActiveTab('content')} title="Web Content" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'content' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 Web
               </button>
             )}
             {allowedTabs.includes('config') && (
               <button onClick={() => setActiveTab('config')} title="System Config" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'config' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Sistema
               </button>
             )}
             {allowedTabs.includes('operational') && (
               <button onClick={() => setActiveTab('operational')} title="Operational QR" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'operational' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                 Operativa QR
               </button>
             )}
             
              {allowedTabs.includes('manifests') && (
                <button onClick={() => setActiveTab('manifests')} title="Bultos Colectivos" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'manifests' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  Bultos Colectivos
                </button>
              )}
              {allowedTabs.includes('reports') && (
               <button onClick={() => setActiveTab('reports')} title="Reports" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'reports' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 Reportes
               </button>
             )}
             {allowedTabs.includes('pickup') && (
               <button onClick={() => setActiveTab('pickup')} title="Pickup Management" className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'pickup' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Recogidas
               </button>
             )}
          </nav>
        </div>

       </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-teal-900 border border-gray-100 rounded-xl bg-gray-50"
              aria-label="Abrir menú lateral"
              title="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="block">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600/50 mb-1">
                 <span className="hover:text-teal-600 cursor-pointer" onClick={() => setActiveTab('dashboard')}>Panel</span>
                 <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                 <span className="text-teal-900">{activeTab}</span>
              </nav>
              <h2 className="text-lg md:text-2xl font-black text-teal-900 tracking-tighter italic uppercase leading-none">{activeTab === 'dashboard' ? 'Vista General' : activeTab}</h2>
            </div>
            
            <div className="hidden lg:flex items-center relative group">
              <svg className="w-5 h-5 text-gray-300 absolute left-4 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder="Búsqueda global..." 
                className="pl-12 pr-6 py-2.5 bg-gray-50 border border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none w-64 transition-all"
                onChange={(e) => {
                   const val = e.target.value.toLowerCase();
                   if (val.length > 2) {
                      // Simple filter for demo
                      setShipmentSearch(val);
                      if (activeTab !== 'shipments' && activeTab !== 'pickup') setActiveTab('shipments');
                   }
                }}
              />
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Debug Indicator - Will be invisible but useful for trace */}
          <div className="hidden" data-tab={activeTab} data-role={role}></div>

          {!appConfig && ['content', 'config', 'branding'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-teal-900 uppercase tracking-widest animate-pulse italic">Sincronizando con el servidor...</p>
            </div>
          )}

          {activeTab === 'dashboard' && renderDashboard()}
          
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">Nuevo Producto</h3>
                  <form onSubmit={addProduct} className="space-y-4">
                     <div className="relative group">
                        <div className={`w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all ${isUploading ? 'opacity-50' : ''}`}>
                           {newProduct.image ? (
                              <img src={newProduct.image} className="w-full h-full object-cover" alt="Preview" />
                           ) : (
                              <>
                                 <span className="text-3xl mb-2">\ud83d\udcf7</span>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">HAGA CLIC AQU\u00cd PARA SELECCIONAR FOTO PRODUCTO</p>
                              </>
                           )}
                           <input type="file" title="Subir imagen de producto" onChange={e => handleImageUpload(e, 'product')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        {newProduct.image && (
                           <button type="button" onClick={() => setNewProduct({...newProduct, image: ''})} title="Eliminar imagen" className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                        )}
                     </div>
                     <input required type="text" placeholder="Nombre del Producto" title="Nombre" className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500/20" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                     <input required type="text" placeholder="Precio (ej: 50.000 FCFA)" title="Precio" className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500/20" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                     <textarea placeholder="Descripción (opcional)" title="Descripción" className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500/20 h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                     <button type="submit" disabled={isUploading || !newProduct.image} title="Publicar Producto" className="w-full py-4 bg-[#00151a] text-white rounded-2xl font-black uppercase text-xs hover:bg-teal-900 transition-colors disabled:opacity-50">Publicar Producto</button>
                  </form>
               </section>
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shipmentGroups.map(group => (
                    <motion.div layout key={group.userId} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-teal-200 transition-all group">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-xl">👤</div>
                          <div>
                             <h4 className="font-black text-teal-900 leading-tight">{group.user.name}</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.user.phone}</p>
                          </div>
                       </div>
                       <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Envíos</p>
                          <p className="text-2xl font-black text-teal-900 tracking-tighter">{group.shipments.length}</p>
                       </div>
                       <button onClick={() => setSelectedUserGroup(group)} className="w-full py-3 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-colors">Ver Detalles</button>
                    </motion.div>
                  ))}
               </div>

               <AnimatePresence>
                  {selectedUserGroup && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-[#00151a]/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                       <motion.div 
                         initial={{ scale: 0.9, y: 20 }}
                         animate={{ scale: 1, y: 0 }}
                         exit={{ scale: 0.9, y: 20 }}
                         className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                       >
                          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                             <div>
                                <h3 className="text-2xl font-black text-teal-900 tracking-tighter uppercase italic">Envíos de {selectedUserGroup.user.name}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedUserGroup.user.email}</p>
                             </div>
                             <button onClick={() => setSelectedUserGroup(null)} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl hover:bg-red-50 hover:text-red-500 transition-colors">❌</button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-8 space-y-4">
                             {selectedUserGroup.shipments.map(ship => (
                               <div key={ship._id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white hover:shadow-xl transition-all group">
                                  <div className="flex items-center gap-6">
                                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">📦</div>
                                     <div>
                                        <p className="text-sm font-black text-teal-600 uppercase tracking-widest mb-1">{ship.trackingNumber}</p>
                                        <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{ship.description || 'Sin Descripción'}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 italic">{ship.origin} ➔ {ship.destination}</p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                     <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(ship.createdAt).toLocaleDateString()}</p>
                                        <p className="text-xl font-black text-teal-900 tracking-tighter italic">{ship.price} FCFA</p>
                                     </div>
                                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(ship.status)}`}>
                                        {ship.status}
                                     </span>
                                  </div>
                               </div>
                             ))}
                          </div>
                          
                          <div className="p-8 bg-teal-900 text-white flex justify-between items-center">
                             <div>
                                <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Total Facturado</p>
                                <p className="text-3xl font-black italic tracking-tighter">
                                   {selectedUserGroup.shipments.reduce((sum, s) => sum + (s.price || 0), 0)} FCFA
                                </p>
                             </div>
                             <button className="px-8 py-4 bg-white text-teal-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-transform">Imprimir Reporte</button>
                          </div>
                       </motion.div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.keys(transactions.reduce((acc, tx) => {
                     const label = getAssignedFolder(tx.createdAt);
                     acc[label] = true;
                     return acc;
                  }, {} as any)).map(folder => (
                    <div key={folder} onClick={() => setSelectedTxFolder(folder === selectedTxFolder ? null : folder)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col items-center gap-4 group ${selectedTxFolder === folder ? 'bg-teal-500 border-teal-400 text-white shadow-xl shadow-teal-500/20' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'}`}>
                       <div className="text-4xl transition-transform ${selectedTxFolder === folder ? 'scale-110' : 'group-hover:scale-110'}">📂</div>
                       <span className={`font-black uppercase text-[10px] tracking-widest ${selectedTxFolder === folder ? 'text-white' : 'text-teal-900'}`}>{folder}</span>
                    </div>
                  ))}
               </div>

                {(selectedTxFolder || true) && (
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm animate-in slide-in-from-top-4">
                     <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6 border-b pb-4 italic">Transacciones de {selectedTxFolder}</h4>
                     <div className="space-y-3">
                        {transactions.filter(tx => getAssignedFolder(tx.createdAt) === selectedTxFolder).map(tx => (
                           <div key={tx._id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-md transition-all border border-gray-100">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">👤</div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900 uppercase">{tx.user?.name || 'Cliente'}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{tx.type} 💸 {new Date(tx.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <p className="text-sm font-black text-teal-900 italic">{tx.amount} {tx.currency || 'FCFA'}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
               {transactions.length === 0 && <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 text-gray-300 font-bold italic uppercase tracking-widest">No hay movimientos contables registrados</div>}
            </div>
          )}


          {activeTab === 'pos' && (
            <div className="max-w-4xl mx-auto">
               <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-12">
                        <div>
                           <h3 className="text-4xl font-black text-teal-900 tracking-tighter uppercase italic leading-none mb-2">Terminal POS</h3>
                           <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-l-2 border-orange-500 pl-3">Registro de Envío Directo</p>
                        </div>
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner font-black">POS</div>
                     </div>

                     <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                           setIsUploading(true);
                           const res = await fetch(`${BASE_URL}/api/shipments`, {
                              method: 'POST',
                              headers: { 
                                 'Content-Type': 'application/json',
                                 'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: JSON.stringify({
                                 trackingNumber: posData.trackingNumber,
                                 origin: 'ESPAÑA',
                                 destination: posData.destination || 'GUINEA ECUATORIAL',
                                 description: posData.description,
                                 weight: parseFloat(posData.weight),
                                 price: parseFloat(posData.price),
                                 recipient: { name: posData.recipientName }
                              })
                           });
                           if (res.ok) {
                               alert('Envío registrado con éxito');
                              setPosData({ trackingNumber: '', senderName: '', recipientName: '', destination: '', weight: '', price: '', description: '' });
                              fetchDashboardData();
                           } else {
                              const err = await res.json();
                              alert('Error al registrar envío: ' + (err.message || 'Error desconocido'));
                           }
                        } catch (err) {
                           alert('Error de conexión');
                        } finally {
                           setIsUploading(false);
                        }
                     }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Número de Tracking</label>
                           <input required type="text" placeholder="ej: BB982342" title="Número de Tracking" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.trackingNumber} onChange={e => setPosData({...posData, trackingNumber: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre del Destinatario</label>
                           <input required type="text" placeholder="Nombre completo" title="Nombre del Destinatario" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.recipientName} onChange={e => setPosData({...posData, recipientName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Peso (kg)</label>
                           <input required type="number" step="0.1" placeholder="0.0" title="Peso en kg" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.weight} onChange={e => setPosData({...posData, weight: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Precio (FCFA)</label>
                           <input required type="number" placeholder="50000" title="Precio en FCFA" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.price} onChange={e => setPosData({...posData, price: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Descripción del Contenido</label>
                           <textarea required placeholder="ej: Ropa, calzado y electrónicos" title="Descripción" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all h-24" value={posData.description} onChange={e => setPosData({...posData, description: e.target.value})} />
                        </div>
                        
                        <div className="md:col-span-2 pt-6">
                           <button type="submit" disabled={isUploading} className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all">
                              {isUploading ? 'Procesando...' : 'Finalizar y Generar Recibo'}
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'content' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">Configuración Web (Hero)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Título Principal</label>
                         <input type="text" title="Título Hero" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={appConfig?.content?.hero?.title} onChange={e => updateConfig?.({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, title: e.target.value } } } as any)} />
                         
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2 mt-4">Subtítulo</label>
                         <textarea title="Subtítulo Hero" className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-32" value={appConfig?.content?.hero?.subtitle} onChange={e => updateConfig?.({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, subtitle: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Imagen de Portada (Hero)</label>
                         <div className="w-full h-48 bg-gray-100 rounded-[2rem] overflow-hidden relative group border-2 border-dashed border-gray-200">
                            {appConfig?.content?.hero?.heroImage ? (
                               <img src={appConfig.content.hero.heroImage} className="w-full h-full object-cover" alt="Hero" />
                            ) : (
                               <div className="flex items-center justify-center h-full text-gray-300 font-black italic">No hay imagen</div>
                            )}
                            <input type="file" title="Subir Imagen Hero" onChange={e => handleImageUpload(e, 'hero')} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                         <p className="text-[9px] text-gray-400 font-bold italic text-center">Click en el recuadro para subir nueva imagen</p>
                      </div>
                   </div>
                   <button onClick={() => updateConfig?.(appConfig as any).then(() => alert('Web actualizada'))} className="mt-8 w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-500/20">Guardar Cambios</button>
                </div>
             </div>
          )}

          {activeTab === 'config' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <div className="bg-[#00151a] p-10 rounded-[3rem] text-white shadow-2xl shadow-teal-900/40 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/2 -translate-y-1/2">
                      <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-10 border-l-4 border-teal-500 pl-6">Configuración del Sistema</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-6">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-4">Tasas de Cambio</h4>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">EUR ➜ CFA</span>
                                  <input type="number" title="Tasa EUR a CFA" placeholder="655" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={appConfig?.rates?.exchange?.eur_xaf || 655} onChange={e => updateConfig?.({ rates: { ...appConfig?.rates, exchange: { ...appConfig?.rates?.exchange, eur_xaf: parseFloat(e.target.value) } } } as any)} />
                               </div>
                            </div>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-4">Próximos Vuelos / Barcos</h4>
                            <div className="space-y-4">
                               <div className="flex flex-col gap-2">
                                  <span className="text-[9px] font-black text-gray-500 uppercase">Cierre de Maletas Aéreo</span>
                                  <input type="date" title="Fecha Próximo Vuelo" className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-black text-sm" value={appConfig?.dates?.nextAirDeparture} onChange={e => updateConfig?.({ dates: { ...appConfig?.dates, nextAirDeparture: e.target.value } } as any)} />
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6 text-center flex flex-col items-center justify-center">
                         <div className="w-40 h-40 bg-teal-500/20 rounded-full flex items-center justify-center border-4 border-teal-500 shadow-2xl shadow-teal-500/30">
                            <span className="text-6xl font-black">⚙️</span>
                         </div>
                         <h4 className="text-lg font-black uppercase tracking-widest mt-4">Motor Logístico</h4>
                         <p className="text-[10px] text-teal-400/60 font-black uppercase tracking-widest">Estado: Optimizando Rutas</p>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'operational' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 pb-20">
                 <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                       <div className="w-20 h-20 bg-teal-900 text-white rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl">📦</div>
                       <h3 className="text-3xl md:text-4xl font-black text-teal-900 tracking-tighter uppercase italic leading-none mb-4">Escáner Logístico</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 max-w-sm">Gestiona llegadas individuales o lotes masivos vía QR o Código</p>

                       {/* Mode Switcher */}
                       <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-10 w-full max-w-xs transition-all border border-gray-200 shadow-inner">
                          <button 
                             onClick={() => setOperationalInputMode('qr')}
                             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${operationalInputMode === 'qr' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                             Cámara QR
                          </button>
                          <button 
                             onClick={() => setOperationalInputMode('manual')}
                             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${operationalInputMode === 'manual' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                             Código Manual
                          </button>
                       </div>
                       
                       {operationalInputMode === 'qr' ? (
                          <div className="w-full max-w-md bg-[#011a1f] p-4 rounded-[3rem] mb-10 relative shadow-2xl border-4 border-[#01242b]">
                             <div id="reader" className="w-full aspect-square overflow-hidden rounded-[2.5rem] bg-black">
                                {!isScanning && (
                                   <div className="h-full flex flex-col items-center justify-center text-white p-10">
                                      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 mb-6">Iniciando Cámara...</p>
                                      <button onClick={startScanner} className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all">Reintentar Cámara</button>
                                   </div>
                                )}
                             </div>
                             {/* Scanning UI overlay */}
                             {isScanning && (
                                <div className="absolute inset-0 pointer-events-none rounded-[3rem]">
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-teal-500/50 rounded-3xl animate-pulse"></div>
                                   <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.5)] animate-[scan_2s_infinite]"></div>
                                </div>
                             )}
                             <p className="mt-6 text-[9px] font-bold text-teal-500/60 uppercase tracking-widest">Apunta al código QR del comprobante</p>
                          </div>
                       ) : (
                          <div className="w-full max-w-md space-y-4 mb-10">
                             <div className="relative group">
                                <input 
                                   type="text" 
                                   placeholder="EJ: BB-ES-2401..." 
                                   className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-[2rem] text-lg font-black tracking-tighter text-teal-900 placeholder:text-gray-300 outline-none transition-all shadow-sm"
                                   value={manualCode}
                                   onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                   onKeyDown={(e) => e.key === 'Enter' && manualCode && handleQuickTrack(manualCode)}
                                />
                                <button 
                                   onClick={() => manualCode && handleQuickTrack(manualCode)}
                                   title="Buscar código"
                                   className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center hover:bg-teal-700 transition-all shadow-lg active:scale-90">
                                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7M3 12h18"/></svg>
                                </button>
                             </div>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Escribe el código de tracking y pulsa Enter</p>
                          </div>
                       )}

                       {scannedShipment && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full p-8 bg-teal-50 rounded-[3rem] border border-teal-100 shadow-xl text-left border-b-4 border-b-teal-500">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                   <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Paquete Identificado</p>
                                   <h4 className="text-3xl font-black text-teal-900 tracking-tighter uppercase italic leading-none">{scannedShipment.trackingNumber}</h4>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(scannedShipment.status)}`}>{scannedShipment.status}</span>
                             </div>
                             <div className="grid grid-cols-2 gap-6 text-[11px] font-black uppercase text-teal-800 mb-8 italic tracking-tight">
                                <div className="p-4 bg-white rounded-2xl border border-teal-100/50">
                                   <p className="text-[8px] text-teal-400 mb-1">Trayecto</p>
                                   📦 {scannedShipment.origin} ➔ {scannedShipment.destination}
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-teal-100/50">
                                   <p className="text-[8px] text-teal-400 mb-1">Peso</p>
                                   ⚖️ {scannedShipment.weight} KG
                                </div>
                                <div className="col-span-2 p-4 bg-white rounded-2xl border border-teal-100/50">
                                   <p className="text-[8px] text-teal-400 mb-1">Destinatario</p>
                                   👤 {scannedShipment.recipient?.name}
                                </div>
                             </div>
                             <div className="flex gap-4">
                                <button 
                                   onClick={() => {
                                      handleStatusUpdate(scannedShipment._id, 'Llegado a Destino');
                                      setScannedShipment(null);
                                      if (operationalInputMode === 'manual') setManualCode('');
                                   }} 
                                   className="flex-1 py-5 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 active:scale-95">
                                   Marcar como Llegado
                                </button>
                                <button onClick={() => setScannedShipment(null)} className="px-8 py-5 bg-white text-gray-400 rounded-2xl font-black uppercase text-[10px] border border-gray-100 hover:bg-gray-50 transition-all">Cerrar</button>
                             </div>
                          </motion.div>
                       )}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'reports' && (
             <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">Reportes Ejecutivos</h3>
                      <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] border-l-2 border-teal-500 pl-3">Rendimiento Logístico 2026</p>
                   </div>
                   <button onClick={exportToExcel} className="px-8 py-3 bg-[#00151a] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-900 transition-all shadow-xl">Exportar Data (PDF/CSV)</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10 pb-2 border-b">Evolución de Envíos</h4>
                      <div className="h-64 flex items-end justify-between gap-4 px-4 overflow-hidden">
                         {[65, 80, 45, 90, 100, 70, 85, 95, 110, 80, 90, 120].map((h, i) => (
                            <div key={i} className="w-full bg-teal-500/10 rounded-t-xl relative group">
                               <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 1 }} className="absolute bottom-0 left-0 right-0 bg-teal-500 rounded-t-xl group-hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"></motion.div>
                            </div>
                         ))}
                      </div>
                      <div className="flex justify-between mt-6 text-[9px] font-black text-gray-300 uppercase tracking-widest px-2">
                         <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
                      </div>
                   </div>
                   
                   <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                         <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
                      </div>
                      <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-12">Cuota de Mercado</h4>
                      <div className="space-y-6 relative z-10">
                         {[
                           { name: 'Aéreo España', val: '72%', color: 'bg-teal-500' },
                           { name: 'Marítimo BIO', val: '18%', color: 'bg-indigo-500' },
                           { name: 'Regional CM', val: '10%', color: 'bg-orange-500' }
                         ].map(item => (
                            <div key={item.name} className="space-y-2">
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                  <span>{item.name}</span>
                                  <span>{item.val}</span>
                               </div>
                               <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: item.val }} transition={{ duration: 1.5 }} className={`h-full ${item.color} shadow-[0_0_10px_rgba(20,184,166,0.3)]`}></motion.div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'manifests' && (
             <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <div className="bg-[#00151a] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-teal-500/20">
                   <div className="absolute top-0 right-0 text-[200px] opacity-10 leading-none select-none">📦</div>
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Bultos Colectivos</h3>
                   <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">Genera un QR maestro para un contenedor de paquetes — escaneable en Guinea para actualizar todos a la vez</p>
                   <div className="flex gap-4 mt-8">
                     <button onClick={() => setManifestTab('create')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${manifestTab === 'create' ? 'bg-teal-500 text-white shadow-lg' : 'bg-white/10 text-teal-300'}`}>Crear Bulto Colectivo</button>
                     <button onClick={() => setManifestTab('scan')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${manifestTab === 'scan' ? 'bg-teal-500 text-white shadow-lg' : 'bg-white/10 text-teal-300'}`}>Escanear / Actualizar</button>
                   </div>
                </div>

                {manifestTab === 'create' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Left: Package Selection */}
                     <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-2 border-l-4 border-teal-500 pl-4">Seleccionar Paquetes</h4>
                        <div className="flex gap-2 mb-6 mt-4">
                           {['all', 'Malabo', 'Bata'].map(dest => (
                             <button key={dest} onClick={() => setManifestDestFilter(dest as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${manifestDestFilter === dest ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{dest === 'all' ? 'Todos' : dest}</button>
                           ))}
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                           {allShipments
                             .filter(s => manifestDestFilter === 'all' || s.destination?.toLowerCase().includes(manifestDestFilter.toLowerCase()))
                             .map(s => (
                               <label key={s._id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${selectedForManifest.includes(s._id) ? 'bg-teal-50 border-teal-400' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}`}>
                                 <input type="checkbox" checked={selectedForManifest.includes(s._id)} onChange={e => setSelectedForManifest(prev => e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id))} className="w-4 h-4 accent-teal-600" />
                                 <div className="flex-1 min-w-0">
                                   <p className="text-[10px] font-black text-slate-900 uppercase truncate">{s.trackingNumber}</p>
                                   <p className="text-[9px] font-bold text-gray-400">{s.recipient?.name} · {s.destination}</p>
                                 </div>
                                 <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${s.destination?.toLowerCase().includes('bata') ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>{s.destination?.toLowerCase().includes('bata') ? 'Bata' : 'Malabo'}</span>
                               </label>
                             ))}
                        </div>
                        {allShipments.length === 0 && <p className="text-center text-gray-300 font-bold italic text-sm py-8">Sin paquetes disponibles</p>}
                     </div>

                     {/* Right: Create / Preview */}
                     <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6 border-l-4 border-teal-500 pl-4">Configurar Bulto</h4>
                        <div className="space-y-4 flex-1">
                           <div>
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-2 mb-1">Descripción del Contenedor</label>
                             <input type="text" title="Descripción del bulto colectivo" placeholder="Ej: Contenedor Nov-2025 Malabo" value={manifestDescription} onChange={e => setManifestDescription(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" />
                           </div>
                           <div className="p-4 bg-teal-50 rounded-2xl">
                             <p className="text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1">Paquetes seleccionados</p>
                             <p className="text-2xl font-black text-teal-900">{selectedForManifest.length}</p>
                           </div>
                           <div className="p-4 bg-orange-50 rounded-2xl">
                             <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Para Bata</p>
                             <p className="text-lg font-black text-orange-800">{allShipments.filter(s => selectedForManifest.includes(s._id) && s.destination?.toLowerCase().includes('bata')).length} paquetes</p>
                           </div>
                           <div className="p-4 bg-teal-50 rounded-2xl">
                             <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">Para Malabo</p>
                             <p className="text-lg font-black text-teal-800">{allShipments.filter(s => selectedForManifest.includes(s._id) && !s.destination?.toLowerCase().includes('bata')).length} paquetes</p>
                           </div>
                        </div>
                        <button onClick={handleCreateManifest} disabled={isCreatingManifest || selectedForManifest.length === 0} className="mt-6 w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-teal-500/20">
                           {isCreatingManifest ? 'Generando...' : `Generar QR de Bulto Colectivo (${selectedForManifest.length})`}
                        </button>

                        {createdManifest && (
                          <div className="mt-6 p-6 bg-[#00151a] text-white rounded-3xl text-center space-y-4 shadow-xl border border-teal-500/30">
                             <p className="text-[9px] font-black uppercase tracking-widest text-teal-400">✅ Bulto Creado</p>
                             <p className="font-black text-lg">{createdManifest.manifestId}</p>
                             <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner">
                               <QRCodeCanvas value={createdManifest.manifestId} size={180} bgColor="#ffffff" fgColor="#00151a" />
                             </div>
                             <p className="text-[8px] text-teal-300 font-bold uppercase tracking-widest">Escanea este QR en Guinea para actualizar todos los paquetes</p>
                             <div className="flex gap-2">
                                <button onClick={() => window.print()} className="flex-1 py-2 bg-teal-500 text-[#00151a] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-400 transition-colors">Imprimir QR</button>
                                <button onClick={() => setCreatedManifest(null)} className="flex-1 py-2 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">Cerrar</button>
                             </div>
                             <p className="text-[9px] text-gray-400 font-bold italic">{createdManifest.shipments?.length || 0} paquetes incluidos</p>
                          </div>
                        )}
                     </div>
                  </div>
                )}

                {manifestTab === 'scan' && (
                  <div className="max-w-2xl mx-auto space-y-6">
                     <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6 border-l-4 border-teal-500 pl-4">Escanear / Buscar Bulto Colectivo</h4>
                        <div className="flex gap-3">
                           <input type="text" title="ID del Bulto Colectivo" placeholder="Ej: BB-MAN-123456AB" value={manifestScanInput} onChange={e => setManifestScanInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLookupManifest(manifestScanInput)} className="flex-1 p-4 bg-gray-50 rounded-2xl font-black text-sm" />
                           <button onClick={() => handleLookupManifest(manifestScanInput)} className="px-6 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/10">Buscar</button>
                        </div>
                     </div>

                     {scannedManifest && (
                       <div className="bg-white p-8 rounded-[3rem] border border-teal-100 shadow-2xl animate-in slide-in-from-top-4">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                               <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] mb-1">Bulto Encontrado</p>
                               <h4 className="text-3xl font-black text-teal-900 tracking-tighter italic uppercase">{scannedManifest.manifestId}</h4>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{scannedManifest.shipments?.length} paquetes · Estado: <span className="text-teal-600 font-black">{scannedManifest.status}</span></p>
                             </div>
                             <div className="bg-teal-50 p-4 rounded-3xl shadow-inner border border-teal-100">
                               <QRCodeCanvas value={scannedManifest.manifestId} size={100} bgColor="transparent" fgColor="#00151a" />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                             {['Malabo', 'Bata'].map(dest => {
                               const pkgs = scannedManifest.shipments?.filter((s: any) => s.destination?.toLowerCase().includes(dest.toLowerCase())) || [];
                               return (
                                 <div key={dest} className={`p-6 rounded-3xl ${dest === 'Bata' ? 'bg-orange-50 border border-orange-100' : 'bg-teal-50 border border-teal-100'}`}>
                                   <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${dest === 'Bata' ? 'text-orange-600' : 'text-teal-600'}`}>{dest}</p>
                                   <p className={`text-3xl font-black ${dest === 'Bata' ? 'text-orange-800' : 'text-teal-800'}`}>{pkgs.length}</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">paquetes</p>
                                 </div>
                               );
                             })}
                          </div>

                          <div className="space-y-3 max-h-60 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                             {scannedManifest.shipments?.map((s: any) => (
                               <div key={s._id || s.trackingNumber} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-teal-200 transition-all">
                                 <div>
                                   <p className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">{s.trackingNumber}</p>
                                   <p className="text-[10px] text-gray-400 font-bold italic">{s.recipient?.name}</p>
                                 </div>
                                 <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl ${s.destination?.toLowerCase().includes('bata') ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>{s.destination?.toLowerCase().includes('bata') ? 'Bata' : 'Malabo'}</span>
                               </div>
                             ))}
                          </div>

                          <div className="border-t border-gray-100 pt-8 mt-4 space-y-6">
                             <div>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2">Actualizar todos los paquetes a:</p>
                               <select title="Nuevo estado para todos los paquetes" value={manifestStatusUpdate} onChange={e => setManifestStatusUpdate(e.target.value)} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-3xl text-sm font-black uppercase tracking-widest outline-none transition-all shadow-inner">
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="En tránsito">En tránsito</option>
                                  <option value="En Aduanas">En Aduanas</option>
                                  <option value="Llegado a destino">Llegado a Destino</option>
                                  <option value="Entregado">Entregado</option>
                               </select>
                             </div>
                             <button onClick={handleManifestStatusUpdate} className="w-full py-6 bg-teal-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-teal-700 transition-all shadow-2xl shadow-teal-500/30 hover:scale-[1.02] active:scale-95">
                                ✅ Actualizar {scannedManifest.shipments?.length} Paquetes de Golpe
                             </button>
                          </div>
                       </div>
                     )}
                  </div>
                )}
             </div>
          )}
          {activeTab === 'pickup' && (
             <div className="max-w-4xl mx-auto animate-in fade-in">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">📦</div>
                      <div>
                         <h3 className="text-3xl font-black text-teal-900 tracking-tighter uppercase italic leading-none mb-1">Gestión de Recogidas</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Control de llegadas a almacén central</p>
                      </div>
                   </div>
                   
                   <div className="relative mb-8">
                      <input type="text" placeholder="Buscar por tracking, nombre o teléfono..." title="Buscar recogidas" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-3xl text-sm font-bold outline-none transition-all shadow-inner" value={pickupSearch} onChange={e => setPickupSearch(e.target.value)} />
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</div>
                   </div>
                   
                   <div className="space-y-4">
                      {allShipments.filter(s => s.trackingNumber.includes(pickupSearch) || s.recipient.name.toLowerCase().includes(pickupSearch.toLowerCase())).slice(0, 10).map(ship => (
                         <div key={ship._id} className="p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 group-hover:rotate-6 transition-transform">📍</div>
                               <div>
                                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{ship.trackingNumber}</p>
                                  <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase truncate max-w-[200px]">{ship.recipient.name}</h4>
                                  <p className="text-[9px] font-bold text-gray-400 italic">Estado Actual: {ship.status}</p>
                               </div>
                            </div>
                            <button className="px-8 py-3 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform active:scale-95">Recibir en Almacén</button>
                         </div>
                      ))}
                      {allShipments.length === 0 && <div className="text-center py-20 text-gray-300 font-bold italic uppercase tracking-widest">No se encontraron registros activos</div>}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'branding' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 italic-none">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">Identidad Visual</h3>
                   <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Logo de la Empresa (Texto)</label>
                            <input type="text" title="Logo Texto" placeholder="ej: BV" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={config.logoText} onChange={e => setConfig({ ...config, logoText: e.target.value })} />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Logo Personalizado (Imagen)</label>
                            <div className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative">
                               {config.customLogoUrl ? <img src={config.customLogoUrl} className="h-12 object-contain" alt="Logo" /> : <span className="text-gray-300 font-black">Subir Logo</span>}
                               <input type="file" title="Subir Logo" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e, 'logo')} />
                            </div>
                         </div>
                      </div>
                      <button onClick={() => alert('Identidad actualizada')} title="Guardar Identidad" className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-500/20">Guardar Identidad</button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'notifications' && (
             <AdminNotifications />
          )}

          {activeTab === 'users' && (
             <AdminUsers />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
