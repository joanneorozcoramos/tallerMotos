import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import './Usuarios.css';

const Usuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'MECANICO'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', nuevoUsuario);
      setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'MECANICO' });
      setMostrarFormulario(false);
      await cargarUsuarios();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleToggleActivo = async (id, activo) => {
    try {
      await api.put(`/auth/usuarios/${id}`, { activo: !activo });
      await cargarUsuarios();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  if (loading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1 className="page-title">👥 Gestión de Usuarios</h1>
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn-primary"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleCrearUsuario} className="usuario-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre"
              value={nuevoUsuario.nombre}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
              className="form-input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
              className="form-input"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
              className="form-input"
              required
            />
            <select
              value={nuevoUsuario.rol}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
              className="form-select"
            >
              <option value="MECANICO">MECANICO</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button type="submit" className="btn-success">Crear</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No hay usuarios registrados</td>
              </tr>
            ) : (
              usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>#{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`rol-badge ${usuario.rol === 'ADMIN' ? 'rol-admin' : 'rol-mecanico'}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                      {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActivo(usuario.id, usuario.activo)}
                      className="btn-toggle"
                    >
                      {usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;