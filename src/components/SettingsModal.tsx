import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { PhoneInput } from './PhoneInput';
import { BASE_URL } from '../services/api';
import ForgotPasswordModal from './ForgotPasswordModal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<'profile' | 'terms' | 'help'>('profile');
    const [loading, setLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        phone: user?.phone || '',
        address: user?.address || '',
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
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                <div className="bg-[#00151a] p-8 text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Ajustes</h2>
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">Gestiona tu cuenta y preferencias</p>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        title="Cerrar ajustes"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-50 border-b border-gray-100 shrink-0 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'profile', label: 'Mi Perfil', icon: '👤' },
                        { id: 'terms', label: 'Términos', icon: '📄' },
                        { id: 'help', label: 'Ayuda', icon: '❓' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 min-w-[120px] py-4 px-6 text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${activeTab === tab.id ? 'bg-white text-teal-600 border-b-2 border-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-grow overflow-y-auto p-8 scrollbar-hide bg-gray-50/30">
                    {activeTab === 'profile' && user && (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                            {/* Profile Image */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-xl">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                        ) : user.profileImage ? (
                                            <img src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}/${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">{user.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <label htmlFor="settings-image" className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-all shadow-lg scale-90 group-hover:scale-100" title="Cambiar imagen de perfil">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </label>
                                    <input id="settings-image" type="file" className="hidden" accept="image/*" onChange={handleImageChange} title="Cambiar imagen de perfil" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Read Only Fields First */}
                                <div>
                                    <label htmlFor="settings-email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email (No editable)</label>
                                    <input
                                        id="settings-email"
                                        type="email"
                                        value={user.email}
                                        readOnly
                                        className="w-full bg-gray-100 px-6 py-4 rounded-2xl text-gray-500 font-medium border border-gray-200 cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotOpen(true)}
                                        className="mt-3 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                    >
                                        🔐 Cambiar contraseña
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor="settings-nie" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">DNI / NIE (No editable)</label>
                                    <input
                                        id="settings-nie"
                                        type="text"
                                        value={user.idNumber || 'No especificado'}
                                        readOnly
                                        className="w-full bg-gray-100 px-6 py-4 rounded-2xl text-gray-500 font-medium border border-gray-200 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="settings-name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Nombre Completo</label>
                                    <input
                                        id="settings-name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-2 ring-gray-100 focus:ring-teal-500 transition-all font-medium text-black"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="settings-username" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Nombre de Usuario</label>
                                    <input
                                        id="settings-username"
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-2 ring-gray-100 focus:ring-teal-500 transition-all font-medium text-black"
                                        placeholder="@ejemplo"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="settings-phone" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Teléfono</label>
                                    <PhoneInput
                                        id="settings-phone"
                                        value={formData.phone}
                                        onChange={(val) => setFormData({ ...formData, phone: val })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="settings-address" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Dirección</label>
                                    <input
                                        id="settings-address"
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-2 ring-gray-100 focus:ring-teal-500 transition-all font-medium text-black"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Género</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'male', label: 'Hombre', aria: 'Seleccionar género hombre' },
                                            { id: 'female', label: 'Mujer', aria: 'Seleccionar género mujer' },
                                            { id: 'other', label: 'Otro', aria: 'Seleccionar otro género' }
                                        ].map(g => (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, gender: g.id as any })}
                                                aria-label={g.aria}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g.id ? 'bg-[#00151a] text-white' : 'bg-white text-gray-400 ring-2 ring-gray-100 hover:ring-teal-200'}`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#00151a] text-white py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/10 mt-6"
                            >
                                {loading ? 'Guardando...' : 'Actualizar Perfil'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'terms' && (
                        <div className="prose prose-sm max-w-none text-gray-600 font-medium">
                            <h3 className="text-[#00151a] font-black uppercase tracking-tighter text-xl">Términos y Condiciones</h3>
                            <p className="mt-4 leading-relaxed">
                                Bienvenido a Bodipo Business. Al utilizar nuestros servicios, usted acepta nuestros términos de envío, logística y manejo de datos.
                            </p>
                            <div className="space-y-6 mt-8">
                                <section>
                                    <h4 className="font-bold text-teal-700 uppercase text-[10px] tracking-widest">1. Envíos y Logística</h4>
                                    <p>Todos los paquetes están sujetos a inspección y deben cumplir con las normativas internacionales de transporte. Los tiempos de entrega son estimados.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-teal-700 uppercase text-[10px] tracking-widest">2. Responsabilidad</h4>
                                    <p>Bodipo Business se responsabiliza de la integridad de los paquetes registrados bajo nuestras pólizas de seguro opcionales.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-teal-700 uppercase text-[10px] tracking-widest">3. Privacidad</h4>
                                    <p>Tus datos son utilizados exclusivamente para la gestión de tus envíos y la comunicación directa sobre el estado de los mismos.</p>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'help' && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-xl font-black text-[#00151a] mb-6">Centro de Ayuda</h3>
                                <div className="space-y-4">
                                    {[
                                        { q: '¿Cómo rastreo mi pedido?', a: 'Introduce tu código BB en la sección de "Rastreo" o pídelo a nuestro bot de IA.' },
                                        { q: '¿Tiempos de envío España - Guinea?', a: 'El tiempo estimado es de 7 a 15 días laborables dependiendo del tipo de carga.' },
                                        { q: '¿Puedo enviar dinero?', a: 'Sí, disponemos de una sección de Money Transfer con tasas competitivas.' }
                                    ].map((faq, idx) => (
                                        <details key={idx} className="group bg-gray-50 rounded-2xl overflow-hidden">
                                            <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-bold text-sm text-[#00151a]">
                                                {faq.q}
                                                <span className="transition-transform group-open:rotate-180">▼</span>
                                            </summary>
                                            <div className="px-5 pb-5 text-gray-500 text-sm font-medium leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-teal-900 text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
                                <div className="relative z-10 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-400 mb-2">Soporte Directo</p>
                                    <h4 className="text-2xl font-black mb-6">¿Necesitas más ayuda?</h4>
                                    <a
                                        href="https://wa.me/34643521042"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-white text-teal-900 px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
                                    >
                                        Chat WhatsApp
                                    </a>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isForgotOpen && (
                <ForgotPasswordModal
                    isOpen={isForgotOpen}
                    onClose={() => setIsForgotOpen(false)}
                />
            )}
        </div>
    );
};

export default SettingsModal;
