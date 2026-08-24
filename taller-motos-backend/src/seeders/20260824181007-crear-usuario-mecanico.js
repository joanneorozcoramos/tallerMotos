'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const [existingUser] = await queryInterface.sequelize.query(
      `SELECT id FROM usuarios WHERE email = 'mecanico@tallermotos.com' LIMIT 1`
    );

    if (existingUser.length > 0) {
      console.log('✅ Usuario MECANICO ya existe, omitiendo...');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Mecanico123!', salt);

    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Mecánico',
        email: 'mecanico@tallermotos.com',
        password_hash: passwordHash,
        rol: 'MECANICO',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Usuario MECANICO creado correctamente');
    console.log('📧 Email: mecanico@tallermotos.com');
    console.log('🔑 Contraseña: Mecanico123!');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', {
      email: 'mecanico@tallermotos.com'
    });
    console.log('✅ Usuario MECANICO eliminado');
  }
};