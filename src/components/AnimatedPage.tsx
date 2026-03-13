import React from 'react';

interface AnimatedPageProps {
    children: React.ReactNode;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
    return (
        <div className="w-full">
            {children}
        </div>
    );
};

export default AnimatedPage;
