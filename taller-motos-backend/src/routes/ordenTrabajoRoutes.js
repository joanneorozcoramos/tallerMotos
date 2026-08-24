const express = require('express');
const router = express.Router();
const {
  crearOrdenTrabajo,
  obtenerOrdenesTrabajo,
  obtenerOrdenTrabajoPorId,
  actualizarEstado,
  agregarItem,
  eliminarItem
} = require('../controllers/ordenTrabajoController');
const { verificarToken, esAdmin, esAdminOMecanico } = require('../middlewares/auth');


router.use(verificarToken);


router.get('/ordenes-trabajo', esAdminOMecanico, obtenerOrdenesTrabajo);
router.get('/ordenes-trabajo/:id', esAdminOMecanico, obtenerOrdenTrabajoPorId);
router.post('/ordenes-trabajo', esAdminOMecanico, crearOrdenTrabajo);
router.patch('/ordenes-trabajo/:id/estado', esAdminOMecanico, actualizarEstado);
router.post('/ordenes-trabajo/:id/items', esAdminOMecanico, agregarItem);
router.delete('/ordenes-trabajo/items/:itemId', esAdmin, eliminarItem);

module.exports = router;