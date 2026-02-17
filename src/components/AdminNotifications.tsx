import React, { useState, useEffect } from 'react';
import { createNotification, getAllNotifications, deleteNotification } from '../services/notificationsApi';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    userId?: { name: string; email: string } | null;
    shipmentId?: { trackingNumber: string; destination: string } | null;
    readBy: string[];
    createdAt: string;
    expiresAt?: string | null;
}

export const AdminNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'general',
        expiresAt: ''
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getAllNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            alert('Error al cargar notificaciones');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createNotification({
                ...formData,
                userId: null, // Global notification
                expiresAt: formData.expiresAt || null
            });

            alert('✅ Notificación creada exitosamente');
            setFormData({ title: '', message: '', type: 'general', expiresAt: '' });
            setShowCreateForm(false);
            await fetchNotifications();
        } catch (error: any) {
            console.error('Error creating notification:', error);
            alert('Error al crear notificación: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta notificación?')) return;

        try {
            await deleteNotification(id);
            alert('Notificación eliminada');
            await fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Error al eliminar notificación');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'delivery': return 'bg-green-100 text-green-800';
            case 'shipment_update': return 'bg-blue-100 text-blue-800';
            case 'success': return 'bg-teal-100 text-teal-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Gestión de Notificaciones</h2>
                    <p className="text-sm text-gray-500 mt-1">Envía notificaciones a todos los usuarios</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Notificación
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white border-2 border-teal-200 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Crear Notificación Global</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Título *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="Ej: Nuevo horario de envíos"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mensaje *</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                rows={4}
                                placeholder="Escribe el mensaje completo aquí..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                    <option value="general">General</option>
                                    <option value="info">Información</option>
                                    <option value="success">Éxito</option>
                                    <option value="warning">Advertencia</option>
                                    <option value="shipment_update">Actualización de Envío</option>
                                    <option value="delivery">Entrega</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Expira (opcional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Notificación'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notifications List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Notificaciones Enviadas ({notifications.length})</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No hay notificaciones creadas
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(notif.type)}`}>
                                                {notif.type}
                                            </span>
                                            {notif.userId ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                                    Personal
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                    Global
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>📅 {new Date(notif.createdAt).toLocaleString('es-ES')}</span>
                                            <span>👁️ Leída por {notif.readBy.length} usuarios</span>
                                            {notif.expiresAt && (
                                                <span>⏰ Expira: {new Date(notif.expiresAt).toLocaleString('es-ES')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(notif._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
