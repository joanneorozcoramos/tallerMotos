const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OrdenTrabajo = require('./OrdenTrabajo');
const Usuario = require('./Usuario');

const HistorialEstadoOrden = sequelize.define('HistorialEstadoOrden', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orden_trabajo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  desde_estado: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  hacia_estado: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nota: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_estados_orden',
  timestamps: false,
  underscored: true
});


HistorialEstadoOrden.belongsTo(OrdenTrabajo, { 
  foreignKey: 'orden_trabajo_id', 
  as: 'ordenTrabajo' 
});

HistorialEstadoOrden.belongsTo(Usuario, { 
  foreignKey: 'usuario_id', 
  as: 'usuario' 
});

module.exports = HistorialEstadoOrden;