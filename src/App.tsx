import { useAuth } from './hooks/useAuth';
import TimeTrackingSheet from './components/TimeTrackingSheet';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import './App.css';

function App() {
  const { user, loading } = useAuth();

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
      <main className="app-main">
        <TimeTrackingSheet />
      </main>
    </div>
  );
}

export default App;
