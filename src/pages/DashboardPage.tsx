import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import * as api from '../services/api';
import { BASE_URL } from '../services/api';
import { PhoneInput } from '../components/PhoneInput';

interface Shipment {
    _id: string;
    trackingNumber: string;
    origin: string;
    destination: string;
    weight: number;
    price: number;
    status: string;
    description?: string;
    createdAt: string;
}

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    details?: any;
}

interface DashboardPageProps {
    onOpenSettings?: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSettings }) => {
    const { user, logout, updateUser, isAuthenticated } = useAuth();
    const { t, language } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingShipments, setLoadingShipments] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [activeTab, setActiveTab] = useState<'shipments' | 'invoices' | 'settings'>('shipments');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Read query param for tab
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'settings' || tab === 'invoices' || tab === 'shipments') {
            setActiveTab(tab as any);
        }
    }, [location.search]);

    // Profile Form State (from SettingsModal logic)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        phone: user?.phone || '',
        address: user?.address || '',
        idNumber: user?.idNumber || '',
        gender: user?.gender || 'other',
        profileImage: user?.profileImage || ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        const loadData = async () => {
            try {
                const [shipmentsData, transactionsData] = await Promise.all([
                    api.getUserShipments(),
                    api.getUserTransactions()
                ]);
                setShipments(shipmentsData);
                setTransactions(transactionsData);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoadingShipments(false);
                setLoadingTransactions(false);
            }
        };

        loadData();
    }, [isAuthenticated, navigate]);

    // Sync formData with user when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                phone: user.phone || '',
                address: user.address || '',
                idNumber: user.idNumber || '',
                gender: user.gender || 'other',
                profileImage: user.profileImage || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUser(formData);
            alert('Perfil actualizado correctamente');
        } catch (error: any) {
            alert(error.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Entregado':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'En Tránsito':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'En Aduana':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const downloadInvoice = async (transactionId: string) => {
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : '';
            const res = await fetch(`${BASE_URL}/api/transactions/${transactionId}/receipt`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error downloading');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factura-${transactionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            alert('Error al descargar factura');
        }
    };

    const filteredShipments = shipments.filter(shipment => {
        const term = searchTerm.toLowerCase();
        return (
            shipment.trackingNumber.toLowerCase().includes(term) ||
            shipment.origin.toLowerCase().includes(term) ||
            shipment.destination.toLowerCase().includes(term) ||
            (shipment.description && shipment.description.toLowerCase().includes(term))
        );
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const groupedShipments = filteredShipments.reduce((groups, shipment) => {
        const date = new Date(shipment.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(shipment);
        return groups;
    }, {} as Record<string, Shipment[]>);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-white">
            <div className="flex flex-col md:flex-row min-h-screen">

                {/* Wallapop Sidebar */}
                <aside className="w-full md:w-[320px] bg-white border-r border-gray-100 flex flex-col pt-24 shrink-0">
                    {/* User Card */}
                    <div className="px-8 mb-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-teal-50 shadow-sm relative shrink-0">
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-teal-600 font-black text-2xl bg-teal-50 uppercase">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-[#00151a] text-lg tracking-tight leading-tight">{user.name}</h3>
                                <div className="flex text-yellow-400 text-[10px] mt-1 space-x-0.5">
                                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    <span className="text-gray-400 ml-1">(5)</span>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">En Bodipo desde {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-grow px-4 pb-8 space-y-1">
                        {[
                            { id: 'shipments', label: 'Mis Compras / Envíos', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
                            { id: 'invoices', label: 'Mis Facturas', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                            { id: 'notifications', label: 'Buzón / Notificaciones', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
                            { id: 'settings', label: 'Configuración', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'notifications') navigate('/notificaciones');
                                    else setActiveTab(item.id as any);
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold transition-all ${activeTab === item.id ? 'bg-[#f0fcfc] text-[#007e85]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#00151a]'}`}
                            >
                                <span className={activeTab === item.id ? 'text-[#007e85]' : 'text-gray-400'}>{item.icon}</span>
                                {item.label}
                                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#007e85]" />}
                            </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-gray-50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold text-red-400 hover:bg-red-50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-grow bg-[#f9fafb] pt-24 pb-12 px-6 md:px-12 overflow-y-auto">
                    <div className="max-w-4xl">

                        {/* Dynamic Header */}
                        <div className="mb-10 flex justify-between items-end border-b border-gray-100 pb-8">
                            <div>
                                <h1 className="text-3xl font-black text-[#00151a] tracking-tight mb-2 uppercase">
                                    {activeTab === 'shipments' ? 'Tus Envíos' : activeTab === 'invoices' ? 'Tus Facturas' : 'Configuración'}
                                </h1>
                                <p className="text-gray-400 text-sm font-medium">
                                    {activeTab === 'shipments' ? 'Aquí podrás ver y gestionar todos tus paquetes en tránsito.' :
                                        activeTab === 'invoices' ? 'Descarga tus facturas y comprobantes de pago.' :
                                            'Gestiona tu información personal y de seguridad.'}
                                </p>
                            </div>

                            {activeTab === 'settings' && (
                                <button className="text-[10px] font-black uppercase tracking-widest text-[#007e85] hover:underline">Ver perfil público</button>
                            )}
                        </div>

                        {/* Shipments View */}
                        {activeTab === 'shipments' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Doc Promo */}
                                <button
                                    type="button"
                                    onClick={() => navigate('/tarifas?mode=documento&origin=Guinea Ecuatorial')}
                                    className="w-full p-8 rounded-[2rem] border-2 border-dashed border-teal-200 bg-teal-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-teal-100 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase tracking-widest text-teal-800">Envío de Documentos</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase italic">Servicio Express a España desde 15€</p>
                                        </div>
                                    </div>
                                    <span className="bg-[#00151a] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Enviar Ahora</span>
                                </button>

                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Busca por número de rastreo o destino..."
                                        title="Buscar envíos"
                                        aria-label="Buscar envíos"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-teal-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                                    />
                                    <svg className="w-5 h-5 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>

                                {/* List */}
                                <div className="space-y-4">
                                    {Object.entries(groupedShipments).map(([date, group]) => (
                                        <div key={date}>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-teal-400" />
                                                {date}
                                            </h3>
                                            <div className="space-y-4 mb-10">
                                                {group.map((shipment) => (
                                                    <div key={shipment._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-teal-100 transition-all flex flex-col md:flex-row gap-6">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(shipment.status)}`}>
                                                                    {shipment.status}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-300">#{shipment.trackingNumber}</span>
                                                            </div>
                                                            <div className="flex items-center gap-8">
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Origen</p>
                                                                    <p className="text-sm font-black text-[#00151a]">{shipment.origin}</p>
                                                                </div>
                                                                <svg className="w-4 h-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Destino</p>
                                                                    <p className="text-sm font-black text-[#00151a]">{shipment.destination}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 flex md:flex-col justify-between items-end gap-2 border-l border-gray-50 pl-6">
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black text-gray-300 uppercase">Importe</p>
                                                                <p className="text-lg font-black text-teal-600 tracking-tighter">{shipment.price.toLocaleString()} FCFA</p>
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/rastreo?code=${shipment.trackingNumber}`)}
                                                                className="text-[9px] font-black uppercase text-[#007e85] hover:bg-[#f0fcfc] px-4 py-2 rounded-lg transition-all"
                                                            >
                                                                Rastrear →
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invoices View */}
                        {activeTab === 'invoices' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {transactions.map((tx) => (
                                    <div key={tx._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                    {tx.type === 'SHIPMENT' ? 'Pago de Envío' : 'Transferencia Realizada'}
                                                </p>
                                                <p className="text-base font-black text-[#00151a]">
                                                    {new Date(tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-[#00151a] tracking-tighter">{tx.amount.toLocaleString()} {tx.currency || 'FCFA'}</p>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{tx.status === 'completed' ? 'Pagado' : tx.status}</p>
                                            </div>
                                            <button
                                                onClick={() => downloadInvoice(tx._id)}
                                                title="Descargar Factura"
                                                aria-label="Descargar Factura"
                                                className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Settings View (Wallapop Style) */}
                        {activeTab === 'settings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
                                    <h3 className="text-xl font-black text-[#00151a] mb-10 border-b border-gray-50 pb-6 uppercase tracking-tight">Editar Perfil</h3>

                                    <form onSubmit={handleUpdateProfile} className="space-y-10">
                                        {/* Avatar Edit */}
                                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-12 bg-gray-50 p-6 rounded-3xl border border-gray-100/50">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md relative group">
                                                {formData.profileImage ? (
                                                    <img src={formData.profileImage.startsWith('http') ? formData.profileImage : `${BASE_URL}/${formData.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-2xl uppercase">{user.name?.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button type="button" className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase text-gray-700 hover:bg-gray-50 transition-all shadow-sm">Cambiar Foto</button>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center sm:text-left">Formatos JPG o PNG. Máximo 2MB.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    title="Nombre Completo"
                                                    aria-label="Nombre Completo"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email (Protegido)</label>
                                                <input type="text" title="Email" aria-label="Email" value={user.email} readOnly className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-sm cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Teléfono</label>
                                                <PhoneInput
                                                    value={formData.phone}
                                                    onChange={(val) => setFormData({ ...formData, phone: val })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">DNI / NIE</label>
                                                <input
                                                    type="text"
                                                    title="DNI / NIE"
                                                    aria-label="DNI / NIE"
                                                    value={formData.idNumber}
                                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Dirección de Envío</label>
                                                <input
                                                    type="text"
                                                    title="Dirección de Envío"
                                                    aria-label="Dirección de Envío"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                    placeholder="Calle, Número, Localidad..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full mt-10 bg-[#00151a] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-teal-600 transition-all shadow-xl shadow-gray-200"
                                        >
                                            {loading ? 'Actualizando...' : 'Guardar Información'}
                                        </button>
                                    </form>
                                </div>

                                <div className="p-8 bg-orange-50 rounded-3xl border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <p className="text-xs font-black text-orange-800 uppercase tracking-widest mb-1">Cambio de Contraseña</p>
                                        <p className="text-[10px] font-bold text-orange-600/70 uppercase">¿Quieres proteger más tu cuenta? Actualiza tu clave periódicamente.</p>
                                    </div>
                                    <button className="px-8 py-3 bg-white text-orange-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm">Actualizar Clave</button>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
