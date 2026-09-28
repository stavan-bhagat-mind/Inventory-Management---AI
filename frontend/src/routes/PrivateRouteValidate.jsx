import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

export const PrivateRouteValidate = () => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};
