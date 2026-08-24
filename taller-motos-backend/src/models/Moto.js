const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./Cliente');

const Moto = sequelize.define('Moto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: {
      name: 'placa_unica',
      msg: 'Ya existe una moto con esta placa'
    },
    validate: {
      notEmpty: {
        msg: 'La placa es obligatoria'
      },
      len: {
        args: [3, 10],
        msg: 'La placa debe tener entre 3 y 10 caracteres'
      }
    }
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La marca es obligatoria'
      }
    }
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El modelo es obligatorio'
      }
    }
  },
  cilindraje: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [50],
        msg: 'El cilindraje mínimo es 50cc'
      }
    }
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id',
    references: {
      model: 'clientes',
      key: 'id'
    }
  }
}, {
  tableName: 'motos',
  timestamps: true
});


Moto.belongsTo(Cliente, { 
  foreignKey: 'clienteId', 
  as: 'cliente' 
});

Cliente.hasMany(Moto, { 
  foreignKey: 'clienteId', 
  as: 'motos' 
});

module.exports = Moto;