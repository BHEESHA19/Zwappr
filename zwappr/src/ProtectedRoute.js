import React from 'react';
import { isLoggedIn } from './AuthServices';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    return isLoggedIn() ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
