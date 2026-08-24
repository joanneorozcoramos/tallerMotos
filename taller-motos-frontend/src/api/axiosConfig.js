import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {

      const message = error.response.data?.error || 'Error en el servidor';
      const details = error.response.data?.details || [];
      return Promise.reject({ message, details, status: error.response.status });
    }
    if (error.request) {
      return Promise.reject({ message: 'No se pudo conectar con el servidor' });
    }
    return Promise.reject({ message: error.message });
  }
);

export default api;