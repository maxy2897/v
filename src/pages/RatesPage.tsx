import React from 'react';
import Calculator from '../components/Calculator';

const RatesPage: React.FC = () => {
    return (
        <div className="py-24 pt-32 relative overflow-hidden min-h-screen">
            <div className="absolute inset-0 z-0 bg-[url('/images/bg/hero-map-v3.png')] bg-cover bg-center bg-fixed blur-[3px] brightness-[1.2]"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <Calculator />
            </div>
        </div>
    );
};

export default RatesPage;
