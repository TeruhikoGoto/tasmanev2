import React, { useState } from 'react';
import './BasicAuth.css';

interface BasicAuthProps {
  onAuthenticated: () => void;
}

const BasicAuth: React.FC<BasicAuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Basic認証の認証情報（本来は環境変数やサーバーサイドで管理）
  const BASIC_AUTH_USERNAME = import.meta.env.VITE_BASIC_AUTH_USERNAME || 'admin';
  const BASIC_AUTH_PASSWORD = import.meta.env.VITE_BASIC_AUTH_PASSWORD || 'password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 簡単な認証チェック
      if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
        // 認証成功時にlocalStorageに保存
        localStorage.setItem('basicAuth', 'authenticated');
        onAuthenticated();
      } else {
        setError('ユーザー名またはパスワードが正しくありません');
      }
    } catch (err) {
      setError('認証中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="basic-auth-container">
      <div className="basic-auth-card">
        <div className="basic-auth-header">
          <h2>ログイン</h2>
          <p>アクセスするには認証が必要です</p>
        </div>

        <form onSubmit={handleSubmit} className="basic-auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="basic-auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="basic-auth-footer">
          <p>デモ用認証: admin / password</p>
        </div>
      </div>
    </div>
  );
};

export default BasicAuth;