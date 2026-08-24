'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('motos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      placa: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      marca: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      modelo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      cilindraje: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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


    await queryInterface.addIndex('motos', ['placa']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('motos');
  }
};