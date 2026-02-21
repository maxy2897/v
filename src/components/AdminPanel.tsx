
import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, AppConfig, ShippingStatus } from '../../types';
import { AdminNotifications } from './AdminNotifications';
import { createNotification } from '../services/notificationsApi';
import { createProduct as apiCreateProduct, deleteProduct as apiDeleteProduct, getProducts } from '../services/productsApi';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';

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
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}



const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, products, setProducts, config, setConfig }) => {
  const { appConfig, updateConfig, language } = useSettings();
  const [activeTab, setActiveTab] = useState<'products' | 'branding' | 'reports' | 'config' | 'content' | 'operational' | 'transactions' | 'shipments' | 'notifications' | 'pickup' | 'pos'>('products');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [shipmentGroups, setShipmentGroups] = useState<UserShipmentGroup[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserShipmentGroup | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedTxFolder, setSelectedTxFolder] = useState<string | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [pickupShipment, setPickupShipment] = useState<Shipment | null>(null);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [adminNotification, setAdminNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminNotification({ message, type });
    setTimeout(() => setAdminNotification(null), 3000);
  };

  // Direct Notification State
  const [directNotifModal, setDirectNotifModal] = useState<{ userId: string, name: string } | null>(null);
  const [directNotifData, setDirectNotifData] = useState({ title: '', message: '', type: 'info' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const [posData, setPosData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderId: '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    origin: 'España' as 'España' | 'Camerún' | 'Guinea Ecuatorial',
    destination: 'Malabo' as 'Malabo' | 'Bata',
    type: 'Aéreo' as 'Aéreo' | 'Marítimo',
    weight: 0,
    calcMode: 'kg' as 'kg' | 'bulto' | 'documento',
    description: '',
    paymentMethod: 'Almacén',
    paymentLocation: 'Origen'
  });

  React.useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'shipments') {
      fetchShipments();
    }
  }, [activeTab]);

  const fetchShipments = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/shipments?status=all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Shipment[] = await res.json();
        setAllShipments(data);

        // Group by User
        const groups: Record<string, UserShipmentGroup> = {};

        data.forEach(shipment => {
          if (!shipment.user) return; // Skip if no user (should rely on populate)
          const userId = shipment.user._id;

          if (!groups[userId]) {
            groups[userId] = {
              userId,
              user: shipment.user,
              shipments: []
            };
          }
          groups[userId].shipments.push(shipment);
        });

        setShipmentGroups(Object.values(groups));
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const handlePickupSearch = async (tracking?: string) => {
    const term = (tracking || pickupSearch).trim().toUpperCase();
    if (!term) return;

    setIsSearchingPickup(true);
    setPickupShipment(null);
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/shipments/tracking/${term}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPickupShipment(data);
      } else {
        showToast('No se encontró ningún paquete con ese código.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al buscar el paquete.', 'error');
    } finally {
      setIsSearchingPickup(false);
    }
  };

  const deliverShipment = async (id: string) => {
    // Keep confirmation for safety on delivery
    if (!confirm('¿Confirmar entrega del paquete al cliente?')) return;
    try {
      await updateShipmentStatus(id, 'Entregado', true);
      if (pickupShipment && pickupShipment._id === id) {
        setPickupShipment({ ...pickupShipment, status: 'Entregado' });
      }
      showToast('✅ Paquete marcado como ENTREGADO');
    } catch (error) {
      console.error(error);
      showToast('Error al procesar la entrega', 'error');
    }
  };

  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    const scannerId = "qr-reader";

    if (activeTab === 'pickup' && !pickupShipment) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scannerId);
        if (!element) return;

        html5QrCode = new Html5Qrcode(scannerId);

        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setPickupSearch(decodedText);
            setScannedResult(decodedText);
            handlePickupSearch(decodedText);
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().catch(err => console.error(err));
            }
          },
          () => { } // silent scan errors
        ).catch(err => {
          console.error("No se pudo iniciar el escáner:", err);
        });
      }, 400);

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          if (html5QrCode.isScanning) {
            html5QrCode.stop()
              .then(() => html5QrCode?.clear())
              .catch(err => console.error(err));
          } else {
            html5QrCode.clear();
          }
        }
      };
    }
  }, [activeTab, pickupShipment]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'En tránsito':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En Aduanas':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Recogido':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatus: string, silent: boolean = false) => {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : '';

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Update local state
        const updatedGroups = shipmentGroups.map(group => ({
          ...group,
          shipments: group.shipments.map(s =>
            s._id === shipmentId ? { ...s, status: newStatus } : s
          )
        }));

        setShipmentGroups(updatedGroups);
        setAllShipments(prev => prev.map(s => s._id === shipmentId ? { ...s, status: newStatus } : s));

        // Update selected group view if active
        if (selectedUserGroup) {
          const updatedSelected = updatedGroups.find(g => g.userId === selectedUserGroup.userId);
          if (updatedSelected) setSelectedUserGroup(updatedSelected);
        }

        if (!silent) showToast('Estado actualizado correctamente');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const fetchTransactions = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getShippingDates = () => {
    const dates: Date[] = [];
    if (!appConfig) return dates;

    // From appConfig.dates
    if (appConfig.dates?.nextAirDeparture) dates.push(new Date(appConfig.dates.nextAirDeparture));
    if (appConfig.dates?.nextSeaDeparture) dates.push(new Date(appConfig.dates.nextSeaDeparture));

    // From appConfig.content.schedule
    const schedule = appConfig.content?.schedule;
    const blocks = schedule ? [schedule.block1, schedule.block2, schedule.block3, schedule.block4] : [
      { month: 'DICIEMBRE 2025', days: '12, 19' },
      { month: 'ENERO 2026', days: '2, 17, 30' },
      { month: 'FEBRERO 2026', days: '13, 27' },
      { month: 'MARZO 2026', days: '13, 27' }
    ];

    blocks.forEach((block: any) => {
      if (block?.month && block?.days) {
        const days = block.days.split(/[,y\s]+/).map((d: string) => d.trim()).filter((d: string) => d && !isNaN(Number(d)));
        const monthMap: Record<string, number> = {
          'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3, 'MAYO': 4, 'JUNIO': 5,
          'JULIO': 6, 'AGOSTO': 7, 'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
        };
        const parts = block.month.toUpperCase().split(' ');
        const monthName = parts[0];
        const year = parseInt(parts[1]) || 2026;
        const monthIndex = monthMap[monthName] ?? 0;

        days.forEach((dayStr: string) => {
          dates.push(new Date(year, monthIndex, parseInt(dayStr)));
        });
      }
    });

    return dates.sort((a, b) => a.getTime() - b.getTime());
  };

  const getAssignedFolder = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const shippingDates = getShippingDates();

    // The folder date is the first shipping date >= createdDate
    // We compare only dates (not times) to ensure same-day items go into today's ship folder if applicable
    const targetDate = shippingDates.find(d => {
      const cmpDate = new Date(d);
      cmpDate.setHours(23, 59, 59, 999); // Until the end of that day
      return cmpDate >= createdDate;
    });

    if (!targetDate) return "PRÓXIMOS ENVÍOS";

    return `ENVÍO DEL ${targetDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase()}`;
  };

  const downloadReceipt = async (id: string) => {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/transactions/${id}/receipt`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error downloading');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${id}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('Error al descargar recibo');
    }
  };

  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ['Fecha', 'Hora', 'Tipo', 'Usuario', 'Teléfono', 'Detalle', 'Monto', 'Moneda'];
      const rows = transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        new Date(tx.createdAt).toLocaleTimeString(),
        tx.type === 'SHIPMENT' ? 'Envío' : tx.type === 'TRANSFER' ? 'Dinero' : 'Tienda',
        tx.user?.name || 'N/A',
        tx.user?.phone || 'N/A',
        tx.type === 'SHIPMENT' ? `Rastreo: ${tx.details?.trackingNumber}` :
          tx.type === 'TRANSFER' ? `Dest: ${tx.details?.beneficiary}` : 'Compra',
        tx.amount,
        tx.currency || '€'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('Error al exportar a Excel');
    }
  };

  const handleSendDirectNotif = async () => {
    if (!directNotifModal) return;
    if (!directNotifData.title || !directNotifData.message) {
      alert('Por favor, rellena todos los campos');
      return;
    }

    setSendingNotif(true);
    try {
      await createNotification({
        ...directNotifData,
        userId: directNotifModal.userId
      });
      showToast('✅ Notificación enviada correctamente');
      setDirectNotifModal(null);
      setDirectNotifData({ title: '', message: '', type: 'info' });
    } catch (error) {
      console.error(error);
      showToast('Error al enviar la notificación', 'error');
    } finally {
      setSendingNotif(false);
    }
  };

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 500;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'logo' | 'hero' | 'money') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedBase64 = await resizeImage(file);
        if (target === 'product') {
          setNewProduct({ ...newProduct, image: resizedBase64 });
        } else if (target === 'logo') {
          setConfig({ ...config, customLogoUrl: resizedBase64 });
        } else if (target === 'hero' && appConfig) {
          updateConfig && updateConfig({
            content: {
              ...appConfig.content,
              hero: { ...appConfig.content.hero, heroImage: resizedBase64 }
            }
          } as any);
        } else if (target === 'money' && appConfig) {
          updateConfig && updateConfig({
            content: {
              ...appConfig.content,
              hero: { ...appConfig.content.hero, moneyTransferImage: resizedBase64 }
            }
          } as any);
        }
      } catch (err) {
        showToast('Error al procesar la imagen. Inténtalo de nuevo.', 'error');
        console.error(err);
      }
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image) {
      showToast('⚠️ Por favor selecciona una imagen para el producto.', 'error');
      return;
    }

    setIsUploading(true); // Start loading
    try {
      const created = await apiCreateProduct(newProduct);
      setProducts([...products, created]);
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
      showToast('✅ Producto añadido con éxito');
    } catch (error: any) {
      console.error('Error detallado:', error);
      showToast('Error al añadir el producto', 'error');
    } finally {
      setIsUploading(false); // Stop loading regardless of outcome
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este producto de forma permanente?')) return;
    setIsDeletingId(id);
    try {
      await apiDeleteProduct(id);
      const updated = await getProducts(); // Refresh list from server
      setProducts(updated);
      showToast('✅ Producto eliminado correctamente');
    } catch (error: any) {
      showToast('Error al eliminar producto: ' + error.message, 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#00151a]/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-6xl h-full md:h-[85vh] rounded-none md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#00151a] text-white flex flex-col justify-between p-6 shrink-0 overflow-y-auto md:h-full">
          <div className="flex flex-col h-full">
            <div className="mb-6 md:mb-10 pl-2 flex justify-between items-center md:block">
              <div>
                <h2 className="text-xl font-black tracking-tighter">Admin Panel</h2>
                <p className="text-teal-400 text-[9px] font-black uppercase tracking-widest mt-1">Gestión Global</p>
              </div>
              <button
                onClick={onClose}
                className="md:hidden text-white/50 hover:text-white"
                aria-label="Cerrar menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
              <button
                onClick={() => setActiveTab('products')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'products' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Productos
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'content' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Contenido
              </button>
              <button
                onClick={() => setActiveTab('operational')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'operational' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Operativo
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'branding' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Marca
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'reports' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Reportes
              </button>
              <button
                onClick={() => setActiveTab('pos')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pos' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Registro Envío (POS)
              </button>
              <button
                onClick={() => setActiveTab('shipments')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'shipments' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                Envíos
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'transactions' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Contabilidad
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'config' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Config
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'notifications' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Notificaciones
              </button>
              <button
                onClick={() => setActiveTab('pickup')}
                className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pickup' ? 'bg-orange-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3 3h3m7.5 12h-9a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 0111.25 3h9a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0120.25 21z" /></svg>
                Recogida 📦
              </button>
            </nav>
          </div>

          <button
            onClick={onClose}
            className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Panel
          </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {/* Top Bar Mobile/Desc */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-[#00151a] uppercase tracking-tighter">
              {activeTab === 'products' ? 'Gestión de Productos' :
                activeTab === 'branding' ? 'Marca y Personalización' :
                  activeTab === 'reports' ? 'Centro de Reportes' :
                    activeTab === 'transactions' ? 'Historial de Transacciones' :
                      activeTab === 'shipments' ? 'Gestión de Envíos' :
                        activeTab === 'notifications' ? 'Sistema de Notificaciones' :
                          activeTab === 'pickup' ? 'Centro de Recogida y Entrega' : 'Configuración Global'}
            </h3>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {adminNotification && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className={`fixed bottom-8 right-8 z-[500] px-6 py-4 rounded-2xl shadow-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 border-2 ${adminNotification.type === 'success'
                  ? 'bg-teal-500 text-white border-teal-400'
                  : 'bg-red-500 text-white border-red-400'
                  }`}
              >
                {adminNotification.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {adminNotification.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-8">
            {activeTab === 'products' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">Añadir Nuevo Producto</h3>
                  <form onSubmit={addProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input aria-label="Nombre del producto" required type="text" placeholder="Nombre del producto" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                      <input aria-label="Precio" required type="text" placeholder="Precio (Ej: 25.000 FCFA)" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    </div>
                    <input aria-label="Color o Variante" required type="text" placeholder="Color / Variante" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={newProduct.color} onChange={e => setNewProduct({ ...newProduct, color: e.target.value })} />
                    <textarea aria-label="Descripción detallada" required placeholder="Descripción detallada" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full h-24 resize-none focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <input aria-label="Tag" type="text" placeholder="Tag (Ej: TOP VENTAS)" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={newProduct.tag} onChange={e => setNewProduct({ ...newProduct, tag: e.target.value })} />
                      <input aria-label="Eslogan" type="text" placeholder="Eslogan (Entre comillas)" className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={newProduct.slogan} onChange={e => setNewProduct({ ...newProduct, slogan: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Imagen del Producto</label>
                      <div className="flex items-center gap-4">
                        {newProduct.image && <img src={newProduct.image} className="w-16 h-16 object-cover rounded-xl border" alt="Vista previa del producto" />}
                        <input required type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} className="text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" title="Subir imagen de producto" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isUploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#00151a] text-white hover:bg-teal-500'
                        }`}
                    >
                      {isUploading ? '⏳ Publicando...' : 'Publicar Producto'}
                    </button>
                  </form>
                </section>

                <section>
                  <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">Productos Actuales</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-teal-200 transition-all">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-200"
                            alt={product.name}
                            onError={(e) => {
                              // Fallback si la imagen no carga (ej: borrada de Cloudinary)
                              e.currentTarget.src = 'https://placehold.co/100x100?text=IMG';
                            }}
                          />
                          <div>
                            <p className="text-sm font-black text-[#00151a] leading-none">{product.name}</p>
                            <p className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-widest">{product.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={isDeletingId === product.id}
                          className={`p-2 transition-colors ${isDeletingId === product.id
                            ? 'text-teal-500 cursor-wait'
                            : 'text-gray-300 hover:text-red-500'
                            }`}
                          title={`Eliminar ${product.name}`}
                        >
                          {isDeletingId === product.id ? (
                            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          )}
                        </button>
                      </div>
                    ))}
                    {products.length === 0 && <p className="text-center text-gray-400 font-bold py-10">No hay productos en la tienda.</p>}
                  </div>
                </section>
              </div>
            ) : activeTab === 'branding' ? (
              <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                  <h3 className="text-sm font-black text-gray-400 mb-8 uppercase tracking-widest text-center">Configuración de Marca</h3>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Texto del Logo</label>
                      <input
                        aria-label="Texto del logo"
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
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" title="Subir archivo de logo" />
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
            ) : activeTab === 'reports' ? (
              <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-gradient-to-br from-[#00151a] to-[#002f3a] p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                  <h3 className="text-2xl font-black mb-2 tracking-tighter">Contabilidad Mensual</h3>
                  <p className="text-gray-400 text-sm font-medium mb-8 max-w-sm">
                    Genera un reporte detallado en Excel (.csv) con todas las transacciones, envíos y registros de usuarios para tu control financiero.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest mb-1">Incluye</p>
                      <ul className="text-xs space-y-1 text-gray-300">
                        <li>• Envíos de Paquetes</li>
                        <li>• Transferencias</li>
                        <li>• Registros Nuevos</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest mb-1">Formato</p>
                      <p className="text-xs text-gray-300">Archivo .CSV compatible con Excel, Numbers y Google Sheets.</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!confirm('¿Descargar reporte de contabilidad completo?')) return;
                      try {
                        const userStr = localStorage.getItem('user');
                        const token = userStr ? JSON.parse(userStr).token : '';

                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/reports/accounting`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });

                        if (!response.ok) throw new Error('Error en la descarga');

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Reporte_Bodipo_${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        alert('Error al descargar el reporte. Verifica que tengas permisos de administrador.');
                        console.error(error);
                      }
                    }}
                    className="w-full bg-teal-500 text-[#00151a] py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-400 transition-all shadow-xl shadow-teal-900/50 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar Excel (.CSV)
                  </button>
                </section>
              </div>
            ) : activeTab === 'content' ? (
              <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-black text-[#00151a] uppercase tracking-widest">Contenido Web</h3>
                    <button
                      onClick={() => updateConfig && appConfig && updateConfig(appConfig)}
                      className="bg-[#00151a] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-500 hover:text-[#00151a] transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Hero Section */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">🏠 Portada (Hero)</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Título Principal</label>
                          <input
                            aria-label="Título Principal"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.content?.hero?.title || ''}
                            onChange={(e) => updateConfig && updateConfig({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, title: e.target.value } } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subtítulo</label>
                          <textarea
                            aria-label="Subtítulo"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm h-24 resize-none"
                            value={appConfig?.content?.hero?.subtitle || ''}
                            onChange={(e) => updateConfig && updateConfig({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, subtitle: e.target.value } } } as any)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Botón Primario</label>
                            <input
                              aria-label="Botón Primario"
                              type="text"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                              value={appConfig?.content?.hero?.ctaPrimary || ''}
                              onChange={(e) => updateConfig && updateConfig({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, ctaPrimary: e.target.value } } } as any)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Botón Secundario</label>
                            <input
                              aria-label="Botón Secundario"
                              type="text"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                              value={appConfig?.content?.hero?.ctaSecondary || ''}
                              onChange={(e) => updateConfig && updateConfig({ content: { ...appConfig?.content, hero: { ...appConfig?.content?.hero, ctaSecondary: e.target.value } } } as any)}
                            />
                          </div>
                        </div>

                        {/* Image Uploaders */}
                        <div className="grid grid-cols-2 gap-6 pt-4">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#007e85] block">Imagen Principal (Hero)</label>
                            <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              {appConfig?.content?.hero?.heroImage && (
                                <img src={appConfig.content.hero.heroImage} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Hero Preview" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'hero')}
                                className="text-[10px] font-bold file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-teal-100 file:text-teal-700 w-full"
                                title="Subir imagen de portada"
                                aria-label="Subir imagen de portada"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#007e85] block">Imagen Money Transfer</label>
                            <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              {appConfig?.content?.hero?.moneyTransferImage && (
                                <img src={appConfig.content.hero.moneyTransferImage} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Money Preview" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'money')}
                                className="text-[10px] font-bold file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-teal-100 file:text-teal-700 w-full"
                                title="Subir imagen de money transfer"
                                aria-label="Subir imagen de money transfer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">🌐 Redes Sociales</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'whatsapp', label: 'WhatsApp Link', icon: 'M3 21l1.65-3.8C2.8 15.4 2.05 13.4 2.05 11.3 2.05 6.4 6.05 2.5 11 2.5c2.4 0 4.6 1 6.3 2.6 1.7 1.7 2.6 3.9 2.6 6.3 0 4.9-4 8.9-8.9 8.9-2 0-3.8-.75-5.3-2L3 21z' },
                          { key: 'instagram', label: 'Instagram Link', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m0 0' },
                          { key: 'tiktok', label: 'TikTok Link', icon: 'M16.7 8.2c.4 0 .9.1 1.3.2V5.2c-.4-.1-.9-.1-1.3-.1-2.5 0-4.6 1.8-5 4.2V2.5h-3v11c0 2.2 1.8 4 4 4s4-1.8 4-4V8.2z' },
                          { key: 'facebook', label: 'Facebook Link', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' }
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
                            <input
                              aria-label={label}
                              type="text"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                              value={appConfig?.content?.social?.[key as 'whatsapp' | 'instagram' | 'tiktok' | 'facebook'] || ''}
                              onChange={(e) => updateConfig && updateConfig({ content: { ...appConfig?.content, social: { ...appConfig?.content?.social, [key]: e.target.value } } } as any)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : activeTab === 'operational' ? (
              <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-black text-[#00151a] uppercase tracking-widest">Datos Operativos</h3>
                    <button
                      onClick={() => updateConfig && appConfig && updateConfig(appConfig)}
                      className="bg-[#00151a] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-500 hover:text-[#00151a] transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">📞 Contacto y Direcciones</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Teléfono España 🇪🇸</label>
                          <input
                            aria-label="Teléfono España"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.contact?.phones?.es || ''}
                            onChange={(e) => updateConfig && updateConfig({ contact: { ...appConfig?.contact, phones: { ...appConfig?.contact?.phones, es: e.target.value } } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Teléfono Guinea Ecuatorial 🇬🇶</label>
                          <input
                            aria-label="Teléfono Guinea Ecuatorial"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.contact?.phones?.gq || ''}
                            onChange={(e) => updateConfig && updateConfig({ contact: { ...appConfig?.contact, phones: { ...appConfig?.contact?.phones, gq: e.target.value } } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Teléfono Camerún 🇨🇲</label>
                          <input
                            aria-label="Teléfono Camerún"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.contact?.phones?.cm || ''}
                            onChange={(e) => updateConfig && updateConfig({ contact: { ...appConfig?.contact, phones: { ...appConfig?.contact?.phones, cm: e.target.value } } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dirección Madrid</label>
                          <textarea
                            aria-label="Dirección Madrid"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm h-20 resize-none"
                            value={appConfig?.contact?.addresses?.es || ''}
                            onChange={(e) => updateConfig && updateConfig({ contact: { ...appConfig?.contact, addresses: { ...appConfig?.contact?.addresses, es: e.target.value } } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dirección Malabo / Bata</label>
                          <textarea
                            aria-label="Dirección Malabo / Bata"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm h-20 resize-none"
                            value={appConfig?.contact?.addresses?.gq || ''}
                            onChange={(e) => updateConfig && updateConfig({ contact: { ...appConfig?.contact, addresses: { ...appConfig?.contact?.addresses, gq: e.target.value } } } as any)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">🏦 Datos Bancarios</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Titular de la Cuenta</label>
                          <input
                            aria-label="Titular de la Cuenta"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.bank?.holder || ''}
                            onChange={(e) => updateConfig && updateConfig({ bank: { ...appConfig?.bank, holder: e.target.value } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Número de Cuenta</label>
                          <input
                            aria-label="Número de Cuenta"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.bank?.accountNumber || ''}
                            onChange={(e) => updateConfig && updateConfig({ bank: { ...appConfig?.bank, accountNumber: e.target.value } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">IBAN</label>
                          <input
                            aria-label="IBAN"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.bank?.iban || ''}
                            onChange={(e) => updateConfig && updateConfig({ bank: { ...appConfig?.bank, iban: e.target.value } } as any)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Bizum</label>
                          <input
                            aria-label="Bizum"
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                            value={appConfig?.bank?.bizum || ''}
                            onChange={(e) => updateConfig && updateConfig({ bank: { ...appConfig?.bank, bizum: e.target.value } } as any)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : activeTab === 'transactions' ? (
              <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">💼 Registro Contable</h3>
                  <button
                    onClick={exportToExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl shadow-green-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Exportar Registros
                  </button>
                </div>

                {/* Transaction Search */}
                <div className="mb-8 relative">
                  <input
                    type="text"
                    placeholder={selectedTxFolder ? "Buscar en esta carpeta..." : "Buscar carpeta por nombre o fecha..."}
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {(() => {
                  const moneyTransfers = transactions.filter(tx => tx.type === 'TRANSFER');
                  const otherTransactions = transactions.filter(tx => tx.type !== 'TRANSFER');

                  const groupedOther = otherTransactions.reduce((groups, tx) => {
                    const dateLabel = getAssignedFolder(tx.createdAt);
                    if (!groups[dateLabel]) groups[dateLabel] = [];
                    groups[dateLabel].push(tx);
                    return groups;
                  }, {} as Record<string, any[]>);

                  if (selectedTxFolder) {
                    let currentTxs = selectedTxFolder === 'MONEY_TRANSFER' ? moneyTransfers : groupedOther[selectedTxFolder];

                    // Filter within folder
                    if (txSearch) {
                      const term = txSearch.toLowerCase();
                      currentTxs = currentTxs.filter(tx =>
                        (tx.user?.name || '').toLowerCase().includes(term) ||
                        (tx.details?.beneficiary || '').toLowerCase().includes(term) ||
                        (tx.details?.trackingNumber || '').toLowerCase().includes(term) ||
                        (tx.details?.description || '').toLowerCase().includes(term) ||
                        tx._id.toLowerCase().includes(term)
                      );
                    }

                    return (
                      <div className="space-y-6">
                        <button onClick={() => setSelectedTxFolder(null)} className="flex items-center gap-2 text-[#007e85] font-black text-sm hover:underline bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 w-fit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                          Volver a Carpetas
                        </button>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                          <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 rounded-2xl ${selectedTxFolder === 'MONEY_TRANSFER' ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600'}`}>
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" /></svg>
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-[#00151a]">{selectedTxFolder === 'MONEY_TRANSFER' ? 'Money Transfers' : selectedTxFolder}</h4>
                              <p className="text-xs font-bold text-gray-400">{currentTxs.length} transacciones registradas</p>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                  <th className="pb-4 pt-2 px-2">Fecha</th>
                                  <th className="pb-4 pt-2 px-2">Usuario</th>
                                  <th className="pb-4 pt-2 px-2">Detalle</th>
                                  <th className="pb-4 pt-2 px-2 text-right">Monto</th>
                                  <th className="pb-4 pt-2 px-2 text-center">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {currentTxs.map(tx => (
                                  <tr key={tx._id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-2">
                                      <p className="text-xs font-black text-[#00151a]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                      <p className="text-[10px] font-bold text-gray-400">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="py-4 px-2">
                                      <p className="text-xs font-black text-gray-700">{tx.user?.name || 'Sistema'}</p>
                                      <p className="text-[10px] font-bold text-gray-400">{tx.user?.phone || 'N/A'}</p>
                                    </td>
                                    <td className="py-4 px-2">
                                      {tx.type === 'TRANSFER' ? (
                                        <div className="space-y-0.5">
                                          <p className="text-[10px] font-black text-orange-600 uppercase">Beneficiario</p>
                                          <p className="text-xs font-bold text-gray-600">{tx.details?.beneficiary || 'N/A'}</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-0.5">
                                          <p className="text-[10px] font-black text-teal-600 uppercase">{tx.type === 'SHIPMENT' ? 'Envío' : 'Tienda'}</p>
                                          <p className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{tx.details?.trackingNumber || tx.details?.description || 'Ref: ' + tx._id.slice(-6)}</p>
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                      <p className="text-sm font-black text-[#00151a]">{tx.amount.toLocaleString()} {tx.currency || '€'}</p>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                      <button
                                        onClick={() => downloadReceipt(tx._id)}
                                        className="inline-flex items-center gap-2 bg-gray-100 hover:bg-[#00151a] hover:text-white transition-all px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Word
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const filteredFolders = Object.entries(groupedOther).filter(([label]) =>
                    !txSearch || label.toLowerCase().includes(txSearch.toLowerCase())
                  );

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {/* Special Folder: Money Transfer */}
                      {(!txSearch || 'money transfer'.includes(txSearch.toLowerCase())) && (
                        <button
                          onClick={() => setSelectedTxFolder('MONEY_TRANSFER')}
                          className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center justify-center gap-4 aspect-square relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
                          <div className="bg-orange-50 p-6 rounded-[2rem] group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
                          </div>
                          <div className="text-center">
                            <h4 className="font-black text-[#00151a] text-sm uppercase tracking-tighter mb-1">Money Transfer</h4>
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full">{moneyTransfers.length} Reg.</span>
                          </div>
                        </button>
                      )}

                      {/* Dynamic Date Folders */}
                      {filteredFolders.map(([dateLabel, txs]: [string, any[]]) => (
                        <button
                          key={dateLabel}
                          onClick={() => setSelectedTxFolder(dateLabel)}
                          className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center justify-center gap-4 aspect-square relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#007e85] to-[#00151a]" />
                          <div className="bg-teal-50 p-6 rounded-[2rem] group-hover:bg-teal-100 transition-all duration-500">
                            <svg className="w-12 h-12 text-[#007e85]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" /></svg>
                          </div>
                          <div className="text-center">
                            <h4 className="font-black text-[#00151a] text-[10px] uppercase tracking-tighter mb-1 line-clamp-2 leading-tight">{dateLabel}</h4>
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full group-hover:bg-[#007e85] group-hover:text-white transition-colors">
                              {txs.length} Operaciones
                            </span>
                          </div>
                        </button>
                      ))}

                      {transactions.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                          <p className="text-gray-400 font-black text-xl">Sin actividad reciente</p>
                          <p className="text-gray-300 text-xs mt-2 uppercase tracking-widest font-bold">Las transacciones aparecerán aquí organizadas</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : activeTab === 'shipments' ? (
              <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Search Input */}
                <div className="mb-8 relative">
                  <input
                    type="text"
                    placeholder="Buscar por seguimiento, cliente, origen..."
                    value={shipmentSearch}
                    onChange={(e) => setShipmentSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-teal-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {(() => {
                  const sortedAll = [...allShipments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                  const groupedAdminShipments = sortedAll.reduce((groups, shipment) => {
                    const dateLabel = getAssignedFolder(shipment.createdAt);
                    if (!groups[dateLabel]) groups[dateLabel] = [];
                    groups[dateLabel].push(shipment);
                    return groups;
                  }, {} as Record<string, Shipment[]>);

                  if (selectedDateFilter === 'MONEY_TRANSFER') {
                    const moneyTx = transactions.filter(tx => tx.type === 'TRANSFER');
                    return (
                      <div className="space-y-6">
                        <button onClick={() => setSelectedDateFilter(null)} className="flex items-center gap-2 text-teal-600 font-black text-sm hover:underline bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                          Volver a Carpetas
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-orange-50 p-3 rounded-xl">
                            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
                          </div>
                          <h3 className="text-xl font-black text-[#00151a]">Money Transfers</h3>
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">{moneyTx.length} registros</span>
                        </div>
                        <div className="space-y-4">
                          {moneyTx.map(tx => (
                            <div key={tx._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-orange-200 transition-all">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded">TRANSFER</span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tx.user?.name || 'Sistema'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-[#00151a]">
                                  <span>{tx.details?.beneficiary || 'N/A'}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-orange-600">{tx.amount.toLocaleString()} {tx.currency || '€'}</span>
                                </div>
                                <p className="text-xs text-gray-500">Destino: {tx.details?.destination || 'N/A'} • IBAN: {tx.details?.iban || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (selectedDateFilter && groupedAdminShipments[selectedDateFilter]) {
                    let group = groupedAdminShipments[selectedDateFilter];

                    // Search within folder
                    if (shipmentSearch) {
                      const term = shipmentSearch.toLowerCase();
                      group = group.filter(s =>
                        s.trackingNumber.toLowerCase().includes(term) ||
                        (s.user?.name || '').toLowerCase().includes(term) ||
                        (s.recipient?.name || '').toLowerCase().includes(term) ||
                        s.origin.toLowerCase().includes(term) ||
                        s.destination.toLowerCase().includes(term)
                      );
                    }
                    return (
                      <div className="space-y-6">
                        <button onClick={() => setSelectedDateFilter(null)} className="flex items-center gap-2 text-teal-600 font-black text-sm hover:underline bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                          Volver a Carpetas
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-teal-50 p-3 rounded-xl">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <h3 className="text-xl font-black text-[#00151a]">{selectedDateFilter}</h3>
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">{group.length} envíos</span>
                        </div>
                        <div className="space-y-4">
                          {group.map(shipment => (
                            <div key={shipment._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-teal-200 transition-all">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-1 rounded">{shipment.trackingNumber}</span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(shipment.createdAt).toLocaleTimeString()}</span>
                                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{shipment.user?.name || 'Usuario desconocido'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-[#00151a]">
                                  <span>{shipment.origin}</span>
                                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                  <span>{shipment.destination}</span>
                                </div>
                                <p className="text-xs text-gray-500"><span className="font-bold">Receptor:</span> {shipment.recipient?.name} ({shipment.recipient?.phone})</p>
                                <p className="text-xs text-gray-500">{shipment.description} • {shipment.weight}Kg • {shipment.price} FCFA</p>
                              </div>
                              <div className="shrink-0 flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="text-right">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Estado</label>
                                  <select
                                    aria-label={`Cambiar estado del envío ${shipment.trackingNumber}`}
                                    value={shipment.status}
                                    onChange={(e) => updateShipmentStatus(shipment._id, e.target.value)}
                                    className="bg-white border border-gray-200 text-[#00151a] text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Recogido">Recogido</option>
                                    <option value="En tránsito">En tránsito</option>
                                    <option value="En Aduanas">En Aduanas</option>
                                    <option value="Llegado a destino">Llegado a destino</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Money Transfer Special Folder */}
                        {(!shipmentSearch || 'money transfers'.includes(shipmentSearch.toLowerCase())) && (
                          <button
                            onClick={() => setSelectedDateFilter('MONEY_TRANSFER')}
                            className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 aspect-square relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
                            <div className="bg-orange-50 p-4 rounded-2xl group-hover:scale-110 transition-all duration-300">
                              <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
                            </div>
                            <div className="text-center w-full">
                              <h4 className="font-bold text-[#00151a] text-sm uppercase tracking-wide mb-2">Money Transfers</h4>
                              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">
                                {transactions.filter(tx => tx.type === 'TRANSFER').length} Reg.
                              </span>
                            </div>
                          </button>
                        )}

                        {Object.entries(groupedAdminShipments)
                          .filter(([label]) => !shipmentSearch || label.toLowerCase().includes(shipmentSearch.toLowerCase()))
                          .map(([date, group]: [string, any[]]) => (
                            <button
                              key={date}
                              onClick={() => setSelectedDateFilter(date)}
                              className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 aspect-square relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="bg-teal-50 p-4 rounded-2xl group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-300">
                                <svg className="w-10 h-10 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" /></svg>
                              </div>
                              <div className="text-center w-full">
                                <h4 className="font-bold text-[#00151a] text-sm md:text-sm line-clamp-2 leading-tight mb-2 uppercase tracking-wide">{date}</h4>
                                <span className="inline-block bg-gray-100 text-gray-500 text-xs font-black px-3 py-1 rounded-full group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                  {group.length} Envíos
                                </span>
                              </div>
                            </button>
                          ))}
                        {Object.keys(groupedAdminShipments).length === 0 && (
                          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            </div>
                            <p className="text-gray-400 font-bold text-lg">No hay envíos registrados.</p>
                            <p className="text-gray-300 text-sm mt-2">Los envíos aparecerán aquí organizados por fecha.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : activeTab === 'notifications' ? (
              <AdminNotifications />
            ) : activeTab === 'pickup' ? (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-[#00151a] mb-6 uppercase tracking-tighter">Gestión de Entrega</h3>

                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Introduce o escanea código de envío..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500 font-bold text-[#00151a] shadow-inner"
                        value={pickupSearch}
                        onChange={(e) => setPickupSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePickupSearch()}
                      />
                      <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button
                      onClick={() => handlePickupSearch()}
                      disabled={isSearchingPickup}
                      className="px-8 py-4 bg-[#00151a] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      {isSearchingPickup ? 'Buscando...' : 'Buscar Paquete'}
                    </button>
                  </div>

                  {!pickupShipment && (
                    <div className="space-y-6">
                      <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3 3h3m7.5 12h-9a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 0111.25 3h9a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0120.25 21z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-orange-900">Apunta con la cámara al código QR del cliente para buscar el paquete automáticamente.</p>
                      </div>
                      <div className="relative group">
                        <div id="qr-reader" className="overflow-hidden rounded-[2.5rem] border-4 border-gray-100 shadow-2xl bg-black aspect-square max-w-sm mx-auto"></div>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="w-48 h-48 border-2 border-teal-500 rounded-3xl animate-pulse"></div>
                          <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mt-4 drop-shadow-lg">Escaneando...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pickupShipment && (
                    <div className="animate-in zoom-in duration-300">
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-[3rem] border-2 border-orange-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                          <button
                            onClick={() => setPickupShipment(null)}
                            className="bg-gray-100 text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors"
                            aria-label="Cerrar vista de paquete"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 shrink-0">
                            <QRCodeCanvas value={pickupShipment.trackingNumber} size={120} level="H" />
                            <p className="text-[10px] font-black text-center mt-3 text-gray-400 tracking-widest">{pickupShipment.trackingNumber}</p>
                          </div>

                          <div className="flex-1 space-y-6 w-full">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-3xl font-black text-[#00151a] tracking-tight">{pickupShipment.recipient?.name}</h4>
                                <p className="text-orange-600 font-bold text-sm">📍 {pickupShipment.destination}</p>
                              </div>
                              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${getStatusColor(pickupShipment.status)}`}>
                                {pickupShipment.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Remitente</p>
                                <p className="text-sm font-bold text-[#00151a]">{pickupShipment.user?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{pickupShipment.user?.phone || 'Sin teléfono'}</p>
                              </div>
                              <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contacto de Entrega</p>
                                <p className="text-sm font-bold text-[#00151a]">{pickupShipment.recipient?.phone || 'Sin teléfono'}</p>
                                <p className="text-xs text-gray-500">Número de contacto para entrega rápida</p>
                              </div>
                            </div>

                            <div className="bg-[#00151a] text-white p-6 rounded-3xl flex justify-between items-center shadow-2xl shadow-teal-900/20">
                              <div>
                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Detalle del Paquete</p>
                                <p className="text-sm font-medium opacity-80">{pickupShipment.description || 'Sin descripción'}</p>
                                <p className="text-xs font-bold mt-2">Peso: {pickupShipment.weight} Kg • Valor: {pickupShipment.price} FCFA</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Registrado el</p>
                                <p className="text-sm font-black">{new Date(pickupShipment.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {pickupShipment.status !== 'Entregado' ? (
                              <button
                                onClick={() => deliverShipment(pickupShipment._id)}
                                className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-95"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Confirmar Entrega al Cliente
                              </button>
                            ) : (
                              <div className="w-full bg-green-50 text-green-700 py-5 rounded-[2rem] border-2 border-green-100 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Paquete ya entregado
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            ) : activeTab === 'pos' ? (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-orange-50 p-4 rounded-2xl text-orange-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#00151a] tracking-tight uppercase">Mostrador de Oficina</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Registro de envíos para clientes presenciales</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Client and Package Form */}
                  <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">📦 Datos del Envío</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block">Origen</label>
                          <select
                            aria-label="Origen del envío"
                            value={posData.origin}
                            onChange={(e) => setPosData({ ...posData, origin: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-sm"
                          >
                            <option value="España">España 🇪🇸</option>
                            <option value="Camerún">Camerún 🇨🇲</option>
                            <option value="Guinea Ecuatorial">Guinea 🇬🇶</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block">Destino</label>
                          <select
                            aria-label="Destino del envío"
                            value={posData.destination}
                            onChange={(e) => setPosData({ ...posData, destination: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-sm"
                          >
                            <option value="Malabo">Malabo 🇬🇶</option>
                            <option value="Bata">Bata 🇬🇶</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['kg', 'bulto', 'documento'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPosData({ ...posData, calcMode: mode as any })}
                            className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${posData.calcMode === mode ? 'bg-[#00151a] text-white border-[#00151a]' : 'bg-white text-gray-400 border-gray-100'}`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {posData.calcMode === 'kg' && (
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setPosData({ ...posData, type: 'Aéreo' })}
                            className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${posData.type === 'Aéreo' ? 'bg-teal-50 text-teal-700 border-teal-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            Aéreo
                          </button>
                          <button
                            onClick={() => setPosData({ ...posData, type: 'Marítimo' })}
                            className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${posData.type === 'Marítimo' ? 'bg-teal-50 text-teal-700 border-teal-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Marítimo
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block">{posData.calcMode === 'kg' ? 'Peso (Kg)' : posData.calcMode === 'bulto' ? 'Tipo de bulto' : 'Precio Documento'}</label>
                        {posData.calcMode === 'kg' ? (
                          <input
                            type="number"
                            placeholder="0.00"
                            value={posData.weight || ''}
                            onChange={(e) => setPosData({ ...posData, weight: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-2xl font-black text-[#00151a]"
                          />
                        ) : posData.calcMode === 'bulto' ? (
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setPosData({ ...posData, weight: 23 })} className={`py-4 rounded-xl border font-black ${posData.weight === 23 ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-gray-50'}`}>23 KG</button>
                            <button onClick={() => setPosData({ ...posData, weight: 32 })} className={`py-4 rounded-xl border font-black ${posData.weight === 32 ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-gray-50'}`}>32 KG</button>
                          </div>
                        ) : (
                          <div className="bg-teal-50 p-4 rounded-xl text-center font-black text-teal-700">TARIFA PLANA 15€</div>
                        )}
                      </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">👤 Datos del Cliente (Remitente)</h4>
                      <input
                        type="text"
                        placeholder="Nombre completo del cliente"
                        value={posData.senderName}
                        onChange={(e) => setPosData({ ...posData, senderName: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Teléfono"
                          value={posData.senderPhone}
                          onChange={(e) => setPosData({ ...posData, senderPhone: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                        />
                        <input
                          type="email"
                          placeholder="Email (Opcional)"
                          value={posData.senderEmail}
                          onChange={(e) => setPosData({ ...posData, senderEmail: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="DNI / NIE / Pasaporte"
                        value={posData.senderId}
                        onChange={(e) => setPosData({ ...posData, senderId: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </section>
                  </div>

                  {/* Right: Summary and Finalize */}
                  <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">🎯 Destinatario</h4>
                      <input
                        type="text"
                        placeholder="Nombre de quien recibe"
                        value={posData.recipientName}
                        onChange={(e) => setPosData({ ...posData, recipientName: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Teléfono destinatario"
                          value={posData.recipientPhone}
                          onChange={(e) => setPosData({ ...posData, recipientPhone: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                        />
                        <input
                          type="email"
                          placeholder="Email Receptor (Opcional)"
                          value={posData.recipientEmail}
                          onChange={(e) => setPosData({ ...posData, recipientEmail: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                        />
                      </div>
                    </section>

                    <section className="bg-[#00151a] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-6">Resumen de Cobro</h4>

                      <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                          <span>Subtotal</span>
                          <span className="text-white">
                            {(() => {
                              if (posData.calcMode === 'kg') {
                                const rate = posData.type === 'Aéreo' ? (appConfig?.rates.air.es_gq || 11) : (appConfig?.rates.sea.es_gq || 4);
                                return (posData.weight * rate).toLocaleString();
                              } else if (posData.calcMode === 'bulto') {
                                return (posData.weight === 23 ? 220 : 310).toLocaleString();
                              } else {
                                return "15";
                              }
                            })()} €
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 border-t border-white/10 pt-4">
                          <span>IVA / Tasas</span>
                          <span className="text-white italic">Incluido</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/10 pt-6">
                          <span className="text-xs font-black uppercase tracking-widest text-teal-400">Total a Pagar</span>
                          <span className="text-5xl font-black tracking-tighter text-white">
                            {(() => {
                              if (posData.calcMode === 'kg') {
                                const rate = posData.type === 'Aéreo' ? (appConfig?.rates.air.es_gq || 11) : (appConfig?.rates.sea.es_gq || 4);
                                return (posData.weight * rate).toLocaleString();
                              } else if (posData.calcMode === 'bulto') {
                                return (posData.weight === 23 ? 220 : 310).toLocaleString();
                              } else {
                                return "15";
                              }
                            })()}€
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!posData.senderName || !posData.recipientName) {
                            showToast('Faltan datos de cliente o destinatario', 'error');
                            return;
                          }
                          setIsUploading(true);
                          try {
                            const price = posData.calcMode === 'kg'
                              ? posData.weight * (posData.type === 'Aéreo' ? (appConfig?.rates.air.es_gq || 11) : (appConfig?.rates.sea.es_gq || 4))
                              : posData.calcMode === 'bulto' ? (posData.weight === 23 ? 220 : 310) : 15;

                            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                            let code = '';
                            for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

                            const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com'}/api/shipments/admin/create-guest`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: JSON.stringify({
                                trackingNumber: `BB-${code}`,
                                origin: posData.origin,
                                destination: posData.destination,
                                weight: posData.calcMode === 'kg' ? posData.weight : posData.weight || 1,
                                price,
                                description: `Envío Mostrador: ${posData.calcMode.toUpperCase()} ${posData.type.toUpperCase()}`,
                                sender: {
                                  name: posData.senderName,
                                  phone: posData.senderPhone,
                                  email: posData.senderEmail,
                                  idNumber: posData.senderId
                                },
                                recipient: {
                                  name: posData.recipientName,
                                  phone: posData.recipientPhone,
                                  email: posData.recipientEmail
                                },
                                currency: 'EUR'
                              })
                            });

                            if (!res.ok) throw new Error('Failed');
                            const data = await res.json();

                            showToast('✅ Registro completado con éxito');
                            if (data.transactionId) await downloadReceipt(data.transactionId);

                            setPosData({
                              senderName: '', senderPhone: '', senderId: '',
                              recipientName: '', recipientPhone: '',
                              origin: 'España', destination: 'Malabo', type: 'Aéreo',
                              weight: 0, calcMode: 'kg', description: '',
                              paymentMethod: 'Almacén', paymentLocation: 'Origen'
                            });
                          } catch (e) {
                            showToast('Error al registrar envío presencial', 'error');
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                        disabled={isUploading}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-[#00151a] py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50"
                      >
                        {isUploading ? 'Procesando...' : 'Finalizar y Generar Factura'}
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-black text-[#00151a] uppercase tracking-widest">Configuración Global</h3>
                    <button
                      onClick={() => updateConfig && appConfig && updateConfig(appConfig)}
                      className="bg-[#00151a] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-500 hover:text-[#00151a] transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Dates Configuration */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">📅 Calendario de Salidas</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Próxima Salida Aérea</label>
                          <input
                            aria-label="Próxima Salida Aérea"
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm focus:ring-2 focus:ring-teal-500"
                            value={appConfig?.dates?.nextAirDeparture ? new Date(appConfig.dates.nextAirDeparture).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateConfig && updateConfig({ dates: { ...appConfig?.dates, nextAirDeparture: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Próxima Salida Marítima</label>
                          <input
                            aria-label="Próxima Salida Marítima"
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm focus:ring-2 focus:ring-teal-500"
                            value={appConfig?.dates?.nextSeaDeparture ? new Date(appConfig.dates.nextSeaDeparture).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateConfig && updateConfig({ dates: { ...appConfig?.dates, nextSeaDeparture: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rates Configuration */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">💶 Tarifas y Cambio</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Aéreo ES &rarr; GQ (€/Kg)</label>
                            <input
                              aria-label="Tarifa Aérea ES a GQ"
                              type="number"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                              value={appConfig?.rates.air.es_gq || 0}
                              onChange={(e) => updateConfig && updateConfig({ rates: { ...appConfig?.rates, air: { ...appConfig?.rates.air, es_gq: parseFloat(e.target.value) } } as any })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Marítimo ES &rarr; GQ (€/Kg)</label>
                            <input
                              aria-label="Tarifa Marítima ES a GQ"
                              type="number"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm"
                              value={appConfig?.rates.sea.es_gq || 0}
                              onChange={(e) => updateConfig && updateConfig({ rates: { ...appConfig?.rates, sea: { ...appConfig?.rates.sea, es_gq: parseFloat(e.target.value) } } as any })}
                            />
                          </div>
                        </div>

                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                          <label className="text-[10px] font-bold text-teal-800 uppercase tracking-widest block mb-1">Tasa de Cambio (1 EUR = X CFA)</label>
                          <input
                            aria-label="Tasa de Cambio"
                            type="number"
                            className="w-full bg-white border border-teal-200 rounded-xl px-4 py-3 font-black text-lg text-teal-900"
                            value={appConfig?.rates.exchange.eur_xaf || 0}
                            onChange={(e) => updateConfig && updateConfig({ rates: { ...appConfig?.rates, exchange: { ...appConfig?.rates.exchange, eur_xaf: parseFloat(e.target.value) } } as any })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Blocks Configuration */}
                  <div className="space-y-6 md:col-span-2">
                    <h4 className="text-sm font-black text-teal-600 uppercase tracking-widest border-b pb-2">🗓️ Resumen Anual (Bloques)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((num) => {
                        const blockKey = `block${num}` as keyof typeof appConfig.content.schedule;
                        return (
                          <div key={num} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-[9px] font-black uppercase text-teal-400 mb-2">Bloque {num}</p>
                            <div className="space-y-2">
                              <input
                                aria-label={`MesBloque${num}`}
                                type="text"
                                placeholder="Mes (Ej: ENERO)"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold"
                                value={appConfig?.content?.schedule?.[blockKey]?.month || ''}
                                onChange={(e) => updateConfig && updateConfig({
                                  content: {
                                    ...appConfig?.content,
                                    schedule: {
                                      ...appConfig?.content?.schedule,
                                      [blockKey]: { ...appConfig?.content?.schedule?.[blockKey], month: e.target.value }
                                    }
                                  }
                                } as any)}
                              />
                              <input
                                aria-label={`DiasBloque${num}`}
                                type="text"
                                placeholder="Días (Ej: 2, 17 y 30)"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium"
                                value={appConfig?.content?.schedule?.[blockKey]?.days || ''}
                                onChange={(e) => updateConfig && updateConfig({
                                  content: {
                                    ...appConfig?.content,
                                    schedule: {
                                      ...appConfig?.content?.schedule,
                                      [blockKey]: { ...appConfig?.content?.schedule?.[blockKey], days: e.target.value }
                                    }
                                  }
                                } as any)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </section>
              </div>
            )}
          </div>
        </div>


        {/* Direct Notification Modal */}
        {
          directNotifModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#00151a]/80 backdrop-blur-sm" onClick={() => setDirectNotifModal(null)} />
              <div className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-xl font-black text-[#00151a] mb-1">Enviar Notificación</h3>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-6">Para: {directNotifModal.name}</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Título</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                      placeholder="Ej: Aviso de recogida"
                      value={directNotifData.title}
                      onChange={e => setDirectNotifData({ ...directNotifData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mensaje</label>
                    <textarea
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium h-24 resize-none"
                      placeholder="Escribe el mensaje..."
                      value={directNotifData.message}
                      onChange={e => setDirectNotifData({ ...directNotifData, message: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tipo</label>
                    <select
                      aria-label="Tipo de notificación"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                      value={directNotifData.type}
                      onChange={e => setDirectNotifData({ ...directNotifData, type: e.target.value })}
                    >
                      <option value="info">Información</option>
                      <option value="success">Éxito</option>
                      <option value="warning">Advertencia</option>
                      <option value="shipment_update">Envío</option>
                      <option value="delivery">Entrega</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSendDirectNotif}
                      disabled={sendingNotif}
                      className="flex-1 bg-teal-500 text-[#00151a] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-400 transition-all disabled:opacity-50"
                    >
                      {sendingNotif ? 'Enviando...' : 'Enviar Alerta'}
                    </button>
                    <button
                      onClick={() => setDirectNotifModal(null)}
                      className="px-6 py-3 border border-gray-200 rounded-xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default AdminPanel;
