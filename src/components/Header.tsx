import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBasicAuth } from '../hooks/useBasicAuth';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { logout: basicLogout } = useBasicAuth();

  const handleLogout = async () => {
    await logout();
    basicLogout(); // Basic認証もログアウト
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>TasmaneV2</h1>
        
        <div className="user-info">
          <span className="user-email">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;