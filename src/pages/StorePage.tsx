import React from 'react';
import Store from '../components/Store';
import { Product } from '../../types';

interface StorePageProps {
    products: Product[];
}

const StorePage: React.FC<StorePageProps> = ({ products }) => {
    return (
        <div>
            <Store products={products} />
        </div>
    );
};

export default StorePage;
