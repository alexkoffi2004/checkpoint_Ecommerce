import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';
import Layout from './components/layout/Layout';
import Home from './components/home/Home';
import Dashboard from './components/admin/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import Cart from './components/cart/Cart';
import AdminProducts from './components/admin/AdminProducts';
import AdminProductForm from './components/admin/AdminProductForm';
import AdminLayout from './components/admin/AdminLayout';
import Profile from './components/profile/Profile';
import AdminOrders from './components/admin/AdminOrders';
import AdminCustomers from './components/admin/AdminCustomers';
import AdminCategories from './components/admin/AdminCategories';
import AdminReviews from './components/admin/AdminReviews';
import Checkout from './components/checkout/Checkout';
import Favorites from './components/Favorites';

// Création du thème
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    components: {
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#f8f9fa',
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <ProductProvider>
                    <CartProvider>
                        <FavoriteProvider>
                            <Router>
                                <div className="min-h-screen bg-gray-50">
                                    <Routes>
                                        {/* Routes publiques sans layout */}
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/profile" element={
                                            <PrivateRoute>
                                                <Profile />
                                            </PrivateRoute>
                                        } />

                                        {/* Routes admin */}
                                        <Route path="/admin" element={
                                            <AdminRoute>
                                                <AdminLayout />
                                            </AdminRoute>
                                        }>
                                            <Route index element={<Dashboard />} />
                                            <Route path="products" element={<AdminProducts />} />
                                            <Route path="products/new" element={<AdminProductForm />} />
                                            <Route path="products/:id" element={<AdminProductForm />} />
                                            <Route path="orders" element={<AdminOrders />} />
                                            <Route path="customers" element={<AdminCustomers />} />
                                            <Route path="categories" element={<AdminCategories />} />
                                            <Route path="reviews" element={<AdminReviews />} />
                                        </Route>

                                        {/* Routes publiques avec layout */}
                                        <Route element={<Layout />}>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/products" element={<ProductList />} />
                                            <Route path="/products/:id" element={<ProductDetail />} />
                                            <Route path="/cart" element={<Cart />} />
                                            <Route path="/checkout" element={<Checkout />} />
                                            <Route path="/favorites" element={<Favorites />} />
                                        </Route>
                                    </Routes>
                                </div>
                            </Router>
                        </FavoriteProvider>
                    </CartProvider>
                </ProductProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 