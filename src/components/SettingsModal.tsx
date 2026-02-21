import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { PhoneInput } from './PhoneInput';
import { BASE_URL } from '../services/api';
import { TERMS_AND_CONDITIONS } from '../constants/terms';
import ForgotPasswordModal from './ForgotPasswordModal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<'profile' | 'terms' | 'help'>(user ? 'profile' : 'terms');
    const [loading, setLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        phone: user?.phone || '',
        address: user?.address || '',
        idNumber: user?.idNumber || '',
        gender: user?.gender || 'other',
        profileImage: user?.profileImage || ''
    });

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
    }, [user, isOpen]);

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await resizeImage(file);
                setFormData({ ...formData, profileImage: base64 });
                setPreviewImage(base64);
            } catch (error) {
                console.error('Error resizing image:', error);
                alert('Error al procesar la imagen');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUser(formData);
            alert('Perfil actualizado correctamente');
        } catch (error: any) {
            alert(error.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#00151a]/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 h-[90vh] flex flex-col md:flex-row">

                {/* Close button - Fixed at top right of modal */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 text-gray-400 hover:text-[#00151a] transition-colors bg-white/50 backdrop-blur-md p-2 rounded-full shadow-sm"
                    title="Cerrar ajustes"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Sidebar (Left) */}
                <div className="w-full md:w-72 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto md:overflow-y-auto overflow-x-hidden md:h-full">

                    {/* User Summary Header */}
                    <div className="p-4 md:p-8 pt-6 md:pt-10 border-b border-gray-50 mb-2 md:mb-4 shrink-0">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-teal-50 shadow-sm relative shrink-0">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-teal-600 font-black text-xl md:text-2xl bg-teal-50">
                                        {user?.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-[#00151a] text-base md:text-lg tracking-tight leading-tight">{user?.name || 'Usuario'}</h3>
                                <div className="flex text-yellow-400 text-[8px] md:text-[10px] mt-0.5 md:mt-1">
                                    ★ ★ ★ ★ ★
                                </div>
                                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 md:mt-1">Desde {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-hidden px-4 md:px-4 pb-4 md:pb-8 space-x-2 md:space-x-0 md:space-y-1 scrollbar-hide shrink-0">
                        {[
                            { id: 'profile', label: 'Mi Perfil', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, protected: true },
                            { id: 'terms', label: 'Condiciones', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, protected: false },
                            { id: 'help', label: 'Ayuda', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, protected: false }
                        ].filter(tab => !tab.protected || !!user).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === tab.id ? 'bg-[#f0fcfc] text-[#007e85] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-[#00151a]'}`}
                            >
                                <span className={activeTab === tab.id ? 'text-[#007e85]' : 'text-gray-400'}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content (Right) */}
                <div className="flex-grow overflow-y-auto bg-[#f9fafb] p-6 md:p-12 scrollbar-hide">

                    {/* Content Header Section */}
                    <div className="mb-10 max-w-xl mx-auto">
                        <h2 className="text-3xl font-black text-[#00151a] tracking-tight mb-2">
                            {activeTab === 'profile' ? 'Tus Datos' : activeTab === 'terms' ? 'Contrato Legal' : 'Centro de Ayuda'}
                        </h2>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            {activeTab === 'profile' ? 'Edita tu información personal para que tus envíos lleguen siempre al lugar correcto.' :
                                activeTab === 'terms' ? 'Aquí podrás consultar las condiciones de uso, gestión de datos y protección al cliente.' :
                                    '¿Tienes alguna duda con tu paquete? Estamos aquí para ayudarte las 24 horas.'}
                        </p>
                    </div>

                    {activeTab === 'profile' && user && (
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 shadow-sm max-w-xl mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Profile Image Upload Logic Card */}
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : user.profileImage ? (
                                                <img src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">{user.name?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <label htmlFor="settings-image" className="absolute -bottom-1 -right-1 bg-[#007e85] text-white p-2 rounded-full cursor-pointer hover:bg-[#005f6b] transition-all shadow-md scale-90" title="Cambiar foto">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </label>
                                        <input id="settings-image" type="file" className="hidden" accept="image/*" onChange={handleImageChange} title="Cambiar imagen de perfil" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#00151a] text-sm uppercase tracking-tight">Foto de perfil</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Sube una foto clara para que podamos identificarte mejor.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="md:col-span-2">
                                        <label htmlFor="settings-name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Nombre Completo</label>
                                        <input
                                            id="settings-name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-100 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#007e85] transition-all font-medium text-black placeholder:text-gray-300"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="settings-email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Email <span className="text-gray-300">(Protegido)</span></label>
                                        <input
                                            id="settings-email"
                                            type="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full bg-gray-100/50 px-6 py-4 rounded-2xl text-gray-400 font-medium border border-gray-100 cursor-not-allowed text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="settings-nie" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">DNI / NIE / Passport</label>
                                        <input
                                            id="settings-nie"
                                            type="text"
                                            value={formData.idNumber}
                                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                            readOnly={!!user.idNumber && user.idNumber.trim() !== ''}
                                            className={`w-full px-6 py-4 rounded-2xl font-medium border text-sm transition-all ${user.idNumber && user.idNumber.trim() !== '' ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-black ring-1 ring-gray-100 focus:ring-2 focus:ring-[#007e85] border-none'}`}
                                            placeholder="DNI/NIE"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="settings-phone" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Teléfono Móvil</label>
                                        <PhoneInput
                                            id="settings-phone"
                                            value={formData.phone}
                                            onChange={(val) => setFormData({ ...formData, phone: val })}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="settings-username" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Alias / Username</label>
                                        <input
                                            id="settings-username"
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-100 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#007e85] transition-all font-medium text-black text-sm"
                                            placeholder="@usuario"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="settings-address" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Tu Dirección Particular</label>
                                        <input
                                            id="settings-address"
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-100 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#007e85] transition-all font-medium text-black text-sm"
                                            placeholder="Calle, Número, Ciudad..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-50">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-grow bg-[#007e85] text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-[#00151a] transition-all shadow-xl shadow-teal-900/10"
                                    >
                                        {loading ? 'Sincronizando...' : 'Guardar Cambios'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotOpen(true)}
                                        className="px-8 py-4 bg-white text-orange-600 border border-orange-100 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-50 transition-all"
                                    >
                                        Cambiar Contraseña
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="max-w-xl mx-auto space-y-6">
                            {TERMS_AND_CONDITIONS.map((term, index) => (
                                <section key={index} className="bg-white p-8 rounded-[2rem] border border-gray-100/50 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="w-8 h-8 rounded-full bg-[#f0fcfc] text-[#007e85] flex items-center justify-center font-black text-xs">{index + 1}</span>
                                        <h4 className="font-black text-[#00151a] uppercase text-[11px] tracking-widest group-hover:text-[#007e85] transition-colors">{term.title}</h4>
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-500 font-medium">{term.content}</p>
                                </section>
                            ))}
                        </div>
                    )}

                    {activeTab === 'help' && (
                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-black text-[#00151a] mb-8 uppercase tracking-tight ml-2">Dudas frecuentes</h3>
                                <div className="space-y-4">
                                    {[
                                        { q: '¿Cómo rastreo mi pedido?', a: 'Introduce tu código BB en la sección de "Rastreo" o pídelo a nuestro bot de IA.' },
                                        { q: '¿Tiempos de envío España - Guinea?', a: 'El tiempo estimado es de 7 a 15 días laborables dependiendo del tipo de carga.' },
                                        { q: '¿Puedo enviar dinero?', a: 'Sí, disponemos de una sección de Money Transfer con tasas competitivas.' }
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
                            </div>

                            <div className="bg-[#00151a] text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#007e85]/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007e85] mb-3">Contacto VIP</p>
                                    <h4 className="text-2xl font-black mb-8 leading-tight">¿Tienes un caso especial?<br />Hablemos por WhatsApp.</h4>
                                    <a
                                        href="https://wa.me/34643521042"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex bg-[#007e85] text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-[#00151a] transition-all shadow-lg"
                                    >
                                        Chat Directo 24/7
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isForgotOpen && (
                <ForgotPasswordModal
                    isOpen={isForgotOpen}
                    onClose={() => setIsForgotOpen(false)}
                    initialEmail={user.email}
                />
            )}
        </div>
    );
};

export default SettingsModal;
