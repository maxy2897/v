import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import * as api from '../../services/api';
import { BASE_URL } from '../../services/api';

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
    const { t, language } = useSettings();
    const navigate = useNavigate();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loadingShipments, setLoadingShipments] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        username: user?.username || '',
        profileImage: user?.profileImage || null as File | string | null
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                username: user.username || '',
                profileImage: user.profileImage || null
            });
            setPreviewImage(null);
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, profileImage: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

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
                setLoadingShipments(false);
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
        console.log('🔵 handleUpdateProfile called');
        console.log('📝 Form data:', formData);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('address', formData.address);
            data.append('username', formData.username);

            if (formData.profileImage instanceof File) {
                console.log('📸 Adding profile image:', formData.profileImage.name);
                data.append('profileImage', formData.profileImage);
            }

            console.log('🚀 Calling updateUser...');
            await updateUser(data as any);
            console.log('✅ Update successful!');
            setEditMode(false);
            alert(t('dash.alert.update_success'));
        } catch (error: any) {
            console.error('❌ Error updating profile:', error);
            alert(error.message || t('dash.alert.update_error'));
        }
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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#00151a] tracking-tight">
                                {t('dash.welcome')}, <span className="text-teal-600">{user.name}</span>
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
                        >
                            {t('dash.btn.logout')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-[#00151a]">{t('dash.profile.title')}</h2>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="text-teal-600 hover:text-teal-700 font-bold text-sm"
                                >
                                    {editMode ? t('dash.profile.cancel') : t('dash.profile.edit')}
                                </button>
                            </div>

                            {editMode ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="flex justify-center mb-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : user.profileImage ? (
                                                    <img
                                                        src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                )}
                                            </div>
                                            <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-md">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <input
                                                    id="profileImage"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    aria-label={t('dash.profile.change_image') || "Cambiar imagen de perfil"}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="edit-username" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t('dash.profile.username')}</label>
                                        <input
                                            id="edit-username"
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 text-black"
                                            placeholder="@username"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-name" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t('dash.profile.name')}</label>
                                        <input
                                            id="edit-name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 text-black"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-email" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t('dash.profile.email')}</label>
                                        <input
                                            id="edit-email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 text-black"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t('dash.profile.phone')}</label>
                                        <input
                                            id="edit-phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 text-black"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-address" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t('dash.profile.address')}</label>
                                        <input
                                            id="edit-address"
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 text-black"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        onClick={(e) => {
                                            console.log('🔴 Button clicked!');
                                        }}
                                        disabled={loading}
                                        className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                                    >
                                        {loading ? t('dash.profile.saving') : t('dash.profile.save')}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                            {user.profileImage ? (
                                                <img
                                                    src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.username')}</p>
                                        <p className="text-gray-800 font-bold text-teal-600 italic">
                                            {user.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : t('dash.profile.not_specified')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.name')}</p>
                                        <p className="text-gray-800 font-medium">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.email')}</p>
                                        <p className="text-gray-800 font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.phone')}</p>
                                        <p className="text-gray-800 font-medium">{user.phone || t('dash.profile.not_specified')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dash.profile.address')}</p>
                                        <p className="text-gray-800 font-medium">{user.address || t('dash.profile.not_specified')}</p>
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
                                            <p className="text-white font-black text-sm">{t('dash.profile.discount_title')}</p>
                                            <p className="text-teal-100 text-xs font-medium">{t('dash.profile.discount_desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipments Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-black text-[#00151a] mb-6">{t('dash.ship.title')}</h2>

                            {loadingShipments ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                    <p className="mt-4 text-gray-500 font-medium">{t('dash.ship.loading')}</p>
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
                                    <p className="text-gray-500 font-medium">{t('dash.ship.no_shipments')}</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {t('dash.ship.empty_desc')}
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
                                                        {t('dash.ship.tracking_label')}
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
                                                        {t('dash.ship.origin')}
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.origin}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        {t('dash.ship.dest')}
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.destination}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        {t('dash.ship.weight')}
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.weight} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        {t('dash.ship.price')}
                                                    </p>
                                                    <p className="text-gray-800 font-medium">{shipment.price} FCFA</p>
                                                </div>
                                            </div>

                                            {shipment.description && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                        {t('dash.ship.description')}
                                                    </p>
                                                    <p className="text-gray-700 text-sm">{shipment.description}</p>
                                                </div>
                                            )}

                                            <div className="mt-4 text-xs text-gray-400 font-medium">
                                                {t('dash.ship.created')}: {new Date(shipment.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US', {
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
