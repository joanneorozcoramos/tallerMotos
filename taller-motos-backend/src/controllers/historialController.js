const { HistorialEstadoOrden, OrdenTrabajo, Usuario } = require('../models');
const { Op } = require('sequelize');


const registrarCambioEstado = async (ordenId, desdeEstado, haciaEstado, usuarioId, nota = null) => {
  try {

    const orden = await OrdenTrabajo.findByPk(ordenId);
    if (!orden) {
      throw new Error('Orden no encontrada');
    }


    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }


    const historial = await HistorialEstadoOrden.create({
      orden_trabajo_id: ordenId,
      desde_estado: desdeEstado,
      hacia_estado: haciaEstado,
      nota: nota,
      usuario_id: usuarioId
    });

    return historial;
  } catch (error) {
    console.error('❌ Error registrando cambio de estado:', error);
    throw error;
  }
};


const obtenerHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const historial = await HistorialEstadoOrden.findAndCountAll({
      where: { orden_trabajo_id: id },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: historial.rows,
      pagination: {
        total: historial.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(historial.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    next(error);
  }
};

module.exports = {
  registrarCambioEstado,
  obtenerHistorial
};