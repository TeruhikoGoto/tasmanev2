import { useAuth } from './hooks/useAuth';
import { useTimeTracking } from './hooks/useTimeTracking';
import TimeTrackingSheet from './components/TimeTrackingSheet';
import SessionSidebar from './components/SessionSidebar';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const {
    sessionsByDate,
    currentSession,
    loading: sessionsLoading,
    startNewSession,
    loadSession
  } = useTimeTracking();

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
          <TimeTrackingSheet />
        </main>
      </div>
    </div>
  );
}

export default App;
