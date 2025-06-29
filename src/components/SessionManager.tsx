import React, { useState } from 'react';
import './SessionManager.css';

interface SessionManagerProps {
  allSessions: any[];
  currentSessionId?: string;
  isSaving: boolean;
  onSave: (sessionName?: string) => Promise<boolean>;
  onNewSession: () => void;
  onLoadSession: (sessionId: string) => void;
  totalHours: number;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  allSessions,
  currentSessionId,
  isSaving,
  onSave,
  onNewSession,
  onLoadSession,
  totalHours
}) => {
  const [sessionName, setSessionName] = useState('');
  const [showSessions, setShowSessions] = useState(false);

  const handleSave = async () => {
    const success = await onSave(sessionName || undefined);
    if (success) {
      setSessionName('');
      alert('保存しました！');
    } else {
      alert('保存に失敗しました。');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleString('ja-JP');
  };

  return (
    <div className="session-manager">
      <div className="session-controls">
        <div className="save-section">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="セッション名（省略可）"
            className="session-name-input"
          />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="save-btn"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>

        <div className="session-info">
          <span className="total-hours">合計時間: {totalHours}分</span>
        </div>

        <div className="session-actions">
          <button 
            onClick={onNewSession}
            className="new-session-btn"
          >
            新規セッション
          </button>
          <button 
            onClick={() => setShowSessions(!showSessions)}
            className="toggle-sessions-btn"
          >
            {showSessions ? '履歴を隠す' : '履歴を表示'}
          </button>
        </div>
      </div>

      {showSessions && (
        <div className="sessions-list">
          <h3>保存済みセッション</h3>
          {allSessions.length === 0 ? (
            <p className="no-sessions">保存済みセッションはありません</p>
          ) : (
            <div className="sessions-grid">
              {allSessions.map((session) => (
                <div 
                  key={session.id}
                  className={`session-item ${session.id === currentSessionId ? 'current' : ''}`}
                  onClick={() => onLoadSession(session.id)}
                >
                  <div className="session-name">
                    {session.sessionName || '無題のセッション'}
                  </div>
                  <div className="session-meta">
                    <span className="session-date">
                      {formatDate(session.createdAt)}
                    </span>
                    <span className="session-hours">
                      {session.totalHours || 0}分
                    </span>
                  </div>
                  {session.id === currentSessionId && (
                    <div className="current-indicator">現在のセッション</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;