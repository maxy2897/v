// API URL - Dinámico basado en entorno
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'https://bodipo-business-api.onrender.com/api';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://bodipo-business-api.onrender.com';

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

// ========== NOTIFICATIONS ==========

// Get user notifications
export const getNotifications = async () => {
    const response = await fetch(`${API_URL}/notifications`, {
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener notificaciones');
    }

    return data;
};

// Get unread notifications count
export const getUnreadCount = async () => {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener contador');
    }

    return data;
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al marcar como leída');
    }

    return data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al marcar todas como leídas');
    }

    return data;
};

// Create notification (admin only)
export const createNotification = async (notificationData: {
    title: string;
    message: string;
    type?: string;
    userId?: string | null;
    shipmentId?: string | null;
    expiresAt?: string | null;
}) => {
    const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al crear notificación');
    }

    return data;
};

// Get all notifications (admin only)
export const getAllNotifications = async () => {
    const response = await fetch(`${API_URL}/notifications/admin/all`, {
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener notificaciones');
    }

    return data;
};

// Delete notification (admin only)
export const deleteNotification = async (notificationId: string) => {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar notificación');
    }

    return data;
};
