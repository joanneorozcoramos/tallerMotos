const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, esAdmin, esAdminOMecanico } = require('../middlewares/auth');

router.post('/auth/login', authController.login);

router.get('/auth/me', verificarToken, authController.obtenerPerfil);

router.post('/auth/register', verificarToken, esAdmin, authController.registrar);
router.get('/auth/usuarios', verificarToken, esAdmin, authController.listarUsuarios);
router.put('/auth/usuarios/:id', verificarToken, esAdmin, authController.actualizarUsuario);
router.put('/auth/usuarios/:id/password', verificarToken, esAdmin, authController.cambiarContrasena);

module.exports = router;