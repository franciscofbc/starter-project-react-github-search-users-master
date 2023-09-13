import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import loadingImage from '../images/preloader.gif';

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const isUser = user && isAuthenticated;

  if (isLoading) {
    return <img src={loadingImage} alt="loading" className="loading-img" />;
  }

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (!isUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
