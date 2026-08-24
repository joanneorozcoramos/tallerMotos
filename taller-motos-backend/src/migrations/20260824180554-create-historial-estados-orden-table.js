'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historial_estados_orden', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      orden_trabajo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orden_trabajo',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      desde_estado: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      hacia_estado: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      nota: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('historial_estados_orden', ['orden_trabajo_id', 'created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('historial_estados_orden');
  }
};