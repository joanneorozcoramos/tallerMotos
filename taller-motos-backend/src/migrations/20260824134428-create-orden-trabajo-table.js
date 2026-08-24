'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orden_trabajo', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      moto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'motos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fecha_ingreso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      descripcion_motivo: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'descripcion_motivo'
      },
      estado: {
        type: Sequelize.ENUM('RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'RECIBIDA'
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });


    await queryInterface.addIndex('orden_trabajo', ['estado']);
    await queryInterface.addIndex('orden_trabajo', ['fecha_ingreso']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orden_trabajo');
  }
};