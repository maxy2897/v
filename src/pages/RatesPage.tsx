import React from 'react';
import Calculator from '../components/Calculator';

const RatesPage: React.FC = () => {
    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Calculator />
            </div>
        </div>
    );
};

export default RatesPage;
