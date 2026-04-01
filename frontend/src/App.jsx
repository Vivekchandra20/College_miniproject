/**
 * Main App Component
 * Root component with routing logic
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {currentPage === 'login' ? (
          <LoginPage
            onSuccess={() => setCurrentPage('chat')}
          />
        ) : (
          <RegisterPage
            onSuccess={(data) => {
              if (data?.page === 'login') {
                setCurrentPage('login');
              } else {
                setCurrentPage('chat');
              }
            }}
          />
        )}
      </>
    );
  }

  if (currentPage === 'profile') {
    return <ProfilePage onBack={() => setCurrentPage('chat')} />;
  }

  return <ChatPage onOpenProfile={() => setCurrentPage('profile')} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
