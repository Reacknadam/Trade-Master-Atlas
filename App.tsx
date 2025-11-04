
import React from 'react';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app-container">
        <Dashboard />
      </div>
    </AuthProvider>
  );
};

export default App;
