import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Navbar from './components/common/Navbar';
import ListaOrdenes from './components/ordenes/ListaOrdenes';
import CrearOrden from './components/ordenes/CrearOrden';
import DetalleOrden from './components/ordenes/DetalleOrden';
import Usuarios from './components/admin/Usuarios';
import './App.css';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ListaOrdenes />
          </ProtectedRoute>
        } />
        <Route path="/ordenes/nueva" element={
          <ProtectedRoute>
            <CrearOrden />
          </ProtectedRoute>
        } />
        <Route path="/ordenes/:id" element={
          <ProtectedRoute>
            <DetalleOrden />
          </ProtectedRoute>
        } />
        <Route path="/usuarios" element={
          <ProtectedRoute requiredRole="ADMIN">
            <Usuarios />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;