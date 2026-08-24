import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../common/LoadingSpinner';
import './ListaOrdenes.css';

const ListaOrdenes = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ estado: '', placa: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const opcionesEstado = [
    'RECIBIDA',
    'DIAGNOSTICO',
    'EN_PROCESO',
    'LISTA',
    'ENTREGADA',
    'CANCELADA'
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        estado: filters.estado || undefined,
        placa: filters.placa || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize
      };

      const response = await api.get('/ordenes-trabajo', { params });
      setOrders(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters.estado, filters.placa, pagination.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleViewOrder = (id) => {
    navigate(`/ordenes/${id}`);
  };

  const handleNewOrder = () => {
    navigate('/ordenes/nueva');
  };

  const obtenerColorEstado = (estado) => {
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="lista-ordenes-container">
      <div className="header-actions">
        <h1 className="page-title">Órdenes de Trabajo</h1>
        <button onClick={handleNewOrder} className="btn-primary">
          + Nueva Orden
        </button>
      </div>
      
      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Estado:</label>
          <select
            name="estado"
            value={filters.estado}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {opcionesEstado.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Placa:</label>
          <input
            type="text"
            name="placa"
            value={filters.placa}
            onChange={handleFilterChange}
            placeholder="Buscar por placa..."
            className="filter-input"
          />
        </div>
        
        <button onClick={fetchOrders} className="btn-filter">
          🔍 Buscar
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Tabla de órdenes */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Placa</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Fecha Entrada</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No hay órdenes registradas
                </td>
              </tr>
            ) : (
              orders.map(orden => (
                <tr key={orden.id}>
                  <td>#{orden.id}</td>
                  <td>{orden.moto?.placa || 'N/A'}</td>
                  <td>{orden.moto?.cliente?.nombre || 'N/A'}</td>
                  <td>
                    <span className={`estado-badge ${obtenerColorEstado(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td>{formatDate(orden.fechaIngreso)}</td>
                  <td className="total-cell">{formatCurrency(orden.total)}</td>
                  <td>
                    <button 
                      onClick={() => handleViewOrder(orden.id)}
                      className="btn-view"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="pagination-section">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-page"
          >
            ◀ Anterior
          </button>
          <span className="page-info">
            Página {pagination.page} de {pagination.totalPages}
            <span className="total-records">
              ({pagination.total} órdenes)
            </span>
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn-page"
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default ListaOrdenes;