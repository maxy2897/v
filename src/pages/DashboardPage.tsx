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
import { motion } from 'framer-motion';

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
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSettings, onOpenAdmin }) => {
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
    const [activeTab, setActiveTab] = useState<'shipments' | 'invoices' | 'settings' | 'help' | 'notifications'>('shipments');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobileMenu, setIsMobileMenu] = useState(true);

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
                    console.error('Error loading dashboard data:', error);
                } finally {
                    setLoadingShipments(false);
                    setLoadingTransactions(false);
                }
            };

            if (isAuthenticated) {
                loadData();
            }
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Push Notifications Registration
    useEffect(() => {
        if (!authLoading && isAuthenticated && 'serviceWorker' in navigator && 'PushManager' in window) {
            const registerPush = async () => {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        const registration = await navigator.serviceWorker.ready;
                        let subscription = await registration.pushManager.getSubscription();

                        if (!subscription) {
                            const vapidPublicKey = 'BEB9EE8uZeg4W7Iu5fjnYRLKEyriq3k3c4NDEBddiexQLhY3ybm_vJyBzMJEzLanSm8h-vGS8c8bbzsdkbUl7LY';
                            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

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
                                    {activeTab === 'shipments' ? t('dashboard.your_shipments') : activeTab === 'invoices' ? t('dashboard.your_invoices') : activeTab === 'settings' ? t('dashboard.settings') : activeTab === 'notifications' ? t('dashboard.your_notifications') : t('dashboard.help_terms')}
                                </h1>
                                <p className="text-gray-400 text-sm font-medium">
                                    {activeTab === 'shipments' ? t('dashboard.shipments_desc') :
                                        activeTab === 'invoices' ? t('dashboard.invoices_desc') :
                                            activeTab === 'settings' ? t('dashboard.settings_desc') :
                                                activeTab === 'notifications' ? t('dashboard.notifications_desc') :
                                                    t('dashboard.help_desc')}
                                </p>
                            </div>

                            {activeTab === 'notifications' && notifications.some(n => !n.isRead) && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="bg-white text-teal-600 border-2 border-teal-500/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 transition-all shadow-sm flex items-center gap-2"
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
                                            <p className="text-xs font-black uppercase tracking-widest text-teal-800">{t('dashboard.document_shipment')}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase italic">{t('dashboard.express_service_spain')}</p>
                                        </div>
                                    </div>
                                    <span className="bg-[#00151a] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">{t('dashboard.send_now')}</span>
                                </button>

                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t('dashboard.search_shipments_placeholder')}
                                        title={t('dashboard.search_shipments')}
                                        aria-label={t('dashboard.search_shipments')}
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
                                                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">{t('dashboard.origin')}</p>
                                                                    <p className="text-sm font-black text-[#00151a]">{shipment.origin}</p>
                                                                </div>
                                                                <svg className="w-4 h-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">{t('dashboard.destination')}</p>
                                                                    <p className="text-sm font-black text-[#00151a]">{shipment.destination}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 flex md:flex-col justify-between items-end gap-2 border-l border-gray-50 pl-6">
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black text-gray-300 uppercase">{t('dashboard.amount')}</p>
                                                                <p className="text-lg font-black text-teal-600 tracking-tighter">{shipment.price.toLocaleString()} FCFA</p>
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/rastreo?code=${shipment.trackingNumber}`)}
                                                                className="text-[9px] font-black uppercase text-[#007e85] hover:bg-[#f0fcfc] px-4 py-2 rounded-lg transition-all"
                                                            >
                                                                {t('dashboard.track')} →
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
                                                    {tx.type === 'SHIPMENT' ? t('dashboard.shipment_payment') : t('dashboard.transfer_made')}
                                                </p>
                                                <p className="text-base font-black text-[#00151a]">
                                                    {new Date(tx.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-[#00151a] tracking-tighter">{tx.amount.toLocaleString()} {tx.currency || 'FCFA'}</p>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{tx.status === 'completed' ? t('shipping.status.delivered') : tx.status}</p>
                                            </div>
                                            <button
                                                onClick={() => downloadInvoice(tx._id)}
                                                title={t('dashboard.download_invoice')}
                                                aria-label={t('dashboard.download_invoice')}
                                                className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Notifications View */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {notifications.length === 0 ? (
                                    <div className="bg-white rounded-[3rem] p-12 text-center border border-dashed border-gray-200 shadow-sm">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                                            📭
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{t('dashboard.empty_inbox')}</h3>
                                        <p className="text-gray-500 mt-4 max-w-xs mx-auto leading-relaxed">
                                            {t('dashboard.empty_inbox_desc')}
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={n._id}
                                            onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                            className={`group relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex gap-6 ${n.isRead
                                                ? 'bg-white/60 border-gray-100 opacity-80 hover:bg-white hover:opacity-100'
                                                : 'bg-white border-teal-200 shadow-xl shadow-teal-500/5 hover:border-teal-400'
                                                }`}
                                        >
                                            {!n.isRead && (
                                                <div className="absolute top-8 right-8 w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-lg shadow-teal-500/50"></div>
                                            )}
                                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 text-2xl border-2 transition-transform group-hover:scale-110 duration-500 ${getTypeColor(n.type)}`}>
                                                {getTypeIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className={`text-xl font-black tracking-tight ${n.isRead ? 'text-gray-600' : 'text-[#00151a]'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                        {new Date(n.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${n.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                                {n.shipmentId && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                                                        <div className="bg-teal-50 px-3 py-1.5 rounded-xl flex items-center gap-3 border border-teal-100">
                                                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{t('dashboard.track_code')}</span>
                                                            <span className="text-xs font-mono font-black text-teal-700">{n.shipmentId.trackingNumber}</span>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {t('dashboard.destination')}: <span className="text-gray-600">{n.shipmentId.destination}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Settings View (Wallapop Style) */}
                        {activeTab === 'settings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
                                    <h3 className="text-xl font-black text-[#00151a] mb-10 border-b border-gray-50 pb-6 uppercase tracking-tight">{t('dashboard.edit_profile')}</h3>

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
                                                <button type="button" className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase text-gray-700 hover:bg-gray-50 transition-all shadow-sm">{t('dashboard.change_photo')}</button>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center sm:text-left">{t('dashboard.image_format_info')}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.full_name')}</label>
                                                <input
                                                    type="text"
                                                    title={t('dashboard.full_name')}
                                                    aria-label={t('dashboard.full_name')}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.email_protected')}</label>
                                                <input type="text" title="Email" aria-label="Email" value={user.email} readOnly className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-sm cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.phone')}</label>
                                                <PhoneInput
                                                    value={formData.phone}
                                                    onChange={(val) => setFormData({ ...formData, phone: val })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.dni_nie')}</label>
                                                <input
                                                    type="text"
                                                    title={t('dashboard.dni_nie')}
                                                    aria-label={t('dashboard.dni_nie')}
                                                    value={formData.idNumber}
                                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.shipping_address')}</label>
                                                <input
                                                    type="text"
                                                    title={t('dashboard.shipping_address')}
                                                    aria-label={t('dashboard.shipping_address')}
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                    placeholder={t('dashboard.shipping_address_placeholder')}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full mt-10 bg-[#00151a] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-teal-600 transition-all shadow-xl shadow-gray-200"
                                        >
                                            {loading ? t('admin.loading') : t('dashboard.save_info')}
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-50">
                                    <h3 className="text-xl font-black text-[#00151a] mb-2">{t('dashboard.password_change')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-8">{t('admin.last_update')}: 3 {t('admin.reports.months')}</p>
                                    
                                    {!isPasswordFormOpen ? (
                                        <button 
                                            onClick={() => setIsPasswordFormOpen(true)}
                                            className="w-full border-2 border-[#00151a] text-[#00151a] px-8 py-5 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-[#00151a] hover:text-white transition-all"
                                        >
                                            {t('dashboard.update_password')}
                                        </button>
                                    ) : (
                                        <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.current_password')}</label>
                                                <input
                                                    type="password"
                                                    required
                                                    title={t('dashboard.current_password')}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.new_password')}</label>
                                                <input
                                                    type="password"
                                                    required
                                                    title={t('dashboard.new_password')}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('dashboard.confirm_new_password')}</label>
                                                <input
                                                    type="password"
                                                    required
                                                    title={t('dashboard.confirm_new_password')}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all font-bold text-sm text-[#00151a]"
                                                />
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsPasswordFormOpen(false)}
                                                    className="flex-1 border-2 border-gray-100 text-gray-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                                >
                                                    {t('common.cancel')}
                                                </button>
                                                <button 
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 bg-[#00151a] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg"
                                                >
                                                    {loading ? t('common.processing') : t('common.save')}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Help and Terms View */}
                        {activeTab === 'help' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                    {/* FAQs Section */}
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

                                        <div className="mt-8 bg-[#00151a] text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#007e85]/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                                            <div className="relative z-10 text-center">
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007e85] mb-3">{t('dashboard.vip_contact')}</p>
                                                <h4 className="text-2xl font-black mb-8 leading-tight">{t('dashboard.vip_contact_desc')}</h4>
                                                <a
                                                    href="https://wa.me/34643521042"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex bg-[#007e85] text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-[#00151a] transition-all shadow-lg"
                                                >
                                                    {t('dashboard.chat_direct_24_7')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms Section */}
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm max-h-[900px] overflow-y-auto scrollbar-hide">
                                        <h3 className="text-xl font-black text-[#00151a] mb-8 uppercase tracking-tight ml-2">{t('dashboard.legal_contract')}</h3>
                                        <div className="space-y-6">
                                            {TERMS_AND_CONDITIONS.map((term, index) => (
                                                <section key={index} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100/50 hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <span className="w-8 h-8 rounded-full bg-white text-[#007e85] flex items-center justify-center font-black text-xs shadow-sm">{index + 1}</span>
                                                        <h4 className="font-black text-[#00151a] uppercase text-[11px] tracking-widest group-hover:text-[#007e85] transition-colors">{t(`terms.title.${index + 1}`) || term.title}</h4>
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
    );
};

export default DashboardPage;
