
import React from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return currentUser ? <Dashboard /> : <Login />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;
