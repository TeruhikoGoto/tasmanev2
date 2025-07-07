import { useAuth } from './hooks/useAuth';
import { useBasicAuth } from './hooks/useBasicAuth';
import { useTimeTracking } from './hooks/useTimeTracking';
import TimeTrackingSheet from './components/TimeTrackingSheet';
import SessionSidebar from './components/SessionSidebar';
import LoginForm from './components/LoginForm';
import BasicAuth from './components/BasicAuth';
import Header from './components/Header';
import './App.css';

function App() {
  const { isAuthenticated: basicAuthStatus, isLoading: basicAuthLoading, login: basicLogin } = useBasicAuth();
  const { user, loading } = useAuth();
  const {
    sessionsByDate,
    currentSession,
    loading: sessionsLoading,
    startNewSession,
    loadSession,
    updateEntries,
    insertRowAfter
  } = useTimeTracking();

  // Basic認証のチェック
  if (basicAuthLoading) {
    return (
      <div className="App">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>認証を確認中...</p>
        </div>
      </div>
    );
  }

  if (!basicAuthStatus) {
    return (
      <div className="App">
        <BasicAuth onAuthenticated={basicLogin} />
      </div>
    );
  }

  // Firebase認証のチェック（Basic認証通過後）
  if (loading) {
    return (
      <div className="App">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="app-layout">
        <SessionSidebar
          sessionsByDate={sessionsByDate}
          currentSessionId={currentSession.id}
          onSessionSelect={loadSession}
          onNewSession={startNewSession}
          loading={sessionsLoading}
        />
        <main className="app-main">
          <TimeTrackingSheet 
            key={`timesheet-${currentSession.id}-${currentSession.sessionDate}`}
            currentSession={currentSession}
            onUpdateEntries={updateEntries}
            onInsertRowAfter={insertRowAfter}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
