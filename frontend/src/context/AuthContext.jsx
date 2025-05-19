import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    // Charger l'utilisateur si le token existe
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await axiosInstance.get('/auth/me');
                    setUser(response.data.data);
                    setError(null);
                } catch (err) {
                    console.error('Erreur lors du chargement de l\'utilisateur:', err);
                    setError(err.response?.data?.message || 'Erreur lors du chargement de l\'utilisateur');
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (userData) => {
        try {
            setError(null);
            const response = await axiosInstance.post('/auth/login', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de la connexion';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await axiosInstance.post('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('token');
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err);
            setError('Erreur lors de la déconnexion');
        }
    };

    const updateProfile = async (userData) => {
        try {
            setError(null);
            const response = await axiosInstance.put('/auth/profile', userData);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 