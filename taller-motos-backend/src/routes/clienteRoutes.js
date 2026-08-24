const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken, esAdmin } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/clientes', esAdmin, clienteController.crearCliente);
router.get('/clientes', clienteController.obtenerClientes);
router.get('/clientes/:id', clienteController.obtenerClientePorId);
router.put('/clientes/:id', esAdmin, clienteController.actualizarCliente);
router.delete('/clientes/:id', esAdmin, clienteController.eliminarCliente);

module.exports = router;