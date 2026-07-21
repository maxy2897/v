import React from 'react';
import Calculator from '../components/Calculator';

const RatesPage: React.FC = () => {
    return (
        <div className="py-24 pt-32 relative overflow-hidden min-h-screen bg-[#f5f1e8] [clip-path:inset(0)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <Calculator />
            </div>
        </div>
    );
};

export default RatesPage;
