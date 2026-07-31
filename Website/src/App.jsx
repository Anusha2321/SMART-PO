import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import CreateOrder from './pages/CreateOrder';
import Orders from './pages/Orders';
import AiOrderAssistant from './pages/AiOrderAssistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('smartpo_user');
  const hasRegistered = !!localStorage.getItem('smartpo_registered');

  if (!isLoggedIn) {
    if (!hasRegistered) {
      return <Navigate to="/signup" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const isLoggedIn = !!localStorage.getItem('smartpo_user');
  const hasRegistered = !!localStorage.getItem('smartpo_registered');

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> :
            hasRegistered ? <Navigate to="/login" replace /> :
            <Navigate to="/welcome" replace />
          } />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
          <Route path="/create-order" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiOrderAssistant /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
