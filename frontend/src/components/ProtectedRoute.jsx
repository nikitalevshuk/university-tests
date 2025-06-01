import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService, apiUtils } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[#f5e8d0] animate-spin mx-auto mb-4" />
          <div className="text-[#f5e8d0] text-sm">Проверка авторизации...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 