import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../config/axios';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        sort: '-createdAt'
    });

    // Charger un produit spécifique
    const loadProduct = async (id) => {
        if (!id) {
            setError('ID du produit manquant');
            return null;
        }

        try {
            setError(null);
            const res = await axiosInstance.get(`/products/${id}`);
            
            if (!res.data || !res.data.success || !res.data.data) {
                throw new Error(res.data?.message || 'Erreur lors du chargement du produit');
            }
            
            setProduct(res.data.data);
            return res.data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message 
                || err.message 
                || 'Erreur lors du chargement du produit';
            setError(errorMessage);
            setProduct(null);
            throw new Error(errorMessage);
        }
    };

    // Charger les produits
    const loadProducts = async () => {
        try {
            setError(null);
            const { keyword, category, sort } = filters;
            const res = await axiosInstance.get('/products', {
                params: {
                    page,
                    keyword,
                    category,
                    sort
                }
            });
            
            if (!res.data || !res.data.success) {
                throw new Error(res.data?.message || 'Erreur lors du chargement des produits');
            }
            
            setProducts(res.data.products || []);
            setPages(res.data.pages || 1);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error('Erreur lors du chargement des produits:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des produits');
            setProducts([]);
            setPages(1);
            setTotal(0);
        }
    };

    // Ajouter un commentaire
    const addReview = async (productId, reviewData) => {
        try {
            const res = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
            if (product && product._id === productId) {
                await loadProduct(productId);
            }
            return res.data;
        } catch (err) {
            throw err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
        }
    };

    // Mettre à jour les filtres
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Réinitialiser la page lors du changement de filtres
    };

    // Effet pour charger les produits lorsque les filtres ou la page changent
    useEffect(() => {
        loadProducts();
    }, [filters, page]);

    const value = {
        products,
        product,
        error,
        page,
        pages,
        total,
        filters,
        setPage,
        loadProduct,
        addReview,
        updateFilters
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}; 