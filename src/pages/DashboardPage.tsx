import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

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

const DashboardPage: React.FC = () => {
    const { user, logout, updateUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        const loadShipments = async () => {
            try {
                const data = await api.getUserShipments();
                setShipments(data);
            } catch (error) {
                console.error('Error loading shipments:', error);
            } finally {
                setLoading(false);
            }
        };

        loadShipments();
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUser(formData);
            setEditMode(false);
            alert('Perfil actualizado exitosamente');
        } catch (error: any) {
            alert(error.message || 'Error al actualizar perfil');
        }
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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-[#00151a] tracking-tight mb-2">
                                Mi Dashboard
                            </h1>
                            <p className="text-teal-600 font-bold">Bienvenido, {user.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-[#00151a]">Mi Perfil</h2>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="text-teal-600 hover:text-teal-700 font-bold text-sm"
                                >
                                    {editMode ? 'Cancelar' : 'Editar'}
                                </button>
                            </div>

                            {editMode ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all"
                                    >
                                        Guardar Cambios
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Email
                                        </p>
                                        <p className="text-gray-800 font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Teléfono
                                        </p>
                                        <p className="text-gray-800 font-medium">{user.phone || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Dirección
                                        </p>
                                        <p className="text-gray-800 font-medium">{user.address || 'No especificada'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Discount Badge */}
                            {user.discountEligible && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                            <span className="text-2xl font-black text-teal-600">10%</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-sm">Descuento Activo</p>
                                            <p className="text-teal-100 text-xs font-medium">En tu próximo envío</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipments Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-black text-[#00151a] mb-6">Mis Envíos</h2>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                    <p className="mt-4 text-gray-500 font-medium">Cargando envíos...</p>
                                </div>
                            ) : shipments.length === 0 ? (
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
                                    <p className="text-gray-500 font-medium">No tienes envíos registrados</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Tus envíos aparecerán aquí una vez que los registres
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {shipments.map((shipment) => (
                                        <div
                                            key={shipment._id}
                                            className="border-2 border-gray-100 rounded-2xl p-6 hover:border-teal-200 transition-all"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                                        Número de Rastreo
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
                                                        Origen
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.origin}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        Destino
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.destination}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        Peso
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.weight} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        Precio
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.price} FCFA</p>
                                                </div>
                                            </div>

                                            {shipment.description && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        Descripción
                                                    </p>
                                                    <p className="text-gray-700 text-sm">{shipment.description}</p>
                                                </div>
                                            )}

                                            <div className="mt-4 text-xs text-gray-400 font-medium">
                                                Creado: {new Date(shipment.createdAt).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
