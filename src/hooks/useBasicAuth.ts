import { useState, useEffect } from 'react';

export const useBasicAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // ページ読み込み時にlocalStorageから認証状態を確認
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('basicAuth');
        setIsAuthenticated(authStatus === 'authenticated');
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    localStorage.setItem('basicAuth', 'authenticated');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('basicAuth');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};