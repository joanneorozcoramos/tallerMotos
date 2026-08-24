import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);


  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };


  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, usuario } = response.data.data;
        setToken(token);
        setUsuario(usuario);
        setAuthToken(token);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };


  const logout = () => {
    setUsuario(null);
    setToken(null);
    setAuthToken(null);
  };


  useEffect(() => {
    const cargarUsuario = async () => {
      if (token) {
        try {
          setAuthToken(token);
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUsuario(response.data.data);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    cargarUsuario();
  }, []);


  const esAdmin = () => usuario?.rol === 'ADMIN';
  const esMecanico = () => usuario?.rol === 'MECANICO';

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      login,
      logout,
      esAdmin,
      esMecanico,
      isAuthenticated: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;