import { Navigate, Outlet } from 'react-router-dom';
import './ProtectedRoute.css';
import React, { useContext } from 'react';
import AppContext from '../../state/AppContext';

function ProtectedRoute() {
    const { isAuthenticated } = useContext(AppContext);

    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

export default ProtectedRoute;