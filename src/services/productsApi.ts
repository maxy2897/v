import { Product } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
        throw new Error('Error al obtener productos');
    }
    return response.json();
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al crear producto');
    }
    return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar producto');
    }
};
