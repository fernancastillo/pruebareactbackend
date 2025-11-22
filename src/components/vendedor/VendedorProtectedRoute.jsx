import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../utils/tienda/authService';

const VendedorProtectedRoute = ({ children }) => {
    const isAuthenticated = authService.isAuthenticated();
    const userType = authService.getUserType();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (userType !== 'Vendedor') {
        return <Navigate to="/index" replace />;
    }

    return children;
};

export default VendedorProtectedRoute;