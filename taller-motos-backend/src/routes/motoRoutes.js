const express = require('express');
const router = express.Router();
const motoController = require('../controllers/motoController');
const { verificarToken, esAdmin } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/motos', esAdmin, motoController.crearMoto);
router.get('/motos', motoController.obtenerMotos);
router.get('/motos/:id', motoController.obtenerMotoPorId);
router.put('/motos/:id', esAdmin, motoController.actualizarMoto);
router.delete('/motos/:id', esAdmin, motoController.eliminarMoto);

module.exports = router;