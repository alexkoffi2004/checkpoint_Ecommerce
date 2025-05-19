import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    // Charger le panier au démarrage
    useEffect(() => {
        if (token) {
            loadCart();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/cart');
            setCart(res.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement du panier');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const res = await axiosInstance.post('/cart/items', {
                productId,
                quantity
            });
            setCart(res.data.data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de l\'ajout au panier');
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const res = await axiosInstance.put(`/cart/items/${productId}`, {
                quantity
            });
            setCart(res.data.data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour du panier');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await axiosInstance.delete(`/cart/items/${productId}`);
            setCart(res.data.data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la suppression du produit');
        }
    };

    const clearCart = async () => {
        try {
            const res = await axiosInstance.delete('/cart');
            setCart(res.data.data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors du vidage du panier');
        }
    };

    const value = {
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 