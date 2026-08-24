const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OrdenTrabajo = require('./OrdenTrabajo');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ordenTrabajoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'orden_trabajo_id',
    references: {
      model: 'orden_trabajo',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('MANO_OBRA', 'REPUESTO'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción es obligatoria'
      }
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'La cantidad debe ser mayor a 0'
      }
    }
  },
  valorUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'valor_unitario',
    validate: {
      min: {
        args: [0],
        msg: 'El valor unitario no puede ser negativo'
      }
    }
  }
}, {
  tableName: 'items',
  timestamps: true
});


Item.belongsTo(OrdenTrabajo, { 
  foreignKey: 'ordenTrabajoId', 
  as: 'ordenTrabajo' 
});

OrdenTrabajo.hasMany(Item, { 
  foreignKey: 'ordenTrabajoId', 
  as: 'items' 
});

module.exports = Item;