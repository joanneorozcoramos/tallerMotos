const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Moto = require('./Moto');

const OrdenTrabajo = sequelize.define('OrdenTrabajo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  motoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'moto_id',
    references: {
      model: 'motos',
      key: 'id'
    }
  },
  fechaIngreso: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_ingreso',
    defaultValue: DataTypes.NOW
  },
  descripcion_motivo: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'descripcion_motivo',
    validate: {
      notEmpty: {
        msg: 'La descripción del motivo del ingreso de la moto es obligatoria'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'RECIBIDA'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El total no puede ser negativo'
      }
    }
  }
}, {
  tableName: 'orden_trabajo',
  timestamps: true
});


OrdenTrabajo.belongsTo(Moto, { 
  foreignKey: 'motoId', 
  as: 'moto' 
});

Moto.hasMany(OrdenTrabajo, { 
  foreignKey: 'motoId', 
  as: 'ordenesTrabajo' 
});

module.exports = OrdenTrabajo;