import React from 'react';
import './SessionManager.css';

interface SessionManagerProps {
  isSaving: boolean;
  onSave: () => Promise<boolean>;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  isSaving,
  onSave
}) => {

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      alert('保存しました！');
    } else {
      alert('保存に失敗しました。');
    }
  };


  return (
    <div className="session-manager">
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="save-btn-fixed"
      >
        {isSaving ? '保存中...' : '保存'}
      </button>
    </div>
  );
};

export default SessionManager;