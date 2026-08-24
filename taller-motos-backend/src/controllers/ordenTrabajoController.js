const { OrdenTrabajo, Moto, Cliente, Item, Usuario } = require('../models');
const { esValido, esAdminValido, esEstadoFinal, esCambioForzado } = require('../utilidades/estadoOrden');
const { Op } = require('sequelize');
const { registrarCambioEstado } = require('./historialController');

const crearOrdenTrabajo = async (req, res, next) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const { motoId, descripcion_motivo, items } = req.body;
    

    const moto = await Moto.findByPk(motoId);
    if (!moto) {
      const error = new Error('Moto no encontrada');
      error.statusCode = 404;
      throw error;
    }
    

    const ordenTrabajo = await OrdenTrabajo.create({
      motoId,
      descripcion_motivo,
      estado: 'RECIBIDA',
      total: 0
    }, { transaction });
    

    let total = 0;
    if (items && items.length > 0) {
      const items = [];
      for (const item of items) {
        const { tipo, descripcion, cantidad, valorUnitario } = item;
        
        const item = await Item.create({
          ordenId: ordenTrabajo.id,
          tipo,
          descripcion,
          cantidad,
          valor_unitario
        }, { transaction });
        
        total += cantidad * valorUnitario;
        items.push(item);
      }
      

      await ordenTrabajo.update({ total }, { transaction });
    }
    
    await transaction.commit();
    

    const fullOrder = await OrdenTrabajo.findByPk(ordenTrabajo.id, {
      include: [
        { model: Moto, as: 'moto', include: ['cliente'] },
        { model: Item, as: 'items' }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: fullOrder
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};


const obtenerOrdenesTrabajo = async (req, res, next) => {
  try {
    const { estado, placa, page = 1, pageSize = 10 } = req.query;
    
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;
    
    const where = {};
    if (estado) {
      where.estado = estado;
    }
    

    const include = [
      {
        model: Moto,
        as: 'moto',
        include: ['cliente']
      },
      { model: Item, as: 'items' }
    ];
    
    if (placa) {
      include[0].where = {
        placa: { [Op.like]: `%${placa}%` }
      };
    }
    
    const { count, rows } = await OrdenTrabajo.findAndCountAll({
      where,
      include,
      order: [['fechaIngreso', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


const obtenerOrdenTrabajoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ordenTrabajo = await OrdenTrabajo.findByPk(id, {
      include: [
        { model: Moto, as: 'moto', include: ['cliente'] },
        { model: Item, as: 'items' }
      ]
    });
    
    if (!ordenTrabajo) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      success: true,
      data: ordenTrabajo
    });
  } catch (error) {
    next(error);
  }
};


const actualizarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, nota } = req.body;
    
    // ✅ Verificar que el usuario está autenticado
    if (!req.usuario) {
      const error = new Error('Usuario no autenticado');
      error.statusCode = 401;
      throw error;
    }

    // ✅ Verificar que la orden existe
    const ordenTrabajo = await OrdenTrabajo.findByPk(id);
    if (!ordenTrabajo) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const estadoActual = ordenTrabajo.estado;
    const esAdmin = req.usuario.rol === 'ADMIN';
    const esMecanico = req.usuario.rol === 'MECANICO';

    console.log(`🔄 Cambio de estado: ${estadoActual} → ${estado}`);
    console.log(`👤 Usuario: ${req.usuario.nombre} (${req.usuario.rol})`);

    // ✅ REGLA 1: No permitir cambios idempotentes (mismo estado)
    if (estadoActual === estado) {
      const error = new Error('La orden ya está en este estado');
      error.statusCode = 400;
      throw error;
    }

    // ✅ REGLA 2: Verificar permisos según el rol
    let transicionValida = false;
    let esForzado = false;

    if (esAdmin) {
      // ✅ ADMIN: Puede cambiar a cualquier estado
      transicionValida = esAdminValido(estadoActual, estado);
      esForzado = esCambioForzado(estadoActual); // Marcar si viene de estado final
      
      if (!transicionValida) {
        const error = new Error(`Estado inválido: "${estado}"`);
        error.statusCode = 400;
        throw error;
      }
      
    } else if (esMecanico) {
      // ✅ MECANICO: Solo transiciones válidas
      transicionValida = esValido(estadoActual, estado);
      
      if (!transicionValida) {
        // Mensaje específico si intenta cambiar desde estado final
        if (esEstadoFinal(estadoActual)) {
          const error = new Error(`No puedes cambiar el estado de una orden ${estadoActual}. Solo ADMIN puede hacerlo.`);
          error.statusCode = 403;
          throw error;
        }
        
        const error = new Error(`Transición inválida de "${estadoActual}" a "${estado}"`);
        error.statusCode = 400;
        throw error;
      }
      
    } else {
      // ❌ Otros roles
      const error = new Error('No tienes permiso para cambiar estados');
      error.statusCode = 403;
      throw error;
    }

    // ✅ REGLA 3: Registrar en el historial
    let notaFinal = nota || null;
    if (esForzado && esAdmin) {
      notaFinal = nota 
        ? `[FORZADO POR ADMIN] ${nota}` 
        : '[FORZADO POR ADMIN] Cambio de estado realizado por administrador';
    }

    await registrarCambioEstado(
      id,
      estadoActual,
      estado,
      req.usuario.id,
      notaFinal
    );
    
    // ✅ Actualizar el estado
    await ordenTrabajo.update({ estado });
    
    // ✅ Recargar la orden con relaciones
    const ordenActualizada = await OrdenTrabajo.findByPk(id, {
      include: [
        { model: Moto, as: 'moto', include: ['cliente'] },
        { model: Item, as: 'items' }
      ]
    });
    
    // ✅ Mensaje personalizado
    let mensaje = `Estado actualizado de ${estadoActual} a ${estado}`;
    if (esForzado && esAdmin) {
      mensaje = `Estado FORZADO de ${estadoActual} a ${estado} por ADMIN`;
    }
    
    res.json({
      success: true,
      data: ordenActualizada,
      message: mensaje
    });
    
  } catch (error) {
    console.error('❌ Error en actualizarEstado:', error);
    next(error);
  }
};


const agregarItem = async (req, res, next) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const { id } = req.params;
    const { tipo, descripcion, cantidad, valorUnitario } = req.body;
    
    const ordenTrabajo = await OrdenTrabajo.findByPk(id);
    if (!ordenTrabajo) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }
    
    const item = await Item.create({
      ordenTrabajoId: id,
      tipo,
      descripcion,
      cantidad,
      valorUnitario
    }, { transaction });
    

    const items = await Item.findAll({
      where: { ordenTrabajoId: id },
      transaction
    });
    
    const total = items.reduce((sum, item) => sum + (item.cantidad * item.valorUnitario), 0);
    await ordenTrabajo.update({ total }, { transaction });
    
    await transaction.commit();
    

    const actualizarOrden = await OrdenTrabajo.findByPk(id, {
      include: [
        { model: Moto, as: 'moto', include: ['cliente'] },
        { model: Item, as: 'items' }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: actualizarOrden
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};


const eliminarItem = async (req, res, next) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const { itemId } = req.params;
    
    const item = await Item.findByPk(itemId);
    if (!item) {
      const error = new Error('Ítem no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    const ordenTrabajo = await OrdenTrabajo.findByPk(item.ordenTrabajoId);
    if (!ordenTrabajo) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }
    
    await item.destroy({ transaction });
    
    const items = await Item.findAll({
      where: { ordenTrabajoId: ordenTrabajo.id },
      transaction
    });
    
    const total = items.reduce((sum, item) => sum + (item.cantidad * item.valorUnitario), 0);
    await ordenTrabajo.update({ total }, { transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Ítem eliminado correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  crearOrdenTrabajo,
  obtenerOrdenesTrabajo,
  obtenerOrdenTrabajoPorId,
  actualizarEstado,
  agregarItem,
  eliminarItem
};