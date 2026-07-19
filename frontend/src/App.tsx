import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Academics from './pages/Academics';
import ForYou from './pages/ForYou';
import Leaderboard from './pages/Leaderboard';
import Feedback from './pages/Feedback';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-accent animate-spin"></div>
          <p className="text-accent text-sm tracking-wider uppercase animate-pulse">Loading Nexora...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={token ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />} />
        <Route path="dashboard" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />} />
        <Route path="academics" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Academics />} />
        <Route path="foryou" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <ForYou />} />
        <Route path="leaderboard" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Leaderboard />} />
        <Route path="feedback" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Feedback />} />
        
        {/* Admin Only Route */}
        <Route
          path="admin"
          element={
            user?.role === 'admin' ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login?mode=admin" replace />
            )
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
