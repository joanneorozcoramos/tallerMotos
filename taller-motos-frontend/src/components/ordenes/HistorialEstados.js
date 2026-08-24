import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import './HistorialEstados.css';

const HistorialEstados = ({ ordenId }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    cargarHistorial();
  }, [ordenId, paginacion.page]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ordenes-trabajo/${ordenId}/historial`, {
        params: {
          page: paginacion.page,
          limit: paginacion.limit
        }
      });

      if (response.data.success) {
        setHistorial(response.data.data);
        setPaginacion({
          ...paginacion,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        });
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    const colors = {
      RECIBIDA: 'estado-recibida',
      DIAGNOSTICO: 'estado-diagnostico',
      EN_PROCESO: 'estado-en-proceso',
      LISTA: 'estado-lista',
      ENTREGADA: 'estado-entregada',
      CANCELADA: 'estado-cancelada'
    };
    return colors[estado] || '';
  };

  if (loading) {
    return <div className="historial-loading">Cargando historial...</div>;
  }

  if (error) {
    return <div className="historial-error">⚠️ {error}</div>;
  }

  if (historial.length === 0) {
    return (
      <div className="historial-vacio">
        <p>📋 No hay cambios de estado registrados</p>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <h4>📜 Historial de Cambios</h4>
      
      <div className="historial-timeline">
        {historial.map((evento, index) => (
          <div key={evento.id} className="historial-item">
            <div className="historial-marker">
              <span className="marker-dot"></span>
              {index < historial.length - 1 && <span className="marker-line"></span>}
            </div>
            
            <div className="historial-content">
              <div className="historial-header">
                <div className="historial-usuario">
                  <strong>👤 {evento.usuario?.nombre || 'Usuario desconocido'}</strong>
                  <span className="historial-rol">({evento.usuario?.rol || 'N/A'})</span>
                </div>
                <span className="historial-fecha">{formatDate(evento.created_at)}</span>
              </div>
              
              <div className="historial-cambio">
                <span className={`estado-badge ${getEstadoColor(evento.desde_estado)}`}>
                  {evento.desde_estado || 'INICIO'}
                </span>
                <span className="historial-flecha">→</span>
                <span className={`estado-badge ${getEstadoColor(evento.hacia_estado)}`}>
                  {evento.hacia_estado}
                </span>
              </div>
              
              {evento.nota && (
                <div className="historial-nota">
                  💬 {evento.nota}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <div className="historial-paginacion">
          <button
            onClick={() => setPaginacion({...paginacion, page: paginacion.page - 1})}
            disabled={paginacion.page === 1}
            className="btn-page"
          >
            ◀ Anterior
          </button>
          <span>
            Página {paginacion.page} de {paginacion.totalPages}
          </span>
          <button
            onClick={() => setPaginacion({...paginacion, page: paginacion.page + 1})}
            disabled={paginacion.page === paginacion.totalPages}
            className="btn-page"
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialEstados;