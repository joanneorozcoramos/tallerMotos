'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM usuarios WHERE email = 'admin@tallermotos.com' LIMIT 1`
    );


    if (existingAdmin.length > 0) {
      console.log('✅ Usuario ADMIN ya existe, omitiendo...');
      return;
    }


    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin123!', salt);


    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Administrador',
        email: 'admin@tallermotos.com',
        password_hash: passwordHash,
        rol: 'ADMIN',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Usuario ADMIN creado correctamente');
    console.log('📧 Email: admin@tallermotos.com');
    console.log('🔑 Contraseña: Admin123!');
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('usuarios', {
      email: 'admin@tallermotos.com'
    });
    console.log('✅ Usuario ADMIN eliminado');
  }
};