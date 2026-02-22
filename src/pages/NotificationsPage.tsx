import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationsApi';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'general' | 'info' | 'success' | 'warning' | 'shipment_update' | 'delivery' | 'error';
    isRead: boolean;
    createdAt: string;
}

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchNotificationsData = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificationsData();
    }, []);

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

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-800">Inicia sesión para ver tus notificaciones</h2>
                    <p className="text-gray-500 mt-2">Mantente al tanto de tus envíos y actualizaciones.</p>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-[#00151a] tracking-tighter uppercase italic">
                            Mis Notificaciones
                        </h1>
                        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            Centro de actualizaciones en tiempo real
                        </p>
                    </div>

                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="bg-white text-teal-600 border-2 border-teal-500/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Marcar todas como leídas
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-12 text-center border border-dashed border-gray-200 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                            📭
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Bandeja de entrada vacía</h3>
                        <p className="text-gray-500 mt-4 max-w-xs mx-auto leading-relaxed">
                            Te avisaremos por aquí cuando haya actualizaciones sobre tus pedidos, salidas de vuelos o promociones.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notifications.map((n) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={n._id}
                                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                className={`group relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex gap-6 ${n.isRead
                                    ? 'bg-white/60 border-gray-100 grayscale-[0.5] opacity-80 hover:bg-white hover:grayscale-0'
                                    : 'bg-white border-teal-200 shadow-xl shadow-teal-500/5 hover:border-teal-400'
                                    }`}
                            >
                                {/* Active Dot */}
                                {!n.isRead && (
                                    <div className="absolute top-8 right-8 w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-lg shadow-teal-500/50"></div>
                                )}

                                {/* Type Icon */}
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 text-2xl border-2 transition-transform group-hover:scale-110 duration-500 ${getTypeColor(n.type)}`}>
                                    {getTypeIcon(n.type)}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className={`text-xl font-black tracking-tight ${n.isRead ? 'text-gray-600' : 'text-[#00151a]'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                            {new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    <p className={`text-sm leading-relaxed ${n.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                                        {n.message}
                                    </p>

                                    {/* Shipment Link Info */}
                                    {n.shipmentId && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                                            <div className="bg-teal-50 px-3 py-1.5 rounded-xl flex items-center gap-3 border border-teal-100">
                                                <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Código</span>
                                                <span className="text-xs font-mono font-black text-teal-700">{n.shipmentId.trackingNumber}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Destino: <span className="text-gray-600">{n.shipmentId.destination}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Action (Subtle) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Implement delete on client side
                                    }}
                                    title="Eliminar notificación"
                                    className="absolute bottom-8 right-8 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
