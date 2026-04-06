import React from 'react';
import Tracking from '../components/Tracking';

const TrackingPage: React.FC = () => {
    return (
        <div className="py-12 bg-transparent min-h-screen flex items-center justify-center">
            <div className="w-full">
                <Tracking />
            </div>
        </div>
    );
};

export default TrackingPage;
