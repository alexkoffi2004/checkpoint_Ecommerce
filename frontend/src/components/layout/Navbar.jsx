import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoriteContext';
import { FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartItems = [] } = useCart() || {};
    const { favorites = [] } = useFavorites() || {};

    const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;
    const cartItemsCount = Array.isArray(cartItems) ? cartItems.length : 0;

    return (
        <nav className="bg-white shadow-md fixed w-full top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        E-Shops
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link to="/products" className="text-gray-600 hover:text-primary transition-colors">
                            Produit
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/favorites"
                                    className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                                >
                                    <FaHeart className="text-xl" />
                                    {favoritesCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {favoritesCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/cart"
                                    className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                                >
                                    <FaShoppingCart className="text-xl" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="relative group">
                                    <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                                        <FaUser className="text-xl" />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            Mon Profil
                                        </Link>
                                        {user.isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            >
                                                Administration
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                        >
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 