import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { usuario, logout, esAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏍️ Taller Motos
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Órdenes</Link>
          {esAdmin() && (
            <Link to="/usuarios" className="nav-link">Usuarios</Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">
            👤 {usuario?.nombre} ({usuario?.rol})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;