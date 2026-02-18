import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const { t, appConfig } = useSettings();

    const socialLinks = [
        {
            name: 'WhatsApp Canal',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                </svg>
            ),
            url: appConfig?.content?.social?.whatsapp || "https://whatsapp.com/channel/0029Vb49nL9DOQISuab0Tl3V",
            color: 'bg-[#25D366]',
            label: 'Únete'
        },
        {
            name: 'Instagram',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
            ),
            url: appConfig?.content?.social?.instagram || "https://www.instagram.com/bodipo_business",
            color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4]',
            label: 'Seguir'
        },
        {
            name: 'TikTok',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
            ),
            url: appConfig?.content?.social?.tiktok || "https://www.tiktok.com/@b.businnes",
            color: 'bg-black',
            label: 'Ver'
        }
    ];

    const phones = [
        { country: 'España', flag: '🇪🇸', number: appConfig?.contact?.phones?.es || '+34 641 992 110' },
        { country: 'Camerún', flag: '🇨🇲', number: appConfig?.contact?.phones?.cm || '+237 687528854' },
        { country: 'Guinea Ecuatorial', flag: '🇬🇶', number: appConfig?.contact?.phones?.gq || '+240 222 667 763' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#00151a]/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                        title="Cerrar modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-[#00151a] tracking-tight mb-2">
                            {t('footer.direct_contact') || 'Contactar'}
                        </h2>
                        <p className="text-gray-500 font-medium text-sm">
                            Canales oficiales de Bodipo Business
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Social Links */}
                        <div className="grid grid-cols-3 gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center group"
                                >
                                    <div className={`${social.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                                        {social.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00151a]">{social.name}</span>
                                </a>
                            ))}
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Phones Section */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-4 px-2">Atención Telefónica</p>
                            {phones.map((phone) => (
                                <a
                                    key={phone.country}
                                    href={`tel:${phone.number.replace(/\s/g, '')}`}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-teal-50 hover:scale-[1.02] transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{phone.flag}</span>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{phone.country}</p>
                                            <p className="text-sm font-black text-[#00151a]">{phone.number}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* WhatsApp Direct */}
                        <a
                            href={`https://wa.me/34641992110`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#00151a] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#007e85] transition-all shadow-xl shadow-teal-950/20"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.779-.877-2.053-.976-.275-.099-.475-.149-.675.15-.199.299-.773.973-.948 1.171-.175.199-.349.225-.651.075-.3-.15-1.266-.467-2.411-1.485-.892-.795-1.493-1.777-1.668-2.076-.175-.299-.019-.461.13-.61.135-.133.299-.349.449-.524.149-.175.199-.299.299-.498.1-.199.05-.374-.025-.524-.075-.15-.675-1.625-.925-2.224-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.299-1.05 1.023-1.05 2.495s1.075 2.893 1.225 3.093c.15.199 2.113 3.227 5.122 4.526.715.309 1.275.494 1.711.632.718.228 1.372.196 1.889.119.576-.085 1.779-.727 2.028-1.428.25-.7.25-1.298.175-1.428-.075-.13-.275-.209-.575-.359z" /></svg>
                            Chatear en WhatsApp
                        </a>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContactModal;
