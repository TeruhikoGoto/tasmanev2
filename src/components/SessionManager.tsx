import React from 'react';
import './SessionManager.css';

interface SessionManagerProps {
  isSaving: boolean;
  onSave: () => Promise<boolean>;
  entries: any[];
}

const SessionManager: React.FC<SessionManagerProps> = () => {
  return null;
};

export default SessionManager;