import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../common/LoadingSpinner';
import './DetalleOrden.css';
import HistorialEstados from './HistorialEstados';
import { useAuth } from '../../context/AuthContext';

const DetalleOrden = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, esAdmin } = useAuth();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  
  const [nuevoItem, setNuevoItem] = useState({
    tipo: 'REPUESTO',
    descripcion: '',
    cantidad: 1,
    valorUnitario: 0
  });

  const opcionesEstado = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];
  
  const validTransitions = {
    'RECIBIDA': ['DIAGNOSTICO', 'CANCELADA'],
    'DIAGNOSTICO': ['EN_PROCESO', 'CANCELADA'],
    'EN_PROCESO': ['LISTA', 'CANCELADA'],
    'LISTA': ['ENTREGADA', 'CANCELADA'],
    'ENTREGADA': [],
    'CANCELADA': []
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/ordenes-trabajo/${id}`);
      console.log('📦 Datos recibidos:', response.data);
      
      if (response.data && response.data.data) {
        setOrden(response.data.data);
      } else if (response.data) {
        setOrden(response.data);
      } else {
        setError('No se recibieron datos de la orden');
      }
    } catch (err) {
      console.error('❌ Error al cargar orden:', err);
      setError(err.error || 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

const handleStatusChange = async (nuevoEstado) => {
  if (!orden) return;
  
  const currentStatus = orden.estado;
  const isAdmin = esAdmin();
  
  console.log(`🔄 Intentando cambiar de ${currentStatus} a ${nuevoEstado}`);
  console.log(`👤 Rol: ${isAdmin ? 'ADMIN' : 'MECANICO'}`);
  
  // ✅ Si es ADMIN, permitir cambio desde cualquier estado (excepto mismo estado)
  if (isAdmin) {
    if (currentStatus === nuevoEstado) {
      setError(`⚠️ La orden ya está en estado ${nuevoEstado}`);
      return;
    }
    
    // ✅ ADMIN puede cambiar desde ENTREGADA o CANCELADA
    // Solo validamos que el nuevo estado sea diferente
    try {
      setUpdating(true);
      setError(null);
      
      // ✅ Si viene de ENTREGADA o CANCELADA, preguntar si está seguro
      if (['ENTREGADA', 'CANCELADA'].includes(currentStatus)) {
        const confirmacion = window.confirm(
          `⚠️ La orden está en estado "${currentStatus}".\n` +
          `¿Estás seguro de cambiarla a "${nuevoEstado}"?\n` +
          `Este cambio será registrado como "FORZADO POR ADMIN".`
        );
        
        if (!confirmacion) {
          setUpdating(false);
          return;
        }
      }
      
      console.log(`📤 Enviando PATCH a /ordenes-trabajo/${id}/estado con { estado: ${nuevoEstado} }`);
      
      const response = await api.patch(`/ordenes-trabajo/${id}/estado`, { 
        estado: nuevoEstado,
        nota: `Cambio forzado por ADMIN desde ${currentStatus} a ${nuevoEstado}`
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      await fetchOrder();
      
    } catch (err) {
      console.error('❌ Error al actualizar el estado:', err);
      setError(err.response?.data?.message || err.message || 'Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
    return;
  }
  
  // ✅ MECANICO: Validar transiciones normales
  // Verificar si la orden está entregada o cancelada
  if (['ENTREGADA', 'CANCELADA'].includes(currentStatus)) {
    setError(`❌ No se puede cambiar el estado de una orden ${currentStatus}. Solo ADMIN puede hacerlo.`);
    return;
  }
  
  // Verificar si es el mismo estado
  if (currentStatus === nuevoEstado) {
    setError(`⚠️ La orden ya está en estado ${nuevoEstado}`);
    return;
  }
  
  // Verificar transición válida
  const transicionesValidas = validTransitions[currentStatus] || [];
  if (!transicionesValidas.includes(nuevoEstado)) {
    setError(`❌ No se puede cambiar de ${currentStatus} a ${nuevoEstado}`);
    return;
  }

  try {
    setUpdating(true);
    setError(null);
    
    console.log(`📤 Enviando PATCH a /ordenes-trabajo/${id}/estado con { estado: ${nuevoEstado} }`);
    
    const response = await api.patch(`/ordenes-trabajo/${id}/estado`, { estado: nuevoEstado });
    
    console.log('✅ Respuesta del servidor:', response.data);
    await fetchOrder();
    
  } catch (err) {
    console.error('❌ Error al actualizar el estado:', err);
    setError(err.response?.data?.message || err.message || 'Error al actualizar el estado');
  } finally {
    setUpdating(false);
  }
};

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!orden) return;

    if (['ENTREGADA', 'CANCELADA'].includes(orden.estado)) {
      setError(`No se pueden agregar ítems a una orden ${orden.estado}`);
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await api.post(`/ordenes-trabajo/${id}/items`, nuevoItem);
      setNuevoItem({
        tipo: 'REPUESTO',
        descripcion: '',
        cantidad: 1,
        valorUnitario: 0
      });
      await fetchOrder();
    } catch (err) {
      setError(err.error || 'Error al agregar el ítem');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('¿Está seguro de eliminar este ítem?')) return;

    try {
      setUpdating(true);
      setError(null);
      await api.delete(`/ordenes-trabajo/items/${itemId}`);
      await fetchOrder();
    } catch (err) {
      setError(err.error || 'Error al eliminar el ítem');
    } finally {
      setUpdating(false);
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNuevoItem({
      ...nuevoItem,
      [name]: name === 'cantidad' || name === 'valorUnitario' ? parseFloat(value) || 0 : value
    });
  };

  const obtenerColoresEstado = (estado) => {
    const colors = {
      RECIBIDA: 'estado-recivido',
      DIAGNOSTICO: 'estado-diagnostico',
      EN_PROCESO: 'estado-en-proceso',
      LISTA: 'estado-lista',
      ENTREGADA: 'estado-entregada',
      CANCELADA: 'estado-cancelada'
    };
    return colors[estado] || '';
  };

  const obtenerIconoEstado = (estado) => {
    const icons = {
      RECIBIDA: '📥',
      DIAGNOSTICO: '🔍',
      EN_PROCESO: '🔧',
      LISTA: '✅',
      ENTREGADA: '🚚',
      CANCELADA: '❌'
    };
    return icons[estado] || '';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
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

  const calcularTotalItems = () => {
    if (!orden?.items) return 0;
    return orden.items.reduce((sum, item) => {
      return sum + (item.cantidad * item.valorUnitario);
    }, 0);
  };

  if (loading) return <LoadingSpinner />;

  if (error && !orden) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="btn-back">
          ← Volver al listado
        </button>
      </div>
    );
  }

  if (!orden) return null;

  const totalItems = calcularTotalItems();

  return (
    <div className="detalle-orden-container">
      <div className="detalle-header">
        <button onClick={() => navigate('/')} className="btn-back">
          ← Volver
        </button>
        <h1 className="page-title">
          Orden #{orden.id}
        </h1>
        <span className={`estado--badge-large ${obtenerColoresEstado(orden.estado)}`}>
          {obtenerIconoEstado(orden.estado)} {orden.estado}
        </span>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="detalle-grid">
        <div className="info-card">
          <h3>🚗 Información de la Moto</h3>
          <div className="info-row">
            <span className="info-label">Placa:</span>
            <span className="info-value">{orden.moto?.placa || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Marca:</span>
            <span className="info-value">{orden.moto?.marca || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Modelo:</span>
            <span className="info-value">{orden.moto?.modelo || 'N/A'}</span>
          </div>
          {orden.moto?.cilindraje && (
            <div className="info-row">
              <span className="info-label">Cilindraje:</span>
              <span className="info-value">{orden.moto.cilindraje} cc</span>
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>👤 Información del Cliente</h3>
          <div className="info-row">
            <span className="info-label">Nombre:</span>
            <span className="info-value">{orden.moto?.cliente?.nombre || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Teléfono:</span>
            <span className="info-value">{orden.moto?.cliente?.telefono || 'N/A'}</span>
          </div>
          {orden.moto?.cliente?.email && (
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{orden.moto?.cliente?.email}</span>
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>📋 Información de la Orden</h3>
          <div className="info-row">
            <span className="info-label">Fecha entrada:</span>
            <span className="info-value">{formatDate(orden.fechaIngreso)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Descripción:</span>
            <span className="info-value">{orden.descripcion_motivo || 'N/A'}</span>
          </div>
          <div className="info-row total-row">
            <span className="info-label">Total:</span>
            <span className="info-value total-value">{formatCurrency(orden.total)}</span>
          </div>
        </div>
      </div>

      {/* ✅ SECCIÓN DE CAMBIO DE ESTADO CORREGIDA */}
      <div className="estado-section">
        <h3>🔄 Cambiar Estado</h3>
        
        {/* ✅ Mostrar información de permisos */}
        {esAdmin() && (
          <div className="admin-badge">
            👑 Modo ADMIN: Puedes cambiar a cualquier estado
          </div>
        )}
        
        <div className="estado-buttons">
          {opcionesEstado.map(estado => {
            const isActive = orden.estado === estado;
            const isFinalState = ['ENTREGADA', 'CANCELADA'].includes(orden.estado);
            
            // ✅ ADMIN puede cambiar desde estados finales
            let isDisabled = false;
            
            if (isActive) {
              isDisabled = true; // Estado actual
            } else if (isFinalState) {
              // ✅ Si es ADMIN, puede cambiar (no está deshabilitado)
              isDisabled = !esAdmin();
            } else {
              // Para estados no finales, verificar transiciones válidas
              const transicionesValidas = validTransitions[orden.estado] || [];
              isDisabled = !transicionesValidas.includes(estado);
            }
            
            return (
              <button
                key={estado}
                onClick={() => handleStatusChange(estado)}
                disabled={isDisabled || updating}
                className={`estado-btn ${isActive ? 'active' : ''} 
                          ${isDisabled ? 'disabled' : ''}`}
                title={
                  isActive ? 'Estado actual' : 
                  isFinalState && !esAdmin() ? 'Orden finalizada - Solo ADMIN puede cambiar' : 
                  isDisabled && !isActive ? 'Transición no permitida' : 
                  'Cambiar a este estado'
                }
              >
                {obtenerIconoEstado(estado)} {estado}
                {isFinalState && esAdmin() && !isActive && ' 👑'}
              </button>
            );
          })}
        </div>
        
        <div className="estado-help">
          <small>💡 Solo se permiten transiciones válidas según el flujo de la orden</small>
          {esAdmin() && (
            <small className="admin-help">👑 ADMIN puede forzar cambios desde ENTREGADA o CANCELADA</small>
          )}
        </div>
      </div>

      <div className="items-section">
        <h3>📦 Ítems de la Orden</h3>
        
        {!['ENTREGADA', 'CANCELADA'].includes(orden.estado) && (
          <form onSubmit={handleAddItem} className="add-item-form">
            <div className="form-row">
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  name="tipo"
                  value={nuevoItem.tipo}
                  onChange={handleItemChange}
                  className="form-select"
                  required
                >
                  <option value="REPUESTO">Repuesto</option>
                  <option value="MANO_OBRA">Mano de Obra</option>
                </select>
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <input
                  type="text"
                  name="descripcion"
                  value={nuevoItem.descripcion}
                  onChange={handleItemChange}
                  className="form-input"
                  placeholder="Descripción del ítem"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cantidad:</label>
                <input
                  type="number"
                  name="cantidad"
                  value={nuevoItem.cantidad}
                  onChange={handleItemChange}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Valor Unitario:</label>
                <input
                  type="number"
                  name="valorUnitario"
                  value={nuevoItem.valorUnitario}
                  onChange={handleItemChange}
                  className="form-input"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <button type="submit" className="btn-add-item" disabled={updating}>
                  {updating ? 'Agregando...' : '+ Agregar'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="items-table-container">
          {orden.items && orden.items.length > 0 ? (
            <table className="items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Valor Unitario</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orden.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <span className={`item-type ${item.tipo === 'REPUESTO' ? 'type-repuesto' : 'type-mano'}`}>
                        {item.tipo === 'REPUESTO' ? '🔧 Repuesto' : '👨‍🔧 Mano Obra'}
                      </span>
                    </td>
                    <td>{item.descripcion}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatCurrency(item.valorUnitario)}</td>
                    <td className="subtotal">{formatCurrency(item.cantidad * item.valorUnitario)}</td>
                    <td>
                      {!['ENTREGADA', 'CANCELADA'].includes(orden.estado) && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="btn-delete-item"
                          disabled={updating}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="total-label">
                    <strong>TOTAL</strong>
                  </td>
                  <td className="total-footer">{formatCurrency(totalItems)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="no-items">
              No hay ítems registrados en esta orden
            </div>
          )}
        </div>
      </div>

      <div className="historial-toggle">
        <button 
          onClick={() => setMostrarHistorial(!mostrarHistorial)}
          className="btn-historial"
        >
          {mostrarHistorial ? '📜 Ocultar Historial' : '📜 Ver Historial'}
        </button>
      </div>

      {/* ✅ Mostrar historial si está activo */}
      {mostrarHistorial && (
        <HistorialEstados ordenId={orden.id} />
      )}
    </div>
  );
};

export default DetalleOrden;