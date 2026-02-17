import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationsApi';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'shipment_update' | 'delivery' | 'general';
    isRead: boolean;
    createdAt: string;
    shipmentId?: {
        trackingNumber: string;
        destination: string;
        status: string;
    };
}

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch notifications and count
    const fetchNotifications = async () => {
        try {
            const [notifs, countData] = await Promise.all([
                getNotifications(),
                getUnreadCount()
            ]);
            setNotifications(notifs);
            setUnreadCount(countData.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            await markAllAsRead();
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'delivery':
                return '📦';
            case 'shipment_update':
                return '🚚';
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'delivery':
                return 'bg-green-50 border-green-200';
            case 'shipment_update':
                return 'bg-blue-50 border-blue-200';
            case 'success':
                return 'bg-teal-50 border-teal-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Notificaciones"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed md:absolute top-20 md:top-auto right-4 md:right-0 mt-2 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] md:max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-2xl">
                        <div>
                            <h3 className="font-black text-gray-800 text-lg">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-gray-500 font-medium">{unreadCount} sin leer</p>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading || unreadCount === 0}
                                className="text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Marcar todas
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-3">🔔</div>
                                <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                                <p className="text-xs text-gray-400 mt-1">Te avisaremos cuando haya novedades</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-teal-50/30' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(notif.type)} flex items-center justify-center text-xl border`}>
                                                {getNotificationIcon(notif.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.isRead && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                {notif.shipmentId && (
                                                    <div className="mt-2 inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                                                        <span className="text-xs font-mono font-bold text-gray-700">
                                                            {notif.shipmentId.trackingNumber}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                                    {formatDate(notif.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notificaciones');
                                }}
                                className="w-full text-center text-xs font-bold text-teal-600 hover:text-teal-700 py-2"
                            >
                                Ver todas las notificaciones
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
