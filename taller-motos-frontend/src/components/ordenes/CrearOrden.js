import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../common/LoadingSpinner';
import './CrearOrden.css';

const CrearOrden = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [motos, setMotos] = useState([]);
  const [buscarPlaca, setBuscarPlaca] = useState('');
  const [seleccionarMotoId, setSeleccionarMotoId] = useState('');
  const [esMotoNueva, setEsMotoNueva] = useState(false);
  

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    email: ''
  });
  
  // Estado para moto nueva
  const [motoNueva, setMotoNueva] = useState({
    placa: '',
    marca: '',
    modelo: '',
    cilindraje: ''
  });
  
  // Estado para orden
  const [ordenTrabajo, setOrdenTrabajo] = useState({
    descripcion_motivo: ''
  });

  // Buscar motos por placa
useEffect(() => {
  console.log('🔍 Buscando placa:', buscarPlaca);  // ✅ Agrega esto
  
  const buscarMotos = async () => {
    if (buscarPlaca.length >= 2) {
      try {
        console.log('📤 Haciendo petición a /motos?placa=', buscarPlaca);  // ✅ Agrega esto
        const response = await api.get(`/motos?placa=${buscarPlaca}`);
        console.log('📦 Respuesta del backend:', response.data);  // ✅ Agrega esto
        
        // ✅ VERIFICAR la estructura de la respuesta
        if (response.data && response.data.data) {
          setMotos(response.data.data);
        } else if (Array.isArray(response.data)) {
          setMotos(response.data);
        } else {
          setMotos([]);
        }
      } catch (err) {
        console.error('❌ Error buscando motos:', err);
        setMotos([]);
      }
    } else {
      setMotos([]);
    }
  };
  
  const delayDebounce = setTimeout(buscarMotos, 500);
  return () => clearTimeout(delayDebounce);
}, [buscarPlaca]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    let motoId;
    let clienteId = null;

    if (seleccionarMotoId) {
      motoId = seleccionarMotoId;
    } else {
      // ✅ 1. VALIDAR QUE LA PLACA NO EXISTA YA
      if (!motoNueva.placa || !motoNueva.marca || !motoNueva.modelo) {
        throw new Error('Placa, marca y modelo de la moto son obligatorios');
      }

      console.log('🔍 Verificando si la placa ya existe:', motoNueva.placa);
      
      // ✅ Buscar si ya existe una moto con esa placa
      const busquedaResponse = await api.get(`/motos?placa=${motoNueva.placa}`);
      const motosExistentes = busquedaResponse.data?.data || [];
      
      if (motosExistentes.length > 0) {
        // ✅ Si ya existe, mostrar error y NO crear nada
        throw new Error('Ya existe una moto con esta placa');
      }

      // ✅ 2. SI NO EXISTE, CREAR CLIENTE Y MOTO
      if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
        throw new Error('Nombre y teléfono del cliente son obligatorios');
      }

      // Crear cliente
      const clienteResponse = await api.post('/clientes', nuevoCliente);
      clienteId = clienteResponse.data.data.id;

      // Crear moto
      const motoResponse = await api.post('/motos', {
        ...motoNueva,
        clienteId
      });
      motoId = motoResponse.data.data.id;
    }

    // Crear orden
    const ordenResponse = await api.post('/ordenes-trabajo', {
      motoId: motoId,
      descripcion_motivo: ordenTrabajo.descripcion_motivo
    });

    navigate(`/ordenes/${ordenResponse.data.data.id}`);

  } catch (err) {
    console.error('❌ Error al crear la orden:', err);
    
    let mensajeError = 'Error al crear la orden';
    
    if (err.details && err.details.length > 0) {
      mensajeError = err.details[0];
    } else if (err.message) {
      mensajeError = err.message;
    }
    
    if (mensajeError.toLowerCase().includes('placa')) {
      mensajeError = mensajeError;
    }
    
    setError(mensajeError);
    
  } finally {
    setLoading(false);
  }
};

  const handleSelectMoto = (motoId) => {
    setSeleccionarMotoId(motoId);
    setEsMotoNueva(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="crear-orden-container">
      <h1 className="page-title">Nueva Orden de Trabajo</h1>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="orden-form">
        {/* Selección de Moto */}
        <div className="form-section">
          <h3>1. Moto</h3>
          
          <div className="moto-search">
            <div className="form-group">
              <label>Buscar moto por placa:</label>
              <input
                type="text"
                value={buscarPlaca}
                onChange={(e) => {
                  setBuscarPlaca(e.target.value);
                  setEsMotoNueva(false);
                  setSeleccionarMotoId('');
                }}
                placeholder="Ingrese placa..."
                className="form-input"
              />
            </div>
          </div>

          {motos.length > 0 && !esMotoNueva && (
            <div className="moto-results">
              <label>Motos encontradas:</label>
              <div className="moto-list">
                {motos.map(moto => (
                  <div 
                    key={moto.id} 
                    className={`moto-item ${seleccionarMotoId === moto.id ? 'selected' : ''}`}
                    onClick={() => handleSelectMoto(moto.id)}
                  >
                    <span className="moto-placa">{moto.placa}</span>
                    <span className="moto-info">{moto.marca} - {moto.modelo}</span>
                    <span className="moto-cliente">{moto.cliente?.nombre || 'Sin cliente'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="new-moto-toggle">
            <button 
              type="button"
              onClick={() => {
                setEsMotoNueva(true);
                setSeleccionarMotoId('');
                setBuscarPlaca('');
                setMotos([]);
              }}
              className="btn-secondary"
            >
              + Registrar nueva moto
            </button>
          </div>

          {esMotoNueva && (
            <div className="new-moto-form">
              <h4>Datos de la moto</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Placa *</label>
                  <input
                    type="text"
                    value={motoNueva.placa}
                    onChange={(e) => setMotoNueva({...motoNueva, placa: e.target.value.toUpperCase()})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Marca *</label>
                  <input
                    type="text"
                    value={motoNueva.marca}
                    onChange={(e) => setMotoNueva({...motoNueva, marca: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="text"
                    value={motoNueva.modelo}
                    onChange={(e) => setMotoNueva({...motoNueva, modelo: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cilindraje</label>
                  <input
                    type="number"
                    value={motoNueva.cilindraje}
                    onChange={(e) => setMotoNueva({...motoNueva, cilindraje: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <h4>Datos del cliente</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={nuevoCliente.nombre}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="text"
                    value={nuevoCliente.telefono}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={nuevoCliente.email}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Descripción de la Orden */}
        <div className="form-section">
          <h3>2. Descripción del motivo</h3>
          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              value={ordenTrabajo.descripcion_motivo}
              onChange={(e) => setOrdenTrabajo({...ordenTrabajo, descripcion_motivo: e.target.value})}
              className="form-textarea"
              rows="4"
              placeholder="Describa la falla o el trabajo a realizar..."
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="btn-submit">
            Crear Orden
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearOrden;