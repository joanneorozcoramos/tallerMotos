const { Moto, Cliente } = require('../models');
const { Op } = require('sequelize');

// ✅ Crear moto
const crearMoto = async (req, res, next) => {
  try {
    const { placa, marca, modelo, cilindraje, clienteId } = req.body;
    
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    const moto = await Moto.create({
      placa: placa.toUpperCase(),
      marca,
      modelo,
      cilindraje: cilindraje || null,
      clienteId
    });
    
    res.status(201).json({
      success: true,
      data: moto
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener motos
const obtenerMotos = async (req, res, next) => {
  try {
    const { placa } = req.query;
    
    const where = {};
    if (placa) {
      where.placa = { [Op.like]: `%${placa}%` };
    }
    
    const motos = await Moto.findAll({
      where,
      include: ['cliente'],
      order: [['placa', 'ASC']]
    });
    
    res.json({
      success: true,
      data: motos
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener moto por ID
const obtenerMotoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const moto = await Moto.findByPk(id, {
      include: ['cliente', 'ordenesTrabajo']
    });
    
    if (!moto) {
      const error = new Error('Moto no encontrada');
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      success: true,
      data: moto
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Actualizar moto
const actualizarMoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { placa, marca, modelo, cilindraje, clienteId } = req.body;

    const moto = await Moto.findByPk(id);
    if (!moto) {
      const error = new Error('Moto no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (clienteId) {
      const cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        const error = new Error('Cliente no encontrado');
        error.statusCode = 404;
        throw error;
      }
    }

    await moto.update({
      placa: placa ? placa.toUpperCase() : moto.placa,
      marca: marca || moto.marca,
      modelo: modelo || moto.modelo,
      cilindraje: cilindraje !== undefined ? cilindraje : moto.cilindraje,
      clienteId: clienteId || moto.clienteId
    });

    res.json({
      success: true,
      data: moto,
      message: 'Moto actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Eliminar moto
const eliminarMoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const moto = await Moto.findByPk(id);
    if (!moto) {
      const error = new Error('Moto no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await moto.destroy();

    res.json({
      success: true,
      message: 'Moto eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearMoto,
  obtenerMotos,
  obtenerMotoPorId,
  actualizarMoto,
  eliminarMoto
};