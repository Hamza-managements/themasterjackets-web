// src/components/auth/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './UseAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/auth/login" replace />;
};

export default PrivateRoute;