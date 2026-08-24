const express = require('express');
const router = express.Router();
const { obtenerHistorial } = require('../controllers/historialController');
const { verificarToken, esAdminOMecanico } = require('../middlewares/auth');

router.get('/ordenes-trabajo/:id/historial', 
  verificarToken, 
  esAdminOMecanico, 
  obtenerHistorial
);

module.exports = router;