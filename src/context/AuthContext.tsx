import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    username?: string;
    profileImage?: string;
    idNumber?: string;
    discountEligible: boolean;
    gender?: string;
    role?: string;
    token?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    registerWithSocial: (userData: any) => Promise<void>;
    logout: () => void;
    updateUser: (userData: any) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar y sincronizar usuario al iniciar
    useEffect(() => {
        const syncUser = async () => {
            try {
                if (api.isAuthenticated()) {
                    // Primero cargamos lo que hay en local para respuesta rápida
                    const storedUser = api.getStoredUser();
                    if (storedUser) setUser(storedUser);

                    // Luego sincronizamos con el servidor para tener datos frescos
                    const freshUser = await api.getCurrentUser();
                    // Importante: El token no viene en /me, pero lo necesitamos en el state
                    const token = localStorage.getItem('token');
                    const fullUserData = { ...freshUser, token };
                    setUser(fullUserData);
                    localStorage.setItem('user', JSON.stringify(fullUserData));
                }
            } catch (error) {
                console.error('Error syncing user:', error);
                // Si el token es inválido o expiró, cerramos sesión
                api.logout();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        syncUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await api.login({ email, password });
            setUser(data);
        } catch (error: any) {
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            const data = await api.register(userData);
            setUser(data);
        } catch (error: any) {
            throw error;
        }
    };

    const registerWithSocial = async (userData: any) => {
        try {
            const data = await api.socialLogin(userData);
            setUser(data);
        } catch (error: any) {
            throw error;
        }
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    const updateUser = async (userData: any) => {
        try {
            const data = await api.updateProfile(userData);
            setUser((prev) => ({ ...prev, ...data } as User));
        } catch (error: any) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        registerWithSocial, // Add this
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
