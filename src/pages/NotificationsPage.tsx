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
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-500 bg-green-50';
            case 'warning': return 'text-amber-500 bg-amber-50';
            case 'error': return 'text-red-500 bg-red-50';
            case 'shipment_update': return 'text-blue-500 bg-blue-50';
            case 'delivery': return 'text-purple-500 bg-purple-50';
            default: return 'text-teal-500 bg-teal-50';
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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#00151a] tracking-tighter uppercase">Panel de Notificaciones</h1>
                        <p className="text-gray-500 font-medium">Gestiona tus avisos y actualizaciones de servicio</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-6 py-2 bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 w-fit"
                        >
                            Marcar todas como leídas
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-gray-800">No tienes notificaciones</h3>
                        <p className="text-gray-500 mt-2">Te avisaremos cuando haya actualizaciones sobre tus pedidos o servicios.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((n) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={n._id}
                                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex gap-6 ${n.isRead ? 'bg-white border-gray-100 opacity-80' : 'bg-white border-teal-200 shadow-lg shadow-teal-500/5'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getTypeColor(n.type)}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`text-lg font-black tracking-tight ${n.isRead ? 'text-gray-700' : 'text-[#00151a]'}`}>{n.title}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap ml-4">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${n.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>{n.message}</p>
                                </div>
                                {!n.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0 animate-pulse"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
