import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const { user } = useAuth();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        await addToCart(product._id, 1);
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        if (!user) {
            // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
            window.location.href = '/login';
            return;
        }

        if (isFavorite(product._id)) {
            await removeFromFavorites(product._id);
        } else {
            await addToFavorites(product._id);
        }
    };

    return (
        <Link to={`/product/${product._id}`} className="block">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                    />
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    >
                        <FaHeart
                            className={`text-xl ${
                                isFavorite(product._id)
                                    ? 'text-red-500'
                                    : 'text-gray-400 hover:text-red-500'
                            }`}
                        />
                    </button>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-primary">
                            {product.price.toLocaleString()} FCFA
                        </span>
                        <span className="text-sm text-gray-500">
                            Stock: {product.countInStock}
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.countInStock === 0}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                            product.countInStock === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-dark'
                        }`}
                    >
                        <FaShoppingCart />
                        Ajouter au panier
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard; 