const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const verificarToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Token no proporcionado');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 401;
      throw error;
    }
    
    if (!usuario.activo) {
      const error = new Error('Usuario desactivado');
      error.statusCode = 401;
      throw error;
    }
    

    req.usuario = usuario;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Token inválido';
      error.statusCode = 401;
    } else if (error.name === 'TokenExpiredError') {
      error.message = 'Token expirado';
      error.statusCode = 401;
    }
    next(error);
  }
};


const autorizar = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.usuario) {
      const error = new Error('Usuario no autenticado');
      error.statusCode = 401;
      return next(error);
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      const error = new Error('No tienes permisos para realizar esta acción');
      error.statusCode = 403;
      return next(error);
    }
    
    next();
  };
};


const esAdmin = autorizar(['ADMIN']);


const esAdminOMecanico = autorizar(['ADMIN', 'MECANICO']);

module.exports = {
  verificarToken,
  autorizar,
  esAdmin,
  esAdminOMecanico
};