import { Navigate, Outlet } from 'react-router-dom';
import './ProtectedRoute.css';
import React, { useContext } from 'react';
import AppContext from '../../state/AppContext';

function ProtectedRoute() {
    const { auth } = useContext(AppContext);
    return auth.isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

export default ProtectedRoute;