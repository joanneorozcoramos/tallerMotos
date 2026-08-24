const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};


const registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    

    if (!nombre || !email || !password) {
      const error = new Error('Nombre, email y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }
    

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      const error = new Error('Ya existe un usuario con este email');
      error.statusCode = 400;
      throw error;
    }
    

    const usuario = await Usuario.create({
      nombre,
      email,
      password_hash: password,
      rol: rol || 'MECANICO'
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuario
    });
    
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    

    if (!email || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }
    

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }
    

    if (!usuario.activo) {
      const error = new Error('Usuario desactivado');
      error.statusCode = 401;
      throw error;
    }
    

    const passwordValido = await usuario.comparePassword(password);
    if (!passwordValido) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }
    

    const token = generarToken(usuario);
    

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    });
    
  } catch (error) {
    next(error);
  }
};


const obtenerPerfil = async (req, res, next) => {
  try {

    res.json({
      success: true,
      data: req.usuario
    });
  } catch (error) {
    next(error);
  }
};


const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    next(error);
  }
};


const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (rol) usuario.rol = rol;
    if (activo !== undefined) usuario.activo = activo;
    
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });
    
  } catch (error) {
    next(error);
  }
};


const cambiarContrasena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    usuario.password_hash = password;
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrar,
  login,
  obtenerPerfil,
  listarUsuarios,
  actualizarUsuario,
  cambiarContrasena
};