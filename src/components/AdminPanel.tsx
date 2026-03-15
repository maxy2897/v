
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
  const allowedTabs = React.useMemo(() => {
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
  }, [role]);

  const [activeTab, setActiveTab] = useState(allowedTabs[0] as any);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] as any);
    }
  }, [allowedTabs, activeTab]);

  // Separate effect for closing sidebar to avoid interference
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [shipmentGroups, setShipmentGroups] = useState<UserShipmentGroup[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserShipmentGroup | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedTxFolder, setSelectedTxFolder] = useState<string | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [editConfig, setEditConfig] = useState(appConfig);

  useEffect(() => {
    if (appConfig) {
      setEditConfig(appConfig);
    }
  }, [appConfig]);
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
  const readerMounted = useRef<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
    const element = document.getElementById("reader");
    if (!element) return;
    if (scannerRef.current?.isScanning) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      setCameraError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error(t('admin.scanner.no_camera'));
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 20, qrbox: { width: 250, height: 250 } },
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
    } catch (err: any) {
      console.error("Scanner Start Error:", err);
      setCameraError(err.message || t('admin.scanner.error_start'));
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      const s = scannerRef.current;
      scannerRef.current = null;
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
      }, 1200); // 1.2s delay for mobile camera hardware stability
      return () => {
        mounted = false;
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    return () => { mounted = false; stopScanner(); };
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
             alert(t('admin.scanner.no_package'));
         }
      } catch (err) {
         console.error('Bulk QR Error:', err);
      }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateShipmentStatus(id, newStatus);
       alert(t('admin.scanner.status_success'));
      if (scannedShipment?._id === id) {
        setScannedShipment(prev => prev ? { ...prev, status: newStatus } : null);
      }
      fetchShipments();
    } catch (err) {
       alert(t('admin.scanner.status_error'));
    }
  };

  const handleCreateManifest = async () => {
    if (selectedForManifest.length === 0) { alert(t('admin.scanner.select_pkg')); return; }
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
       alert(`${t('admin.scanner.bundle_not_found')}: ${err.message}`);
    }
  };

  const handleManifestStatusUpdate = async () => {
    if (!scannedManifest) return;
    if (!window.confirm(t('admin.scanner.update_confirm', { id: scannedManifest.manifestId, status: manifestStatusUpdate }))) return;
    try {
      const result = await updateManifestStatus(scannedManifest.manifestId, manifestStatusUpdate);
       alert(`${t('admin.scanner.success')}. ${result.message}`);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo' | 'hero' | 'money') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      try {
        if (type === 'product') {
          setNewProduct({ ...newProduct, image: base64String });
        } else if (type === 'logo') {
          // Send to config endpoint
          const newConf = { ...config, customLogoUrl: base64String } as any;
          setConfig(newConf);
          if (updateConfig) updateConfig(newConf).then(() => alert(t('common.success')));
        } else if (type === 'hero') {
          const newConf = { ...editConfig, content: { ...editConfig?.content, hero: { ...editConfig?.content?.hero, heroImage: base64String } } } as any;
          setEditConfig(newConf);
          if (updateConfig) updateConfig(newConf).then(() => alert(t('common.success')));
        } else if (type === 'money') {
          const newConf = { ...editConfig, content: { ...editConfig?.content, hero: { ...editConfig?.content?.hero, moneyTransferImage: base64String } } } as any;
          setEditConfig(newConf);
          if (updateConfig) updateConfig(newConf).then(() => alert(t('common.success')));
        }
      } catch (error) {
        console.error('Error handling image:', error);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
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
       alert(t('admin.scanner.product_success'));
    } catch (error) {
       alert(t('admin.scanner.product_error'));
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t('admin.scanner.product_delete_confirm'))) return;
    try {
      setIsDeletingId(id);
      await apiDeleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
       alert(t('admin.scanner.product_delete_error'));
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
       alert(t('admin.scanner.export_hint'));
  };

  const renderDashboard = () => {
    const stats = [
      { label: t('admin.menu.shipments'), value: dashboardData.stats.shipments, icon: '📦', color: 'text-teal-600' },
      { label: t('admin.menu.users'), value: dashboardData.stats.users, icon: '👤', color: 'text-indigo-600' },
      { label: t('admin.menu.products'), value: dashboardData.stats.products, icon: '🛍️', color: 'text-emerald-600' },
      { label: t('admin.menu.transactions'), value: dashboardData.stats.transactions, icon: '💰', color: 'text-amber-600' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Simplified Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <span className="text-xl mb-3">{stat.icon}</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{stat.value}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Minimal Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-teal-500 pl-3">{t('admin.section.activity')}</h4>
                <button onClick={() => setActiveTab('shipments')} className="text-[9px] font-black text-teal-600 uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">{t('dash.view_all')}</button>
             </div>
             <div className="space-y-3">
               {dashboardData.recentActivity.slice(0, 5).map((ship: Shipment) => (
                 <div key={ship._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                   <div className="flex items-center gap-3">
                     <span className="text-lg">📦</span>
                     <div>
                       <p className="text-[11px] font-black text-slate-900 truncate max-w-[120px]">{ship.trackingNumber}</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{ship.destination}</p>
                     </div>
                   </div>
                   <span className="text-[8px] font-black uppercase px-2 py-1 bg-white border border-gray-100 rounded-lg text-gray-500">{ship.status}</span>
                 </div>
               ))}
               {dashboardData.recentActivity.length === 0 && <p className="text-center py-10 text-[10px] text-gray-300 font-black uppercase tracking-widest">{t('dash.no_activity')}</p>}
             </div>
           </div>

           <div className="space-y-6">
              <div className="bg-[#00151a] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                   <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
                </div>
                <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2 italic">{t('admin.quick_access')}</h4>
                <div className="grid grid-cols-2 gap-3 mt-6">
                   <button onClick={() => setActiveTab('pos')} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-teal-500 hover:text-white transition-all text-left group">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('admin.menu.pos')}</p>
                      <p className="text-xs font-black">{t('home.hero.cta_ship')}</p>
                   </button>
                   <button onClick={() => setActiveTab('operational')} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-teal-500 hover:text-white transition-all text-left group">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('admin.scanner')}</p>
                      <p className="text-xs font-black">QR Master</p>
                   </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('admin.system_status')}</p>
                   <p className="text-xs font-black text-teal-600 uppercase italic">{t('admin.active_secure')}</p>
                </div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row h-screen italic-none relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#00151a] text-white flex flex-col p-8 transition-transform duration-300 md:relative md:block md:w-72 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-teal-900/20 shadow-2xl md:shadow-none overflow-y-auto h-[100dvh] custom-scrollbar`}>
          <div className="flex flex-col min-h-full shrink-0">
            {/* Logo Section */}
             <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-teal-500/30">
                  {config.customLogoUrl ? <img src={config.customLogoUrl} className="h-6 object-contain invert" alt="Logo" /> : config.logoText[0]}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tighter leading-none italic">{t('admin.panel_title')}</h2>
                  <p className="text-teal-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic">Bodipo Business</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-teal-400 hover:text-white" aria-label="Cerrar menú lateral" title="Cerrar menú">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <button onClick={() => navigate('/')} title={t('admin.close_panel')} className="mb-10 w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 border border-white/10 group animate-pulse shrink-0">
               <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               {t('admin.close_panel')}
            </button>

            <nav className="flex flex-col gap-1 pb-10 mt-auto shrink-0">
             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-2 hidden md:block">{t('admin.section.main')}</p>
             <button onClick={() => setActiveTab('dashboard')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'dashboard' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {t('admin.menu.dashboard')}
             </button>

             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-8 hidden md:block">{t('admin.section.logistics')}</p>
             {allowedTabs.includes('shipments') && (
               <button onClick={() => setActiveTab('shipments')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'shipments' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                 {t('admin.menu.shipments')}
               </button>
             )}
             {allowedTabs.includes('pos') && (
               <button onClick={() => setActiveTab('pos')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'pos' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                 {t('admin.menu.pos')}
               </button>
             )}

             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-8 hidden md:block">{t('admin.section.management')}</p>
             {allowedTabs.includes('products') && (
               <button onClick={() => setActiveTab('products')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'products' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                 {t('admin.menu.products')}
               </button>
             )}
             {allowedTabs.includes('transactions') && (
               <button onClick={() => setActiveTab('transactions')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'transactions' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 {t('admin.menu.transactions')}
               </button>
             )}
             {allowedTabs.includes('users') && (
               <button onClick={() => setActiveTab('users')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'users' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 {t('admin.menu.users')}
               </button>
             )}

             <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-[0.2em] mb-4 mt-8 hidden md:block">{t('admin.section.system')}</p>
             {allowedTabs.includes('branding') && (
               <button onClick={() => setActiveTab('branding')} title={t('admin.menu.branding')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'branding' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 {t('admin.menu.branding')}
               </button>
             )}
             {allowedTabs.includes('content') && (
               <button onClick={() => setActiveTab('content')} title={t('admin.menu.web')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'content' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 {t('admin.menu.web')}
               </button>
             )}
             {allowedTabs.includes('config') && (
               <button onClick={() => setActiveTab('config')} title={t('admin.menu.config')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'config' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 {t('admin.menu.config')}
               </button>
             )}
             {allowedTabs.includes('operational') && (
               <button onClick={() => setActiveTab('operational')} title={t('admin.menu.operational')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'operational' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                 {t('admin.menu.operational')}
               </button>
             )}
             
              {allowedTabs.includes('manifests') && (
                <button onClick={() => setActiveTab('manifests')} title={t('admin.menu.manifests')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'manifests' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  {t('admin.menu.manifests')}
                </button>
              )}
              {allowedTabs.includes('reports') && (
               <button onClick={() => setActiveTab('reports')} title={t('admin.menu.reports')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'reports' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 {t('admin.menu.reports')}
               </button>
             )}
             {allowedTabs.includes('pickup') && (
               <button onClick={() => setActiveTab('pickup')} title={t('admin.menu.pickup')} className={`w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'pickup' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-teal-900/30 hover:text-white'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {t('admin.menu.pickup')}
               </button>
             )}
          </nav>
        </div>

       </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto w-full relative custom-scrollbar">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              className="p-3 text-teal-900 border border-gray-100 rounded-2xl bg-gray-50 md:hidden active:scale-90 transition-transform"
              aria-label="Menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="block">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600/50 mb-1">
                 <span className="hover:text-teal-600 cursor-pointer" onClick={() => setActiveTab('dashboard')}>{t('admin.menu.dashboard')}</span>
                 <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                 <span className="text-teal-900 uppercase tracking-widest">{t(`admin.menu.${activeTab}`) || activeTab}</span>
              </nav>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{t(`admin.menu.${activeTab}`) || activeTab}</h2>
            </div>
            
            <div className="hidden lg:flex items-center relative group">
              <svg className="w-5 h-5 text-gray-300 absolute left-4 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder={t('dash.search_placeholder')} 
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
               <p className="text-[10px] font-black text-teal-900 uppercase tracking-widest animate-pulse italic">{t('admin.scanner.syncing')}</p>
            </div>
          )}

          {activeTab === 'dashboard' && renderDashboard()}
          
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">{t('admin.new_product')}</h3>
                  <form onSubmit={addProduct} className="space-y-4">
                     <div className="relative group">
                        <div className={`w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all ${isUploading ? 'opacity-50' : ''}`}>
                           {newProduct.image ? (
                              <img src={newProduct.image} className="w-full h-full object-cover" alt="Preview" />
                           ) : (
                              <>
                                 <span className="text-3xl mb-2">📷</span>
                                 <p className="text-[10px] font-black uppercase text-teal-400 mt-4 leading-relaxed">{t('admin.scan_qr_guinea_update')}</p>
                              </>
                           )}
                           <input type="file" title="Subir imagen de producto" onChange={e => handleImageUpload(e, 'product')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        {newProduct.image && (
                           <button type="button" onClick={() => setNewProduct({...newProduct, image: ''})} title={t('common.delete')} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">{t('common.delete')}</button>
                        )}
                     </div>
                     <input required type="text" placeholder={t('admin.product_name')} title={t('admin.product_name')} className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500/20" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                     <input required type="text" placeholder={t('shipping.price') + " (ej: 50.000 FCFA)"} title={t('shipping.price')} className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500/20" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                     <textarea placeholder={t('shipping.description') + " (opcional)"} title={t('shipping.description')} className="px-4 py-3 bg-gray-50 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500/20 h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                     <button type="submit" disabled={isUploading || !newProduct.image} title={t('admin.publish_product')} className="w-full py-4 bg-[#00151a] text-white rounded-2xl font-black uppercase text-xs hover:bg-teal-900 transition-colors disabled:opacity-50">{t('admin.publish_product')}</button>
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
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{t('admin.total_shipments')}</p>
                          <p className="text-2xl font-black text-teal-900 tracking-tighter">{group.shipments.length}</p>
                       </div>
                       <button onClick={() => setSelectedUserGroup(group)} className="w-full py-3 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-colors">{t('dash.view_details')}</button>
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
                                 <h3 className="text-2xl font-black text-teal-900 tracking-tighter uppercase italic">{t('admin.shipments_of', { name: selectedUserGroup.user.name })}</h3>
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
                                         <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{ship.description || t('admin.no_description')}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 italic">{ship.origin} ➔ {ship.destination}</p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                     <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 italic">{new Date(ship.createdAt).toLocaleDateString()}</p>
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
                                 <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">{t('admin.total_billed')}</p>
                                <p className="text-3xl font-black italic tracking-tighter">
                                   {selectedUserGroup.shipments.reduce((sum, s) => sum + (s.price || 0), 0)} FCFA
                                </p>
                             </div>
                             <button className="px-8 py-4 bg-white text-teal-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-transform">{t('admin.print_report')}</button>
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
                      <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6 border-b pb-4 italic">{t('admin.transactions_of', { folder: selectedTxFolder })}</h4>
                     <div className="space-y-3">
                        {transactions.filter(tx => getAssignedFolder(tx.createdAt) === selectedTxFolder).map(tx => (
                           <div key={tx._id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-md transition-all border border-gray-100">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">👤</div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900 uppercase">{tx.user?.name || t('admin.client')}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{tx.type} 💸 {new Date(tx.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <p className="text-sm font-black text-teal-900 italic">{tx.amount} {tx.currency || 'FCFA'}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
               {transactions.length === 0 && <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 text-gray-300 font-bold italic uppercase tracking-widest">{t('admin.scanner.no_tx')}</div>}
            </div>
          )}


          {activeTab === 'pos' && (
            <div className="max-w-4xl mx-auto">
               <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-12">
                        <div>
                           <h3 className="text-4xl font-black text-teal-900 tracking-tighter uppercase italic leading-none mb-2">{t('admin.menu.pos')}</h3>
                           <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-l-2 border-orange-500 pl-3">{t('admin.pos_direct_register')}</p>
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
                                 origin: t('dash.origin_spain'),
                                 destination: posData.destination || t('dash.destination_equatorial_guinea'),
                                 description: posData.description,
                                 weight: parseFloat(posData.weight),
                                 price: parseFloat(posData.price),
                                 recipient: { name: posData.recipientName }
                              })
                           });
                           if (res.ok) {
                                alert(t('admin.scanner.reg_success'));
                              setPosData({ trackingNumber: '', senderName: '', recipientName: '', destination: '', weight: '', price: '', description: '' });
                              fetchDashboardData();
                           } else {
                              const err = await res.json();
                               alert(`${t('admin.scanner.reg_error')}: ${(err.message || 'Error desconocido')}`);
                           }
                        } catch (err) {
                            alert(t('admin.scanner.conn_error'));
                        } finally {
                           setIsUploading(false);
                        }
                     }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('shipping.tracking_number')}</label>
                           <input required type="text" placeholder="ej: BB982342" title={t('shipping.tracking_number')} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.trackingNumber} onChange={e => setPosData({...posData, trackingNumber: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('shipping.recipient')}</label>
                           <input required type="text" placeholder={t('shipping.recipient')} title={t('shipping.recipient')} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.recipientName} onChange={e => setPosData({...posData, recipientName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('shipping.weight')} (kg)</label>
                           <input required type="number" step="0.1" placeholder="0.0" title={t('shipping.weight')} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.weight} onChange={e => setPosData({...posData, weight: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('shipping.price')} (FCFA)</label>
                           <input required type="number" placeholder="50000" title={t('shipping.price')} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all" value={posData.price} onChange={e => setPosData({...posData, price: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('shipping.description')}</label>
                           <textarea required placeholder="ej: Ropa, calzado y electrónicos" title={t('shipping.description')} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all h-24" value={posData.description} onChange={e => setPosData({...posData, description: e.target.value})} />
                        </div>
                        
                        <div className="md:col-span-2 pt-6">
                           <button type="submit" disabled={isUploading} className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all">
                              {isUploading ? t('common.processing') : t('admin.finalize_pos')}
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
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.web_config_hero')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.main_title')}</label>
                         <input type="text" title={t('admin.main_title')} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={editConfig?.content?.hero?.title} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, hero: { ...editConfig?.content?.hero, title: e.target.value } } } as any)} />
                         
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2 mt-4">{t('admin.subtitle_label')}</label>
                         <textarea title={t('admin.subtitle_label')} className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-32" value={editConfig?.content?.hero?.subtitle} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, hero: { ...editConfig?.content?.hero, subtitle: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.hero_cover_image')}</label>
                         <div className="w-full h-48 bg-gray-100 rounded-[2rem] overflow-hidden relative group border-2 border-dashed border-gray-200">
                            {editConfig?.content?.hero?.heroImage ? (
                               <img src={editConfig.content.hero.heroImage} className="w-full h-full object-cover" alt={t('admin.web_config_hero')} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300 font-black italic">{t('admin.scanner.no_img')}</div>
                            )}
                            <input type="file" title={t('admin.hero_cover_image')} onChange={e => handleImageUpload(e, 'hero')} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                          <p className="text-[9px] text-gray-400 font-bold italic text-center">{t('admin.scanner.upload_hint')}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.scanner.contact_phones')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.phone_es')}</label>
                         <input type="text" title={t('admin.scanner.phone_es')} placeholder="Ej: +34 600..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.contact?.phones?.es || ''} onChange={e => setEditConfig({ ...editConfig, contact: { ...editConfig?.contact, phones: { ...editConfig?.contact?.phones, es: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.phone_gq')}</label>
                         <input type="text" title={t('admin.scanner.phone_gq')} placeholder="Ej: +240 222..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.contact?.phones?.gq || ''} onChange={e => setEditConfig({ ...editConfig, contact: { ...editConfig?.contact, phones: { ...editConfig?.contact?.phones, gq: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.phone_cm')}</label>
                         <input type="text" title={t('admin.scanner.phone_cm')} placeholder="Ej: +237 600..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.contact?.phones?.cm || ''} onChange={e => setEditConfig({ ...editConfig, contact: { ...editConfig?.contact, phones: { ...editConfig?.contact?.phones, cm: e.target.value } } } as any)} />
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.next_shipment_dates')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.air_closing')}</label>
                         <input type="date" title={t('admin.scanner.air_closing')} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.dates?.nextAirDeparture || ''} onChange={e => setEditConfig({ ...editConfig, dates: { ...editConfig?.dates, nextAirDeparture: e.target.value } } as any)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.sea_closing')}</label>
                         <input type="date" title={t('admin.scanner.sea_closing')} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.dates?.nextSeaDeparture || ''} onChange={e => setEditConfig({ ...editConfig, dates: { ...editConfig?.dates, nextSeaDeparture: e.target.value } } as any)} />
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.annual_summary_title')}</h3>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 block font-bold">{t('admin.scanner.annual_hint')}</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Bloque 1 */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.block', { num: 1 })}</label>
                         <input type="text" placeholder="ENERO" className="w-full p-3 bg-white rounded-xl font-bold text-sm border-none shadow-sm" value={editConfig?.content?.schedule?.block1?.month || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block1: { ...editConfig?.content?.schedule?.block1, month: e.target.value } } } } as any)} />
                         <input type="text" placeholder="2, 17 y 30" className="w-full p-3 bg-white rounded-xl font-bold text-xs border-none shadow-sm mt-2" value={editConfig?.content?.schedule?.block1?.days || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block1: { ...editConfig?.content?.schedule?.block1, days: e.target.value } } } } as any)} />
                      </div>
                      
                      {/* Bloque 2 */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.block', { num: 2 })}</label>
                         <input type="text" placeholder="FEBRERO" className="w-full p-3 bg-white rounded-xl font-bold text-sm border-none shadow-sm" value={editConfig?.content?.schedule?.block2?.month || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block2: { ...editConfig?.content?.schedule?.block2, month: e.target.value } } } } as any)} />
                         <input type="text" placeholder="10 y 21" className="w-full p-3 bg-white rounded-xl font-bold text-xs border-none shadow-sm mt-2" value={editConfig?.content?.schedule?.block2?.days || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block2: { ...editConfig?.content?.schedule?.block2, days: e.target.value } } } } as any)} />
                      </div>

                      {/* Bloque 3 */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.block', { num: 3 })}</label>
                         <input type="text" placeholder="MARZO" className="w-full p-3 bg-white rounded-xl font-bold text-sm border-none shadow-sm" value={editConfig?.content?.schedule?.block3?.month || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block3: { ...editConfig?.content?.schedule?.block3, month: e.target.value } } } } as any)} />
                         <input type="text" placeholder="7 y 24" className="w-full p-3 bg-white rounded-xl font-bold text-xs border-none shadow-sm mt-2" value={editConfig?.content?.schedule?.block3?.days || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block3: { ...editConfig?.content?.schedule?.block3, days: e.target.value } } } } as any)} />
                      </div>

                      {/* Bloque 4 */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.scanner.block', { num: 4 })}</label>
                         <input type="text" placeholder="ABRIL" className="w-full p-3 bg-white rounded-xl font-bold text-sm border-none shadow-sm" value={editConfig?.content?.schedule?.block4?.month || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block4: { ...editConfig?.content?.schedule?.block4, month: e.target.value } } } } as any)} />
                         <input type="text" placeholder="11, 18 y 28" className="w-full p-3 bg-white rounded-xl font-bold text-xs border-none shadow-sm mt-2" value={editConfig?.content?.schedule?.block4?.days || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, schedule: { ...editConfig?.content?.schedule, block4: { ...editConfig?.content?.schedule?.block4, days: e.target.value } } } } as any)} />
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.star_rates_title')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.rate_air_es_gq')}</label>
                         <input type="text" placeholder="11€/Kg" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.starRates?.air_es_gq || ''} onChange={e => {
                            const val = e.target.value;
                            const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                            setEditConfig({ ...editConfig, starRates: { ...editConfig?.starRates, air_es_gq: val }, rates: { ...editConfig?.rates, air: { ...editConfig?.rates?.air, es_gq: num } } } as any);
                         }} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.rate_sea_es_gq')}</label>
                         <input type="text" placeholder="4€/Kg" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.starRates?.sea_es_gq || ''} onChange={e => {
                            const val = e.target.value;
                            const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                            setEditConfig({ ...editConfig, starRates: { ...editConfig?.starRates, sea_es_gq: val }, rates: { ...editConfig?.rates, sea: { ...editConfig?.rates?.sea, es_gq: num } } } as any);
                         }} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.rate_kg_cm_gq')}</label>
                         <input type="text" placeholder="3000 XAF" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.starRates?.kg_cm_gq || ''} onChange={e => {
                            const val = e.target.value;
                            const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                            setEditConfig({ ...editConfig, starRates: { ...editConfig?.starRates, kg_cm_gq: val }, rates: { ...editConfig?.rates, air: { ...editConfig?.rates?.air, cm_gq: num } } } as any);
                         }} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.rate_docs_gq_es')}</label>
                         <input type="text" placeholder="15€" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.starRates?.docs_gq_es || ''} onChange={e => {
                            const val = e.target.value;
                            const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                            setEditConfig({ ...editConfig, starRates: { ...editConfig?.starRates, docs_gq_es: val }, rates: { ...editConfig?.rates, air: { ...editConfig?.rates?.air, gq_es: num } } } as any);
                         }} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.rate_bulto_23kg')}</label>
                         <input type="text" placeholder="220€" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.starRates?.bulto_23kg || ''} onChange={e => {
                            const val = e.target.value;
                            const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                            setEditConfig({ ...editConfig, starRates: { ...editConfig?.starRates, bulto_23kg: val }, rates: { ...editConfig?.rates, bulto: { ...editConfig?.rates?.bulto, kg23: num } } } as any);
                         }} />
                      </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.rate_bulto_32kg')}</label>
                          <input type="text" placeholder="310€" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.starRates?.bulto_32kg || ''} onChange={e => {
                              const val = e.target.value;
                              const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                              setEditConfig({ ...editConfig, starRates: { ...editConfig?.starRates, bulto_32kg: val }, rates: { ...editConfig?.rates, bulto: { ...editConfig?.rates?.bulto, kg32: num } } } as any);
                           }} />
                       </div>
                   </div>
                   <button onClick={() => updateConfig?.(editConfig as any).then(() => alert(t('common.success')))} className="mt-8 w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-500/20 active:scale-95 transition-all">{t('admin.save_web_changes')}</button>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.social_networks')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.whatsapp_number')}</label>
                         <input type="text" title={t('admin.whatsapp_number_link')} placeholder="Ej: 34643521042" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.content?.social?.whatsapp || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, social: { ...editConfig?.content?.social, whatsapp: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.instagram_link')}</label>
                         <input type="text" title={t('admin.instagram_link')} placeholder="https://instagram.com/..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.content?.social?.instagram || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, social: { ...editConfig?.content?.social, instagram: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.tiktok_link')}</label>
                         <input type="text" title={t('admin.tiktok_link')} placeholder="https://tiktok.com/..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.content?.social?.tiktok || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, social: { ...editConfig?.content?.social, tiktok: e.target.value } } } as any)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.facebook_link')}</label>
                         <input type="text" title={t('admin.facebook_link')} placeholder="https://facebook.com/..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" value={editConfig?.content?.social?.facebook || ''} onChange={e => setEditConfig({ ...editConfig, content: { ...editConfig?.content, social: { ...editConfig?.content?.social, facebook: e.target.value } } } as any)} />
                      </div>
                   </div>
                   <button onClick={() => updateConfig?.(editConfig as any).then(() => alert(t('common.success')))} className="mt-6 w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-500/20 active:scale-95 transition-all">{t('admin.save_web_changes')}</button>
                </div>
             </div>
          )}

          {activeTab === 'config' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <div className="bg-[#00151a] p-10 rounded-[3rem] text-white shadow-2xl shadow-teal-900/40 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-10 border-l-4 border-teal-500 pl-6">{t('admin.system_config')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-6">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-4">{t('admin.op_rates_title')}</h4>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('admin.op_rate_air_es')}</span>
                                  <input type="number" placeholder="11" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={editConfig?.rates?.air?.es_gq || ''} onChange={e => {
                                      const num = parseFloat(e.target.value) || 0;
                                      setEditConfig({ ...editConfig, rates: { ...editConfig?.rates, air: { ...editConfig?.rates?.air, es_gq: num } }, starRates: { ...editConfig?.starRates, air_es_gq: num + "€/Kg" } } as any);
                                   }} />
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('admin.op_rate_sea_es')}</span>
                                  <input type="number" placeholder="4" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={editConfig?.rates?.sea?.es_gq || ''} onChange={e => {
                                      const num = parseFloat(e.target.value) || 0;
                                      setEditConfig({ ...editConfig, rates: { ...editConfig?.rates, sea: { ...editConfig?.rates?.sea, es_gq: num } }, starRates: { ...editConfig?.starRates, sea_es_gq: num + "€/Kg" } } as any);
                                   }} />
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('admin.op_rate_air_cm')}</span>
                                  <input type="number" placeholder="3000" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={editConfig?.rates?.air?.cm_gq || ''} onChange={e => {
                                      const num = parseFloat(e.target.value) || 0;
                                      setEditConfig({ ...editConfig, rates: { ...editConfig?.rates, air: { ...editConfig?.rates?.air, cm_gq: num } }, starRates: { ...editConfig?.starRates, kg_cm_gq: num + " XAF" } } as any);
                                   }} />
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('admin.op_rate_bulto_23')}</span>
                                  <input type="number" placeholder="220" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={editConfig?.rates?.bulto?.kg23 || ''} onChange={e => {
                                      const num = parseFloat(e.target.value) || 0;
                                      setEditConfig({ ...editConfig, rates: { ...editConfig?.rates, bulto: { ...editConfig?.rates?.bulto, kg23: num } }, starRates: { ...editConfig?.starRates, bulto_23kg: num + "€" } } as any);
                                   }} />
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('admin.op_rate_bulto_32')}</span>
                                  <input type="number" placeholder="310" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={editConfig?.rates?.bulto?.kg32 || ''} onChange={e => {
                                      const num = parseFloat(e.target.value) || 0;
                                      setEditConfig({ ...editConfig, rates: { ...editConfig?.rates, bulto: { ...editConfig?.rates?.bulto, kg32: num } }, starRates: { ...editConfig?.starRates, bulto_32kg: num + "€" } } as any);
                                   }} />
                               </div>
                            </div>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-4">{t('admin.exchange_rates')}</h4>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">EUR ➜ CFA</span>
                                  <input type="number" title={t('admin.eur_cfa_rate')} placeholder="655" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-24 text-center font-black" value={editConfig?.rates?.exchange?.eur_xaf || 655} onChange={e => setEditConfig({ ...editConfig, rates: { ...editConfig?.rates, exchange: { ...editConfig?.rates?.exchange, eur_xaf: parseFloat(e.target.value) } } } as any)} />
                               </div>
                            </div>
                         </div>
                         <div className="mt-4">
                            <button onClick={() => updateConfig?.(editConfig as any).then(() => alert(t('common.success')))} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-500/20 active:scale-95 transition-all">{t('admin.save_system_config')}</button>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-2">{t('admin.shipping_dates_moved')}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('admin.edit_dates_web_calendar')}</p>
                         </div>
                      </div>
                      <div className="space-y-6 text-center flex flex-col items-center justify-center">
                         <div className="w-40 h-40 bg-teal-500/20 rounded-full flex items-center justify-center border-4 border-teal-500 shadow-2xl shadow-teal-500/30">
                            <span className="text-6xl font-black">⚙️</span>
                         </div>
                         <h4 className="text-lg font-black uppercase tracking-widest mt-4">{t('admin.logistic_engine')}</h4>
                         <p className="text-[10px] text-teal-400/60 font-black uppercase tracking-widest">{t('admin.route_optimizing')}</p>
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
                       <h3 className="text-3xl md:text-4xl font-black text-teal-900 tracking-tighter uppercase italic leading-none mb-4">{t('admin.logistic_scanner')}</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 max-w-sm">{t('admin.manage_shipments_qr')}</p>

                       {/* Mode Switcher */}
                       <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-10 w-full max-w-xs transition-all border border-gray-200 shadow-inner">
                          <button 
                             onClick={() => setOperationalInputMode('qr')}
                             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${operationalInputMode === 'qr' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                             {t('admin.qr_camera')}
                          </button>
                          <button 
                             onClick={() => setOperationalInputMode('manual')}
                             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${operationalInputMode === 'manual' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                             {t('admin.manual_code')}
                          </button>
                       </div>
                       
                       {operationalInputMode === 'qr' ? (
                          <div className="w-full max-w-md bg-[#011a1f] p-4 rounded-[3rem] mb-10 relative shadow-2xl border-4 border-[#01242b]">
                             <div id="reader" className="w-full aspect-square overflow-hidden rounded-[2.5rem] bg-black">
                                {!isScanning && (
                                   <div className="h-full flex flex-col items-center justify-center text-white p-10">
                                      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 mb-6">{t('admin.starting_camera')}</p>
                                      <button onClick={startScanner} className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all">{t('admin.retry_camera')}</button>
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
                             <p className="mt-6 text-[9px] font-bold text-teal-500/60 uppercase tracking-widest">{t('admin.point_qr')}</p>
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
                                   title={t('admin.search_code')}
                                   className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center hover:bg-teal-700 transition-all shadow-lg active:scale-90">
                                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7M3 12h18"/></svg>
                                </button>
                             </div>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.write_code_enter')}</p>
                          </div>
                       )}

                       {scannedShipment && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full p-8 bg-teal-50 rounded-[3rem] border border-teal-100 shadow-xl text-left border-b-4 border-b-teal-500">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                   <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{t('admin.package_identified')}</p>
                                   <h4 className="text-3xl font-black text-teal-900 tracking-tighter uppercase italic leading-none">{scannedShipment.trackingNumber}</h4>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(scannedShipment.status)}`}>{scannedShipment.status}</span>
                             </div>
                             <div className="grid grid-cols-2 gap-6 text-[11px] font-black uppercase text-teal-800 mb-8 italic tracking-tight">
                                <div className="p-4 bg-white rounded-2xl border border-teal-100/50">
                                   <p className="text-[8px] text-teal-400 mb-1">{t('admin.journey')}</p>
                                   📦 {scannedShipment.origin} ➔ {scannedShipment.destination}
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-teal-100/50">
                                   <p className="text-[8px] text-teal-400 mb-1">{t('shipping.weight')}</p>
                                   ⚖️ {scannedShipment.weight} KG
                                </div>
                                <div className="col-span-2 p-4 bg-white rounded-2xl border border-teal-100/50">
                                   <p className="text-[8px] text-teal-400 mb-1">{t('shipping.recipient')}</p>
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
                                   {t('admin.mark_arrived')}
                                </button>
                                <button onClick={() => setScannedShipment(null)} className="px-8 py-5 bg-white text-gray-400 rounded-2xl font-black uppercase text-[10px] border border-gray-100 hover:bg-gray-50 transition-all">{t('common.close')}</button>
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
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">{t('admin.executive_reports')}</h3>
                      <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] border-l-2 border-teal-500 pl-3">{t('admin.logistic_performance')}</p>
                   </div>
                   <button onClick={exportToExcel} className="px-8 py-3 bg-[#00151a] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-900 transition-all shadow-xl">{t('admin.export_data')}</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10 pb-2 border-b">{t('admin.shipment_evolution')}</h4>
                      <div className="h-64 flex items-end justify-between gap-4 px-4 overflow-hidden">
                         {[65, 80, 45, 90, 100, 70, 85, 95, 110, 80, 90, 120].map((h, i) => (
                            <div key={i} className="w-full bg-teal-500/10 rounded-t-xl relative group">
                               <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 1 }} className="absolute bottom-0 left-0 right-0 bg-teal-500 rounded-t-xl group-hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"></motion.div>
                            </div>
                         ))}
                      </div>
                      <div className="flex justify-between mt-6 text-[9px] font-black text-gray-300 uppercase tracking-widest px-2">
                         <span>{t('common.jan')}</span><span>{t('common.feb')}</span><span>{t('common.mar')}</span><span>{t('common.apr')}</span><span>{t('common.may')}</span><span>{t('common.jun')}</span><span>{t('common.jul')}</span><span>{t('common.aug')}</span><span>{t('common.sep')}</span><span>{t('common.oct')}</span><span>{t('common.nov')}</span><span>{t('common.dec')}</span>
                      </div>
                   </div>
                   
                   <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                         <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
                      </div>
                      <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-12">{t('admin.market_share')}</h4>
                      <div className="space-y-6 relative z-10">
                         {[
                           { name: t('admin.air_spain'), val: '72%', color: 'bg-teal-500' },
                           { name: t('admin.maritime_bio'), val: '18%', color: 'bg-indigo-500' },
                           { name: t('admin.regional_cm'), val: '10%', color: 'bg-orange-500' }
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
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">{t('admin.collective_packages')}</h3>
                   <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">{t('admin.generate_qr_master')}</p>
                   <div className="flex gap-4 mt-8">
                     <button onClick={() => setManifestTab('create')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${manifestTab === 'create' ? 'bg-teal-500 text-white shadow-lg' : 'bg-white/10 text-teal-300'}`}>{t('admin.create_collective')}</button>
                     <button onClick={() => setManifestTab('scan')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${manifestTab === 'scan' ? 'bg-teal-500 text-white shadow-lg' : 'bg-white/10 text-teal-300'}`}>{t('admin.scan_update')}</button>
                   </div>
                </div>

                {manifestTab === 'create' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Left: Package Selection */}
                     <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-2 border-l-4 border-teal-500 pl-4">{t('admin.select_packages')}</h4>
                        <div className="flex gap-2 mb-6 mt-4">
                           {['all', 'Malabo', 'Bata'].map(dest => (
                             <button key={dest} onClick={() => setManifestDestFilter(dest as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${manifestDestFilter === dest ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{dest === 'all' ? t('common.all') : dest}</button>
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
                        {allShipments.length === 0 && <p className="text-center text-gray-300 font-bold italic text-sm py-8">{t('admin.no_packages_available')}</p>}
                     </div>

                     {/* Right: Create / Preview */}
                     <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6 border-l-4 border-teal-500 pl-4">{t('admin.configure_bundle')}</h4>
                        <div className="space-y-4 flex-1">
                           <div>
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-2 mb-1">{t('admin.container_description')}</label>
                             <input type="text" title={t('admin.collective_bundle_description')} placeholder="Ej: Contenedor Nov-2025 Malabo" value={manifestDescription} onChange={e => setManifestDescription(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm" />
                           </div>
                           <div className="p-4 bg-teal-50 rounded-2xl">
                             <p className="text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1">{t('admin.selected_packages')}</p>
                             <p className="text-2xl font-black text-teal-900">{selectedForManifest.length}</p>
                           </div>
                           <div className="p-4 bg-orange-50 rounded-2xl">
                             <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">{t('admin.for_bata')}</p>
                             <p className="text-lg font-black text-orange-800">{allShipments.filter(s => selectedForManifest.includes(s._id) && s.destination?.toLowerCase().includes('bata')).length} {t('common.packages')}</p>
                           </div>
                           <div className="p-4 bg-teal-50 rounded-2xl">
                             <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">{t('admin.for_malabo')}</p>
                             <p className="text-lg font-black text-teal-800">{allShipments.filter(s => selectedForManifest.includes(s._id) && !s.destination?.toLowerCase().includes('bata')).length} {t('common.packages')}</p>
                           </div>
                        </div>
                        <button onClick={handleCreateManifest} disabled={isCreatingManifest || selectedForManifest.length === 0} className="mt-6 w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-teal-500/20">
                           {isCreatingManifest ? t('common.processing') : `${t('admin.generate_qr_collective')} (${selectedForManifest.length})`}
                        </button>

                        {createdManifest && (
                          <div className="mt-6 p-6 bg-[#00151a] text-white rounded-3xl text-center space-y-4 shadow-xl border border-teal-500/30">
                             <p className="text-[9px] font-black uppercase tracking-widest text-teal-400">✅ {t('admin.bundle_created')}</p>
                             <p className="font-black text-lg">{createdManifest.manifestId}</p>
                             <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner">
                               <QRCodeCanvas value={createdManifest.manifestId} size={180} bgColor="#ffffff" fgColor="#00151a" />
                             </div>
                             <p className="text-[8px] text-teal-300 font-bold uppercase tracking-widest">{t('admin.scan_qr_guinea_update')}</p>
                             <div className="flex gap-2">
                                <button onClick={() => window.print()} className="flex-1 py-2 bg-teal-500 text-[#00151a] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-400 transition-colors">{t('common.print_qr')}</button>
                                <button onClick={() => setCreatedManifest(null)} className="flex-1 py-2 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">{t('common.close')}</button>
                             </div>
                             <p className="text-[9px] text-gray-400 font-bold italic">{createdManifest.shipments?.length || 0} {t('common.packages_included')}</p>
                          </div>
                        )}
                     </div>
                  </div>
                )}

                {manifestTab === 'scan' && (
                  <div className="max-w-2xl mx-auto space-y-6">
                     <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6 border-l-4 border-teal-500 pl-4">{t('admin.scan_search_collective')}</h4>
                        <div className="flex gap-3">
                           <input type="text" title={t('admin.collective_bundle_id')} placeholder="Ej: BB-MAN-123456AB" value={manifestScanInput} onChange={e => setManifestScanInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLookupManifest(manifestScanInput)} className="flex-1 p-4 bg-gray-50 rounded-2xl font-black text-sm" />
                           <button onClick={() => handleLookupManifest(manifestScanInput)} className="px-6 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/10">{t('common.search')}</button>
                        </div>
                     </div>

                     {scannedManifest && (
                       <div className="bg-white p-8 rounded-[3rem] border border-teal-100 shadow-2xl animate-in slide-in-from-top-4">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                               <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] mb-1">{t('admin.bundle_found')}</p>
                               <h4 className="text-3xl font-black text-teal-900 tracking-tighter italic uppercase">{scannedManifest.manifestId}</h4>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{scannedManifest.shipments?.length} {t('common.packages')} · {t('common.status')}: <span className="text-teal-600 font-black">{scannedManifest.status}</span></p>
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
                                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{t('common.packages')}</p>
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
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2">{t('admin.update_all_packages')}:</p>
                                <select title={t('admin.new_status_all_packages')} value={manifestStatusUpdate} onChange={e => setManifestStatusUpdate(e.target.value)} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-3xl text-sm font-black uppercase tracking-widest outline-none transition-all shadow-inner">
                                   <option value="Pendiente">{t('shipping.status.pending')}</option>
                                   <option value="En tránsito">{t('shipping.status.in_transit')}</option>
                                   <option value="En Aduanas">{t('shipping.status.in_customs')}</option>
                                   <option value="Llegado a destino">{t('shipping.status.arrived')}</option>
                                   <option value="Entregado">{t('shipping.status.delivered')}</option>
                                </select>
                              </div>
                              <button onClick={handleManifestStatusUpdate} className="w-full py-6 bg-teal-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-teal-700 transition-all shadow-2xl shadow-teal-500/30 hover:scale-[1.02] active:scale-95">
                                 ✅ {t('admin.update_packages_at_once', { count: scannedManifest.shipments?.length || 0 })}
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
                         <h3 className="text-3xl font-black text-teal-900 tracking-tighter uppercase italic leading-none mb-1">{t('admin.pickup_management')}</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.warehouse_control')}</p>
                      </div>
                   </div>
                   
                   <div className="relative mb-8">
                      <input type="text" placeholder={t('admin.search_pickup_placeholder')} title={t('admin.search_pickups')} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-3xl text-sm font-bold outline-none transition-all shadow-inner" value={pickupSearch} onChange={e => setPickupSearch(e.target.value)} />
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
                                  <p className="text-[9px] font-bold text-gray-400 italic">{t('common.current_status')}: {ship.status}</p>
                               </div>
                            </div>
                            <button className="px-8 py-3 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform active:scale-95">{t('admin.receive_warehouse')}</button>
                         </div>
                      ))}
                      {allShipments.length === 0 && <div className="text-center py-20 text-gray-300 font-bold italic uppercase tracking-widest">{t('admin.no_active_records_found')}</div>}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'branding' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 italic-none">
                   <h3 className="text-xl font-black text-teal-900 uppercase italic tracking-tighter mb-8 border-l-4 border-teal-500 pl-4">{t('admin.visual_identity')}</h3>
                   <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.company_logo_text')}</label>
                            <input type="text" title={t('admin.logo_text')} placeholder="ej: BV" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={config.logoText} onChange={e => setConfig({ ...config, logoText: e.target.value })} />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('admin.custom_logo_image')}</label>
                            <div className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative">
                               {config.customLogoUrl ? <img src={config.customLogoUrl} className="h-12 object-contain" alt="Logo" /> : <span className="text-gray-300 font-black">{t('admin.upload_logo')}</span>}
                               <input type="file" title={t('admin.upload_logo')} className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e, 'logo')} />
                            </div>
                         </div>
                      </div>
                      <button onClick={() => alert(t('common.success'))} title={t('admin.save_identity')} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-500/20">{t('admin.save_identity')}</button>
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
