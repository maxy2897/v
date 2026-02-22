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
        expiresAt: '',
        shipmentId: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredShipments, setFilteredShipments] = useState<any[]>([]);

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

    const handleSearchShipment = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 3) {
            setFilteredShipments([]);
            return;
        }

        try {
            // Re-using the admin endpoint to search shipments
            const res = await fetch(`${BASE_URL}/api/shipments/admin/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const allShipments = await res.json();
            const filtered = allShipments.filter((s: any) =>
                s.trackingNumber.toLowerCase().includes(term.toLowerCase()) ||
                (s.user?.name || '').toLowerCase().includes(term.toLowerCase())
            ).slice(0, 5);
            setFilteredShipments(filtered);
        } catch (error) {
            console.error('Error searching shipments:', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createNotification({
                ...formData,
                userId: null, // Global notification
                shipmentId: formData.shipmentId || null,
                expiresAt: formData.expiresAt || null
            });

            alert('✅ Notificación creada exitosamente');
            setFormData({ title: '', message: '', type: 'general', expiresAt: '', shipmentId: '' });
            setSearchTerm('');
            setFilteredShipments([]);
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
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Gestión de Notificaciones</h2>
                    <p className="text-sm text-gray-500 mt-1 uppercase font-bold tracking-widest text-[10px]">Envía avisos globales a todos tus usuarios</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-8 py-4 bg-[#00151a] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-teal-500 hover:text-[#00151a] transition-all flex items-center gap-3 shadow-xl"
                >
                    {showCreateForm ? (
                        <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    )}
                    {showCreateForm ? 'Cerrar Panel' : 'Nueva Notificación'}
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white border-2 border-teal-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-2xl">📢</div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Redactar Mensaje Global</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Este mensaje será visible para todos los clientes</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Título del Aviso</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold transition-all"
                                        placeholder="Ej: Salida de Contenedor Confirmada"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Mensaje Detallado</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                                        rows={4}
                                        placeholder="Escribe el contenido de la notificación..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Categoría</label>
                                        <select
                                            title="Tipo de notificación"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="general">📢 General</option>
                                            <option value="info">ℹ️ Información</option>
                                            <option value="success">✅ Confirmación</option>
                                            <option value="warning">⚠️ Aviso/Retraso</option>
                                            <option value="shipment_update">🚚 Tránsito</option>
                                            <option value="delivery">📦 Disponible</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vencimiento</label>
                                        <input
                                            type="datetime-local"
                                            title="Fecha de expiración"
                                            value={formData.expiresAt}
                                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Shipment Linker */}
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vincular a un Envío (Opcional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => handleSearchShipment(e.target.value)}
                                            className="w-full px-6 py-4 pl-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold transition-all"
                                            placeholder="Buscar por BB-XXXXX o nombre..."
                                        />
                                        <svg className="w-5 h-5 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>

                                    {filteredShipments.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                            {filteredShipments.map(s => (
                                                <button
                                                    key={s._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, shipmentId: s._id });
                                                        setSearchTerm(s.trackingNumber);
                                                        setFilteredShipments([]);
                                                    }}
                                                    className="w-full text-left px-6 py-3 hover:bg-teal-50 flex items-center justify-between border-b last:border-none border-gray-50"
                                                >
                                                    <div>
                                                        <p className="text-xs font-black text-teal-600">{s.trackingNumber}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{s.user?.name || 'Cliente sin nombre'}</p>
                                                    </div>
                                                    <span className="text-[8px] bg-gray-100 px-2 py-1 rounded font-black text-gray-400 uppercase">{s.destination}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {formData.shipmentId && (
                                        <div className="mt-4 flex items-center justify-between bg-teal-50 p-4 rounded-xl border border-teal-200">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">🔗</span>
                                                <div>
                                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Enlazado a:</p>
                                                    <p className="text-sm font-black text-[#00151a]">{searchTerm}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setFormData({ ...formData, shipmentId: '' }); setSearchTerm(''); }}
                                                className="p-2 text-teal-400 hover:text-red-500 transition-colors"
                                                title="Desvincular envío"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#00151a] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-500 hover:text-[#00151a] transition-all shadow-xl shadow-teal-900/20 disabled:opacity-50"
                            >
                                {loading ? 'Emitiendo señal...' : 'Lanzar Notificación'}
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

                                        {notif.shipmentId && (
                                            <div className="mb-3 inline-flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
                                                <span className="text-[10px] font-black text-teal-600 uppercase">Enlace:</span>
                                                <span className="text-xs font-mono font-bold text-teal-700">{notif.shipmentId.trackingNumber}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                            <span>📅 {new Date(notif.createdAt).toLocaleString('es-ES')}</span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                Visto por {notif.readBy.length}
                                            </span>
                                            {notif.expiresAt && (
                                                <span className="text-orange-500">⏰ Expira: {new Date(notif.expiresAt).toLocaleString('es-ES')}</span>
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
