const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Moto = require('./Moto');
const OrdenTrabajo = require('./OrdenTrabajo');
const Item = require('./Item');
const Usuario = require('./Usuario');
const HistorialEstadoOrden = require('./HistorialEstadoOrden');

// ✅ Relaciones de OrdenTrabajo con HistorialEstadoOrden
OrdenTrabajo.hasMany(HistorialEstadoOrden, {
  foreignKey: 'orden_trabajo_id',
  as: 'historial'  // ✅ Alias único
});

HistorialEstadoOrden.belongsTo(OrdenTrabajo, {
  foreignKey: 'orden_trabajo_id',
  as: 'orden'  // ✅ Alias único
});

// ✅ Relaciones de HistorialEstadoOrden con Usuario
HistorialEstadoOrden.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario_historial'  // ✅ Alias único (cambiado de 'usuario')
});

// Usuario tiene muchos historiales
Usuario.hasMany(HistorialEstadoOrden, {
  foreignKey: 'usuario_id',
  as: 'historialEstados'  // ✅ Alias único
});

// Opcional: Usuario puede crear órdenes
Usuario.hasMany(OrdenTrabajo, {
  foreignKey: 'creado_por_usuario_id',
  as: 'ordenesCreadas'  // ✅ Alias único
});

module.exports = {
  sequelize,
  Cliente,
  Moto,
  OrdenTrabajo,
  Item,
  Usuario,
  HistorialEstadoOrden
};