import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import * as api from '../services/api';
import { BASE_URL } from '../services/api';
import { PhoneInput } from '../components/PhoneInput';
import { TERMS_AND_CONDITIONS } from '../constants/terms';
import { getNotifications, markAsRead, markAllAsRead, subscribeToPush } from '../services/notificationsApi';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    shipmentId?: any;
}

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
    onOpenAdmin?: () => void;
    onOpenForgotPassword?: (email?: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSettings, onOpenAdmin, onOpenForgotPassword }) => {
    const { user, logout, updateUser, isAuthenticated, loading: authLoading } = useAuth();
    const { t, language } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingShipments, setLoadingShipments] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<'shipments' | 'invoices' | 'settings' | 'help' | 'notifications' | 'virtual_card'>('shipments');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobileMenu, setIsMobileMenu] = useState(true);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);

    const handleRechargeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('amount', rechargeAmount);
            if (screenshot) formData.append('image', screenshot);
            formData.append('type', 'deposit');
            formData.append('description', 'Carga de Tarjeta Virtual');
            formData.append('method', 'Transferencia');
            formData.append('category', 'Recarga Tarjeta');

            await api.createTransfer(formData);
            
            alert('¡Solicitud enviada con éxito! Revisaremos tu comprobante y activaremos tu saldo en breve.');
            setIsRechargeModalOpen(false);
            setRechargeAmount('');
            setScreenshot(null);
            
            // Recargar datos para ver si ya cambió algo (aunque suele ser manual por admin)
            const transactionsData = await api.getUserTransactions();
            setTransactions(transactionsData);
        } catch (error: any) {
            console.error('Error al solicitar recarga:', error);
            alert(error.message || 'Error al enviar la solicitud. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Read from session storage or query params to keep state
    useEffect(() => {
        const storedTab = sessionStorage.getItem('dashboard_tab') as any;
        const storedMenuState = sessionStorage.getItem('dashboard_mobile_menu');

        const params = new URLSearchParams(location.search);
        const urlTab = params.get('tab');

        if (urlTab && ['settings', 'invoices', 'shipments', 'help', 'notifications'].includes(urlTab)) {
            setActiveTab(urlTab as any);
            sessionStorage.setItem('dashboard_tab', urlTab);
            setIsMobileMenu(false);
        } else if (storedTab) {
            setActiveTab(storedTab);
            if (storedMenuState === 'false') {
                setIsMobileMenu(false);
            }
        }
    }, [location.search]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId as any);
        setIsMobileMenu(false);
        sessionStorage.setItem('dashboard_tab', tabId);
        sessionStorage.setItem('dashboard_mobile_menu', 'false');
        navigate(`/dashboard?tab=${tabId}`, { replace: true });
    };

    const handleBackToMenu = () => {
        setIsMobileMenu(true);
        sessionStorage.setItem('dashboard_mobile_menu', 'true');
    };

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

    // Password Form State
    const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/');
            return;
        }

        if (!authLoading && isAuthenticated) {
            const loadData = async () => {
                try {
                    const [shipmentsData, transactionsData, notificationsData] = await Promise.all([
                        api.getUserShipments(),
                        api.getUserTransactions(),
                        getNotifications()
                    ]);
                    setShipments(shipmentsData);
                    setTransactions(transactionsData);
                    setNotifications(notificationsData);
                } catch (error) {
                    console.error('Error loading data:', error);
                } finally {
                    setLoadingShipments(false);
                    setLoadingTransactions(false);
                }
            };

            loadData();

            // Push Notifications Subscription
            const registerPush = async () => {
                try {
                    if ('serviceWorker' in navigator) {
                        const registration = await navigator.serviceWorker.ready;
                        let subscription = await registration.pushManager.getSubscription();
                        
                        if (!subscription) {
                            const vapidKey = await api.getVapidPublicKey();
                            const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

                            subscription = await registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: convertedVapidKey
                            });
                        }

                        await subscribeToPush(subscription);
                    }
                } catch (error) {
                    console.error('Error suscribiendo a notificaciones push:', error);
                }
            };

            registerPush();
        }
    }, [isAuthenticated, authLoading]);

    // Helper for VAPID conversion
    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

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
            alert(t('dashboard.profile.updated_success'));
        } catch (error: any) {
            alert(error.message || t('dashboard.profile.update_error'));
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert(t('client.passwords_dont_match'));
            return;
        }
        
        setLoading(true);
        try {
            await api.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert(t('dashboard.profile.updated_success'));
            setIsPasswordFormOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            alert(error.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-teal-600 bg-teal-50 border-teal-100';
            case 'delivery': return 'text-green-600 bg-green-50 border-green-100';
            case 'shipment_update': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'warning': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'delivery': return '📦';
            case 'shipment_update': return '🚚';
            case 'success': return '✅';
            case 'warning': return '⚠️';
            default: return '🔔';
        }
    };

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
            alert(t('dashboard.invoice.download_error'));
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
        <>
            <div className="min-h-screen bg-white">
                <div className="flex flex-col md:flex-row min-h-screen">

                    {/* Wallapop Sidebar */}
                    <aside className={`w-full md:w-[320px] bg-white border-r border-gray-100 flex-col pt-24 shrink-0 ${!isMobileMenu ? 'hidden md:flex' : 'flex'}`}>
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
                                    <h3 className="font-black text-[#00151a] text-lg tracking-tight leading-tight flex items-center gap-1.5">
                                        {user.name}
                                        {(user.role !== 'user' || user.isVerified) && (
                                            <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fill="#0095F6" />
                                            </svg>
                                        )}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[#007e85] uppercase tracking-widest mt-1">{t('dashboard.customer_profile')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <nav className="flex-grow px-4 pb-8 space-y-1">
                            {[
                                { id: 'shipments', label: t('dashboard.my_buys_shipments'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
                                { id: 'virtual_card', label: 'Tarjeta Virtual', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
                                { id: 'invoices', label: t('dashboard.my_invoices'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                                { id: 'notifications', label: t('dashboard.notifications_inbox'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
                                ...((user.role === 'admin' || user.role?.startsWith('admin_')) ? [{ id: 'admin', label: t('dashboard.admin_panel'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }] : []),
                                { id: 'settings', label: t('dashboard.settings'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'admin') onOpenAdmin?.();
                                        else {
                                            handleTabChange(item.id);
                                        }
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
                                    onClick={() => handleTabChange('help')}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold transition-all mb-4 ${activeTab === 'help' ? 'bg-[#f0fcfc] text-[#007e85]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#00151a]'}`}
                                >
                                    <span className={activeTab === 'help' ? 'text-[#007e85]' : 'text-gray-400'}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </span>
                                    {t('dashboard.help_terms')}
                                    {activeTab === 'help' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#007e85]" />}
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold text-red-400 hover:bg-red-50 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    {t('dashboard.logout')}
                                </button>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className={`flex-grow bg-[#f9fafb] pt-24 pb-12 px-6 md:px-12 overflow-y-auto ${isMobileMenu ? 'hidden md:block' : 'block'}`}>
                        <div className="max-w-4xl">

                            {/* Mobile Back Button */}
                            <button
                                onClick={handleBackToMenu}
                                className="md:hidden flex items-center gap-2 text-gray-500 hover:text-[#00151a] font-black uppercase tracking-widest text-[10px] mb-8 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                {t('dashboard.back_to_menu')}
                            </button>

                            {/* Dynamic Header */}
                            <div className="mb-10 flex justify-between items-end border-b border-gray-100 pb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-[#00151a] tracking-tight mb-2 uppercase">
                                        {activeTab === 'shipments' ? t('dashboard.your_shipments') :
                                         activeTab === 'invoices' ? t('dashboard.your_invoices') :
                                         activeTab === 'settings' ? t('dashboard.settings') :
                                         activeTab === 'notifications' ? t('dashboard.your_notifications') :
                                         activeTab === 'virtual_card' ? 'Tarjeta Virtual' :
                                         t('dashboard.help_terms')}
                                    </h1>
                                    <p className="text-gray-400 text-sm font-medium">
                                        {activeTab === 'shipments' ? t('dashboard.shipments_desc') :
                                            activeTab === 'invoices' ? t('dashboard.invoices_desc') :
                                                activeTab === 'settings' ? t('dashboard.settings_desc') :
                                                    activeTab === 'notifications' ? t('dashboard.notifications_desc') :
                                                        activeTab === 'virtual_card' ? 'Gestiona tu tarjeta virtual Bodipo Business.' :
                                                            t('dashboard.help_desc')}
                                    </p>
                                </div>

                                {activeTab === 'notifications' && notifications.some(n => !n.isRead) && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="bg-white text-teal-600 border-2 border-teal-50/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t('dashboard.mark_all_read')}
                                    </button>
                                )}

                                {activeTab === 'settings' && (user.role !== 'user' || user.isVerified) && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#007e85] bg-[#f0fcfc] px-3 py-1 rounded-full border border-teal-100">
                                        <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fill="#0095F6" />
                                        </svg>
                                        {t('dashboard.verified_profile')}
                                    </div>
                                )}
                            </div>

                            {/* Virtual Card View */}
                            {activeTab === 'virtual_card' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-12 items-center">
                                        <div className="w-full max-w-[400px] aspect-[1.6/1] rounded-[1.5rem] overflow-hidden shadow-2xl relative group shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10"></div>
                                            <img 
                                                src="/images/virtual-card.png" 
                                                alt="Bodipo Virtual Card" 
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white font-mono tracking-[0.2em] pointer-events-none">
                                                <p className={`text-lg font-black drop-shadow-lg mb-4 transition-all duration-500 ${!user.virtualCard?.active ? 'blur-[20px] select-none opacity-20' : ''}`}>
                                                    {user.virtualCard?.number || '4918 5004 2135 3238'}
                                                </p>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-90 drop-shadow-md">
                                                    <div className={!user.virtualCard?.active ? 'blur-[18px] opacity-20' : ''}>
                                                        <span className="block text-[8px] opacity-60 mb-0.5">VÁLIDA HASTA</span>
                                                        <span>{user.virtualCard?.expiry || '04/2029'}</span>
                                                    </div>
                                                    <div className={`text-right ${!user.virtualCard?.active ? 'blur-[18px] opacity-20' : ''}`}>
                                                        <span className="block text-[8px] opacity-60 mb-0.5">CVV</span>
                                                        <span>{user.virtualCard?.cvv || '043'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {!user.virtualCard?.active && (
                                                <div className="absolute inset-0 bg-black/80 backdrop-blur-[15px] z-30 flex flex-col items-center justify-center p-8 text-center">
                                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl mb-4 border border-white/20">🔒</div>
                                                    <button 
                                                        onClick={() => setIsRechargeModalOpen(true)}
                                                        className="px-6 py-3 bg-teal-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-teal-500 transition-all mb-4"
                                                    >
                                                        Solicitar Activación
                                                    </button>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 leading-relaxed">
                                                        Carga saldo para activar tu tarjeta
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 w-full space-y-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Saldo Disponible</p>
                                                <h2 className="text-4xl font-black text-[#00151a] tracking-tighter">
                                                    {(user.virtualCard?.balance || 0).toLocaleString()} <span className="text-teal-600">FCFA</span>
                                                </h2>
                                                <p className="text-lg font-black text-teal-500 tracking-tight mt-1">
                                                    ≈ {((user.virtualCard?.balance || 0) / 655.957).toFixed(2)} <span className="text-sm opacity-70">€</span>
                                                </p>
                                                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ user.virtualCard?.active ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-red-50 text-red-500 border-red-100' }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${ user.virtualCard?.active ? 'bg-teal-500' : 'bg-red-400' }`}></span>
                                                    {user.virtualCard?.active ? 'Tarjeta Activa' : 'Tarjeta Inactiva'}
                                                </div>
                                            </div>

                                            <div className="bg-teal-50 border border-teal-100 p-5 rounded-3xl flex gap-4">
                                                <span className="text-xl">💡</span>
                                                <div>
                                                    <p className="text-[10px] font-black text-teal-900 uppercase tracking-widest mb-1">¡Aumenta tu saldo!</p>
                                                    <p className="text-[10px] font-bold text-teal-700 leading-normal">
                                                        Recarga tu tarjeta ahora para disfrutar de compras sin límites en tus tiendas favoritas de España y el mundo.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 text-xs text-none">✓</div>
                                                    Compras seguras en Amazon, Zara, etc.
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 text-xs text-none">✓</div>
                                                    Gestión inmediata de tus envíos.
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 text-xs text-none">✓</div>
                                                    Control total de tus gastos.
                                                </div>
                                            </div>
                                            {!user.virtualCard?.active && (
                                                <button
                                                    onClick={() => setIsRechargeModalOpen(true)}
                                                    className="mt-2 w-full py-4 bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-all hover:scale-[1.02]"
                                                >
                                                    Solicitar Activación de Tarjeta
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Help and Terms View */}
                            {activeTab === 'help' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
                                            <h3 className="text-xl font-black text-[#00151a] mb-8 uppercase tracking-tight ml-2">{t('dashboard.faqs')}</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { q: t('dashboard.faq_q1'), a: t('dashboard.faq_a1') },
                                                    { q: t('dashboard.faq_q2'), a: t('dashboard.faq_a2') },
                                                    { q: t('dashboard.faq_q3'), a: t('dashboard.faq_a3') }
                                                ].map((faq, idx) => (
                                                    <details key={idx} className="group bg-gray-50 rounded-3xl overflow-hidden border border-transparent hover:border-teal-100 transition-all">
                                                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-sm text-[#00151a]">
                                                            {faq.q}
                                                            <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-[10px] text-teal-600 transition-transform group-open:rotate-180">▼</span>
                                                        </summary>
                                                        <div className="px-6 pb-6 text-gray-500 text-sm font-medium leading-relaxed border-t border-gray-100 pt-4">
                                                            {faq.a}
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm max-h-[900px] overflow-y-auto scrollbar-hide">
                                            <h3 className="text-xl font-black text-[#00151a] mb-8 uppercase tracking-tight ml-2">{t('dashboard.legal_contract')}</h3>
                                            <div className="space-y-6">
                                                {TERMS_AND_CONDITIONS.map((term, index) => (
                                                    <section key={index} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100/50 hover:shadow-sm transition-all group">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <span className="w-8 h-8 rounded-full bg-white text-[#007e85] flex items-center justify-center font-black text-xs shadow-sm">{index + 1}</span>
                                                            <h4 className="font-black text-[#00151a] uppercase text-[11px] tracking-widest">{t(`terms.title.${index + 1}`) || term.title}</h4>
                                                        </div>
                                                        <p className="text-sm leading-relaxed text-gray-500 font-medium">{t(`terms.content.${index + 1}`) || term.content}</p>
                                                    </section>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>

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
                            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <h3 className="text-2xl font-black text-teal-900 uppercase italic tracking-tighter mb-2">Solicitar Activación</h3>
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
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-teal-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
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
                                        <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group-hover:border-teal-500 transition-all">
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
                                        className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
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
        </>
    );
};

export default DashboardPage;
