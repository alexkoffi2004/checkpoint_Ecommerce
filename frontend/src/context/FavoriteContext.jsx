import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error('useFavorites doit être utilisé à l\'intérieur d\'un FavoriteProvider');
    }
    return context;
};

export const FavoriteProvider = ({ children }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadFavorites = async () => {
        if (!user) {
            setFavorites([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/favorites');
            setFavorites(response.data.favorites || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des favoris');
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const addToFavorites = async (productId) => {
        try {
            setError(null);
            const response = await axiosInstance.post(`/favorites/${productId}`);
            setFavorites(response.data.favorites || []);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'ajout aux favoris');
            return false;
        }
    };

    const removeFromFavorites = async (productId) => {
        try {
            setError(null);
            const response = await axiosInstance.delete(`/favorites/${productId}`);
            setFavorites(response.data.favorites || []);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression des favoris');
            return false;
        }
    };

    const isFavorite = (productId) => {
        return Array.isArray(favorites) && favorites.some(product => product._id === productId);
    };

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user]);

    const value = {
        favorites,
        loading,
        error,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loadFavorites
    };

    return (
        <FavoriteContext.Provider value={value}>
            {children}
        </FavoriteContext.Provider>
    );
};

export default FavoriteContext; 