import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingShipments, setLoadingShipments] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [activeTab, setActiveTab] = useState<'shipments' | 'invoices'>('shipments');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    // Unified handleUpdateProfile is now in SettingsModal

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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Entregado':
            case t('dash.status.delivered'):
                return 'bg-green-100 text-green-800 border-green-200';
            case 'En Tránsito':
            case t('dash.status.transit'):
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'En Aduana':
            case t('dash.status.customs'):
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(shipment);
        return groups;
    }, {} as Record<string, Shipment[]>);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#00151a] tracking-tight">
                                {user.gender === 'male' ? 'Bienvenido Sr.' : user.gender === 'female' ? 'Bienvenida Sra.' : t('dash.welcome')}, <span className="text-teal-600">{user.name}</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-[#00151a]">{t('dash.profile.title')}</h2>
                                <button
                                    onClick={onOpenSettings}
                                    className="text-teal-600 hover:text-teal-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    {t('dash.profile.edit')}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                        {user.profileImage ? (
                                            <img
                                                src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.username')}</p>
                                    <p className="text-gray-800 font-bold text-teal-600 italic">
                                        {user.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : t('dash.profile.not_specified')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.name')}</p>
                                    <p className="text-gray-800 font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.email')}</p>
                                    <p className="text-gray-800 font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.phone')}</p>
                                    <p className="text-gray-800 font-medium">{user.phone || t('dash.profile.not_specified')}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.address')}</p>
                                    <p className="text-gray-800 font-medium">{user.address || t('dash.profile.not_specified')}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">DNI, NIE o Pasaporte</p>
                                    <p className="text-gray-800 font-medium">{user.idNumber || t('dash.profile.not_specified')}</p>
                                </div>
                            </div>

                            {/* Removed Discount Badge per user request */}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="flex space-x-6 mb-6 border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('shipments')}
                                    className={`pb-4 text-lg font-black transition-all ${activeTab === 'shipments'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {t('dash.ship.title')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('invoices')}
                                    className={`pb-4 text-lg font-black transition-all ${activeTab === 'invoices'
                                        ? 'text-teal-600 border-b-4 border-teal-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {t('dash.invoices.title') || 'Mis Facturas'}
                                </button>
                            </div>

                            {activeTab === 'shipments' ? (
                                <>
                                    {/* Tarjeta Informativa Documentos */}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/tarifas?mode=documento&origin=Guinea Ecuatorial')}
                                        className="w-full mb-8 p-6 md:p-8 rounded-[2rem] border-2 border-dashed border-teal-200 bg-teal-50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left hover:bg-teal-100 hover:border-teal-300 hover:scale-[1.01] transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-teal-800">{t('schedule.docs_title') || 'Envío de Documentos'}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase italic">{t('schedule.docs_desc') || 'Servicio Express a España'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">Registrar Ahora &rarr;</span>
                                            <span className="bg-[#00151a] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 whitespace-nowrap">{t('schedule.docs_rate') || 'Desde 15€'}</span>
                                        </div>
                                    </button>

                                    {/* Search Input */}
                                    <div className="mb-8 relative">
                                        <input
                                            type="text"
                                            placeholder={t('dash.search_placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-teal-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    {loadingShipments ? (
                                        <div className="text-center py-12">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                            <p className="mt-4 text-gray-500 font-medium">{t('dash.ship.loading')}</p>
                                        </div>
                                    ) : Object.keys(groupedShipments).length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg
                                                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                />
                                            </svg>
                                            <p className="text-gray-500 font-medium whitespace-pre-line">
                                                {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : t('dash.ship.no_shipments')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {Object.entries(groupedShipments).map(([date, group]) => (
                                                <div key={date}>
                                                    <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-4 border-b border-teal-100 pb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        {date}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {group.map((shipment) => (
                                                            <div
                                                                key={shipment._id}
                                                                className="border-2 border-gray-100 rounded-2xl p-6 hover:border-teal-200 transition-all bg-white"
                                                            >
                                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                                    <div>
                                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                                                            {t('dash.ship.tracking_label')}
                                                                        </p>
                                                                        <p className="text-lg font-black text-[#00151a]">
                                                                            {shipment.trackingNumber}
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 ${getStatusColor(
                                                                            shipment.status
                                                                        )}`}
                                                                    >
                                                                        {shipment.status}
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                                            {t('dash.ship.origin')}
                                                                        </p>
                                                                        <p className="text-gray-800 font-medium">{shipment.origin}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                                            {t('dash.ship.dest')}
                                                                        </p>
                                                                        <p className="text-gray-800 font-medium">{shipment.destination}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                                            {t('dash.ship.weight')}
                                                                        </p>
                                                                        <p className="text-gray-800 font-medium">{shipment.weight} kg</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                                            {t('dash.ship.price')}
                                                                        </p>
                                                                        <p className="text-gray-800 font-medium">{shipment.price} FCFA</p>
                                                                    </div>
                                                                </div>

                                                                {shipment.description && (
                                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                                            {t('dash.ship.description')}
                                                                        </p>
                                                                        <p className="text-gray-700 text-sm">{shipment.description}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                loadingTransactions ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                        <p className="mt-4 text-gray-500 font-medium">{t('dash.invoices.loading') || 'Cargando facturas...'}</p>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg
                                            className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">{t('dash.invoices.no_invoices') || 'No hay facturas disponibles'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.map((tx) => (
                                            <div
                                                key={tx._id}
                                                className="border-2 border-gray-100 rounded-2xl p-6 hover:border-teal-200 transition-all flex flex-col md:flex-row justify-between items-center gap-4"
                                            >
                                                <div className="text-left w-full md:w-auto">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                                        {tx.type === 'SHIPMENT'
                                                            ? `${t('dash.invoices.ship_to') || 'Envío a'}: ${tx.details?.recipient?.name || '---'}`
                                                            : `${t('dash.invoices.transfer_to') || 'Transf. a'}: ${tx.details?.beneficiary?.name || '---'}`
                                                        }
                                                    </p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-lg font-black text-[#00151a] tracking-tight">
                                                            {new Date(tx.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                            <span className="text-gray-300 mx-2">|</span>
                                                            <span className="text-teal-600">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                            {tx.amount.toLocaleString()} {tx.currency || 'FCFA'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => downloadInvoice(tx._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-bold text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    {t('dash.invoices.download') || 'Descargar Factura'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
