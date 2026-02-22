import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
    const { t } = useSettings();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-20 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#00151a] p-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
                        {t('privacy.title')}
                    </h1>
                    <p className="text-teal-400 text-sm font-black uppercase tracking-[0.3em]">
                        BODIPO BUSINESS
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-8">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            {t('privacy.sec1_title')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {t('privacy.sec1_content')}
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            {t('privacy.sec2_title')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            {t('privacy.sec2_content')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>{t('privacy.list_personal_data')}</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            {t('privacy.sec3_title')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            {t('privacy.sec3_content')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>{t('privacy.list_purposes')}</li>
                        </ul>
                    </section>

                    {/* Section 4-12 Simplified for translation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                            <div key={num} className="bg-gray-50 p-6 rounded-2xl">
                                <h3 className="text-sm font-black text-[#00151a] uppercase tracking-widest mb-2">
                                    {(t as any)(`privacy.sec${num}_title`)}
                                </h3>
                                {num === 8 && (
                                    <p className="text-xs text-gray-500 font-medium">
                                        {t('privacy.list_rights')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-8 mt-8 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500 font-medium">
                            {t('privacy.last_update')}
                        </p>
                        <div className="mt-6 text-center">
                            <Link
                                to="/"
                                className="inline-block bg-[#00151a] text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-teal-600 transition-all"
                            >
                                {t('privacy.back')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
