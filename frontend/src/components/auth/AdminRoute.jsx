import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    console.log('AdminRoute - User:', user);
    console.log('AdminRoute - Loading:', loading);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!user || user.role !== 'admin') {
        console.log('AdminRoute - Redirection: Utilisateur non admin');
        return <Navigate to="/" replace />;
    }

    console.log('AdminRoute - Accès autorisé');
    return children;
};

export default AdminRoute; 