const { Cliente } = require('../models');
const { Op } = require('sequelize');

// ✅ Crear cliente
const crearCliente = async (req, res, next) => {
  try {
    const { nombre, telefono, email } = req.body;
    
    const cliente = await Cliente.create({
      nombre,
      telefono,
      email: email || null
    });
    
    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener clientes con búsqueda
const obtenerClientes = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },  // ✅ CORREGIDO: 'nombre' en lugar de 'name'
        { telefono: { [Op.like]: `%${search}%` } }, // ✅ CORREGIDO: 'telefono' en lugar de 'phone'
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const clientes = await Cliente.findAll({
      where,
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: clientes  // ✅ CORREGIDO: 'clientes' en lugar de 'clients'
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener cliente por ID
const obtenerClientePorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cliente = await Cliente.findByPk(id, {
      include: [{ association: 'motos' }]  // ✅ CORREGIDO: usar 'motos' en lugar de 'bikes'
    });
    
    if (!cliente) {  // ✅ CORREGIDO: '!cliente' en lugar de '!client'
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      success: true,
      data: cliente  // ✅ CORREGIDO: 'cliente' en lugar de 'client'
    });
  } catch (error) {
    next(error);
  }
};

// ✅ ACTUALIZAR CLIENTE (NUEVO)
const actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email } = req.body;
    
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    await cliente.update({
      nombre: nombre || cliente.nombre,
      telefono: telefono || cliente.telefono,
      email: email !== undefined ? email : cliente.email
    });
    
    res.json({
      success: true,
      data: cliente,
      message: 'Cliente actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// ✅ ELIMINAR CLIENTE (NUEVO)
const eliminarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    await cliente.destroy();
    
    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,  // ✅ NUEVO
  eliminarCliente     // ✅ NUEVO
};