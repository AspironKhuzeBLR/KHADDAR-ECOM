import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken') ||
      sessionStorage.getItem('khaddar.auth.token') ||
      sessionStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedAdminRoute;
