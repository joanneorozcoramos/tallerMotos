const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' },
      len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'email_unico',
      msg: 'Ya existe un usuario con este email'
    },
    validate: {
      isEmail: { msg: 'El email no es válido' },
      notEmpty: { msg: 'El email es obligatorio' }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'MECANICO'),
    allowNull: false,
    defaultValue: 'MECANICO'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    }
  }
});


Usuario.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};


Usuario.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = Usuario;