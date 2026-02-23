import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : '';

            const res = await fetch(`${BASE_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Error al obtener la lista de usuarios');
            }

            const data = await res.json();
            setUsers(data.users || []);
        } catch (err: any) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : '';

            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al actualizar el rol');
            }

            alert('Rol actualizado exitosamente');
            fetchUsers(); // Recargar usuarios
        } catch (err: any) {
            alert(err.message || 'Error al actualizar el rol');
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${userName} y TODOS sus datos asociados (envíos, transacciones, etc.)? Esta acción es irreversible.`)) {
            return;
        }

        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : '';

            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al eliminar el usuario');
            }

            alert('Usuario y datos asociados eliminados exitosamente');
            fetchUsers();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar el usuario');
        }
    };

    const rolesList = [
        { value: 'user', label: 'Cliente (User)' },
        { value: 'admin_local', label: 'Admin Local (Tienda)' },
        { value: 'admin_finance', label: 'Admin Finanzas (Contabilidad)' },
        { value: 'admin_tech', label: 'Admin Técnico (Config/Contenido)' },
        { value: 'admin', label: 'Sub-Admin / Manager' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Gestión de Usuarios y Roles</h2>
                    <p className="text-sm text-gray-500 mt-1 uppercase font-bold tracking-widest text-[10px]">Asigna permisos a tu equipo</p>
                </div>
            </div>

            {loading && <p>Cargando usuarios...</p>}
            {error && <p className="text-red-500 font-bold">{error}</p>}

            {!loading && !error && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#00151a] text-white">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Usuario</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Contacto</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Rol Actual</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Cambiar Rol</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                        <p className="text-xs text-gray-500">{user.phone || 'Sin teléfono'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-orange-100 text-orange-800' : user.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-teal-100 text-teal-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            aria-label={`Cambiar rol de ${user.name}`}
                                            title={`Cambiar rol de ${user.name}`}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="bg-white border border-gray-200 text-gray-900 text-xs rounded-xl focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 font-bold cursor-pointer"
                                        >
                                            {rolesList.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
                                            title="Eliminar usuario y todos sus datos"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
