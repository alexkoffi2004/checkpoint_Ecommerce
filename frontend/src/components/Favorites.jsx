import React, { useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Favorites = () => {
    const { favorites, loading, error, removeFromFavorites, loadFavorites } = useFavorites();
    const { addToCart } = useCart();

    useEffect(() => {
        loadFavorites();
    }, []);

    const handleAddToCart = async (product) => {
        await addToCart(product._id, 1);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erreur !</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Mes Favoris</h1>
            
            {favorites.length === 0 ? (
                <div className="text-center py-12">
                    <FaHeart className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">Votre liste de favoris est vide</h2>
                    <p className="text-gray-500 mb-8">Découvrez nos produits et ajoutez vos favoris !</p>
                    <Link
                        to="/products"
                        className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Voir les produits
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <Link to={`/product/${product._id}`}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/product/${product._id}`} className="block">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-primary">
                                        {product.price.toLocaleString()} FCFA
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Stock: {product.countInStock}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.countInStock === 0}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                                            product.countInStock === 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-primary hover:bg-primary-dark'
                                        }`}
                                    >
                                        <FaShoppingCart />
                                        Ajouter au panier
                                    </button>
                                    <button
                                        onClick={() => removeFromFavorites(product._id)}
                                        className="flex items-center justify-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites; 