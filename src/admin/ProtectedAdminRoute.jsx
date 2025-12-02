import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    setIsAuthenticated(!!adminToken);
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedAdminRoute;
