// API URL - Dinámico basado en entorno
const FALLBACK_URL = 'https://bodipo-business-api.onrender.com';
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : `${FALLBACK_URL}/api`;

export const BASE_URL = import.meta.env.VITE_API_URL || FALLBACK_URL;

// Obtener token del localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Configurar headers con token
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Registro de usuario
export const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    gender?: string;
}) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
    }

    // Guardar token
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
};

// Social Login (Google/Apple)
export const socialLogin = async (userData: {
    name: string;
    email: string;
    photoUrl?: string;
    provider: 'google' | 'apple';
    uid: string;
}) => {
    const response = await fetch(`${API_URL}/auth/social-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error en inicio de sesión social');
    }

    // Guardar token
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
};

// Login de usuario
export const login = async (credentials: {
    email: string;
    password: string;
}) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
    }

    // Guardar token
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Obtener usuario actual
export const getCurrentUser = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuario');
    }

    return data;
};

// Actualizar perfil
export const updateProfile = async (userData: FormData | {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    username?: string;
    idNumber?: string;
    gender?: string;
    profileImage?: string | null;
}) => {
    // Determinar headers: si es FormData (tiene archivo o imagen), dejar que browser setee Content-Type
    const isFormData = userData instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? userData : JSON.stringify(userData);

    const token = getToken();
    const finalHeaders = {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
    };


    const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: finalHeaders,
        body: body,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
    }

    // Actualizar usuario en localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }));

    return data;
};

// Obtener envíos del usuario
export const getUserShipments = async () => {
    const response = await fetch(`${API_URL}/shipments`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener envíos');
    }

    return data;
};

// Obtener transacciones del usuario
export const getUserTransactions = async () => {
    const response = await fetch(`${API_URL}/transactions/mine`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener transacciones');
    }

    return data;
};

// Crear nuevo envío
export const createShipment = async (shipmentData: {
    trackingNumber: string;
    origin: string;
    destination: string;
    weight: number;
    price: number;
    description?: string;
    recipient?: {
        name: string;
        phone?: string;
    };
}) => {
    const response = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(shipmentData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al crear envío');
    }

    return data;
};

// Crear múltiples envíos
export const createBulkShipment = async (shipments: any[]) => {
    const response = await fetch(`${API_URL}/shipments/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ shipments }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al crear envíos masivos');
    }

    return data;
};

// Verificar si hay token
export const isAuthenticated = () => {
    return !!getToken();
};

// Obtener usuario del localStorage
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Crear nueva transferencia
export const createTransfer = async (formData: FormData) => {
    // Nota: No establecemos 'Content-Type' manualmente cuando enviamos FormData,
    // el navegador lo hace automáticamente incluyendo el boundary.
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_URL}/transfers`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al crear transferencia');
    }

    return data;
};
