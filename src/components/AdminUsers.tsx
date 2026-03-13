import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';
import { useSettings } from '../context/SettingsContext';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
}

export const AdminUsers: React.FC = () => {
    const { t } = useSettings();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
                throw new Error(t('admin.users.error_fetch'));
            }

            const data = await res.json();
            setUsers(data.users || []);
        } catch (err: any) {
            setError(err.message || t('admin.users.error_unknown'));
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
                throw new Error(data.message || t('admin.users.error_role_update'));
            }

            alert(t('admin.users.role_updated'));
            fetchUsers(); // Recargar usuarios
        } catch (err: any) {
            alert(err.message || t('admin.users.error_role_update'));
        }
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        setUserToDelete({ id: userId, name: userName });
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setIsDeleting(true);
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : '';

            const res = await fetch(`${BASE_URL}/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t('admin.users.error_delete'));
            }

            // Successfully deleted
            fetchUsers();
            setUserToDelete(null); // format fixes
        } catch (err: any) {
            alert(err.message || t('admin.users.error_delete'));
        } finally {
            setIsDeleting(false);
        }
    };

    const rolesList = [
        { value: 'user', label: t('admin.role.user') },
        { value: 'admin_local', label: t('admin.role.admin_local') },
        { value: 'admin_finance', label: t('admin.role.admin_finance') },
        { value: 'admin_tech', label: t('admin.role.admin_tech') },
        { value: 'admin', label: t('admin.role.admin') }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">{t('admin.users.title')}</h2>
                    <p className="text-sm text-gray-500 mt-1 uppercase font-bold tracking-widest text-[10px]">{t('admin.users.subtitle')}</p>
                </div>
            </div>

            {loading && <p>{t('admin.users.loading')}</p>}
            {error && <p className="text-red-500 font-bold">{error}</p>}

            {!loading && !error && (
                <>
                    {/* Vista Desktop */}
                    <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#00151a] text-white">
                                <tr>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">{t('admin.users.table_user')}</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">{t('admin.users.table_contact')}</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">{t('admin.users.table_role')}</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">{t('admin.users.table_change_role')}</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">{t('admin.users.table_actions')}</th>
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
                                            <p className="text-xs text-gray-500">{user.phone || t('admin.users.no_phone')}</p>
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
                                                className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors shrink-0"
                                                title={t('admin.users.btn_delete')}
                                            >
                                                {t('admin.users.btn_delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Móvil (Tarjetas) */}
                    <div className="lg:hidden space-y-4">
                        {users.map(user => (
                            <div key={user._id} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-900 text-lg truncate">{user.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID: {user._id.slice(-6)}</p>
                                    </div>
                                    <span className={`shrink-0 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${user.role === 'admin' ? 'bg-orange-50 text-orange-600 border-orange-100' : user.role === 'user' ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-sm font-bold text-gray-700 break-all">{user.email}</p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{user.phone || t('admin.users.no_phone_mobile')}</p>
                                </div>

                                <div className="pt-2 flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.users.permissions_label')}</label>
                                    <div className="flex gap-2 items-center">
                                        <select
                                            aria-label={`Cambiar rol de ${user.name}`}
                                            title={`Cambiar rol de ${user.name}`}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="flex-1 bg-white border-2 border-gray-100 text-gray-900 text-xs rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 font-bold cursor-pointer transition-all hover:bg-gray-50"
                                        >
                                            {rolesList.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            className="text-red-500 hover:text-red-700 font-black tracking-widest uppercase text-[10px] bg-red-50 hover:bg-red-100 h-full px-5 py-3.5 rounded-xl transition-colors shrink-0 flex items-center justify-center border border-red-100 hover:border-red-200"
                                            title={t('admin.users.btn_delete')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {userToDelete && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#00151a]/80 backdrop-blur-sm" onClick={() => !isDeleting && setUserToDelete(null)}></div>
                    <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-center text-[#00151a] mb-2">{t('admin.users.delete_modal_title')}</h3>
                        <p className="text-gray-500 text-sm text-center font-medium mb-8">
                            {t('admin.users.delete_modal_desc', { name: userToDelete.name })}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setUserToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {t('admin.users.btn_cancel')}
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? t('admin.users.deleting') : t('admin.users.btn_confirm_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
