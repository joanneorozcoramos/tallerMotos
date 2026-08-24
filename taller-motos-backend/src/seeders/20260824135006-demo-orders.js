'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. INSERTAR CLIENTES
      console.log('📝 Insertando clientes...');
      await queryInterface.bulkInsert('clientes', [
        {
          nombre: 'Juan Pérez',
          telefono: '3001234567',
          email: 'juan@email.com',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'María Gómez',
          telefono: '3107654321',
          email: 'maria@email.com',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Carlos Rodríguez',
          telefono: '3209876543',
          email: 'carlos@email.com',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 2. OBTENER IDs DE CLIENTES
      const [clientes] = await queryInterface.sequelize.query(
        'SELECT id FROM clientes ORDER BY id ASC'
      );

      console.log(`✅ ${clientes.length} clientes insertados`);

      // 3. INSERTAR MOTOS
      console.log('📝 Insertando motos...');
      await queryInterface.bulkInsert('motos', [
        {
          placa: 'ABC123',
          marca: 'Yamaha',
          modelo: 'XTZ 125',
          cilindraje: 125,
          cliente_id: clientes[0].id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          placa: 'XYZ789',
          marca: 'Honda',
          modelo: 'CB 190',
          cilindraje: 190,
          cliente_id: clientes[0].id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          placa: 'DEF456',
          marca: 'Suzuki',
          modelo: 'GSX-R150',
          cilindraje: 150,
          cliente_id: clientes[1].id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          placa: 'GHI789',
          marca: 'Kawasaki',
          modelo: 'Ninja 400',
          cilindraje: 400,
          cliente_id: clientes[2].id,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 4. OBTENER IDs DE MOTOS
      const [motos] = await queryInterface.sequelize.query(
        'SELECT id FROM motos ORDER BY id ASC'
      );

      console.log(`✅ ${motos.length} motos insertadas`);

      // 5. INSERTAR ÓRDENES DE TRABAJO
      console.log('📝 Insertando órdenes de trabajo...');
      await queryInterface.bulkInsert('orden_trabajo', [
        {
          moto_id: motos[0].id,
          descripcion_motivo: 'Motor no enciende, revisar sistema eléctrico',
          estado: 'EN_PROCESO',
          total: 150000.00,
          fecha_ingreso: new Date('2024-01-15'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          moto_id: motos[1].id,
          descripcion_motivo: 'Freno delantero hace ruido al frenar',
          estado: 'DIAGNOSTICO',
          total: 0.00,
          fecha_ingreso: new Date('2024-01-16'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          moto_id: motos[2].id,
          descripcion_motivo: 'Afinación de motor y cambio de bujías',
          estado: 'RECIBIDA',
          total: 380000.00,
          fecha_ingreso: new Date('2024-01-17'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          moto_id: motos[3].id,
          descripcion_motivo: 'Cambio de llantas y balanceo',
          estado: 'ENTREGADA',
          total: 520750.00,
          fecha_ingreso: new Date('2024-01-18'),
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 6. OBTENER IDs DE ÓRDENES
      const [ordenes] = await queryInterface.sequelize.query(
        'SELECT id FROM orden_trabajo ORDER BY id ASC'
      );

      console.log(`✅ ${ordenes.length} órdenes insertadas`);

      // 7. INSERTAR ITEMS
      console.log('📝 Insertando items...');
      await queryInterface.bulkInsert('items', [
        {
          orden_trabajo_id: ordenes[0].id,
          tipo: 'MANO_OBRA',
          descripcion: 'Diagnóstico eléctrico',
          cantidad: 1,
          valor_unitario: 50000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[0].id,
          tipo: 'REPUESTO',
          descripcion: 'Bujía NGK',
          cantidad: 2,
          valor_unitario: 25000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[0].id,
          tipo: 'REPUESTO',
          descripcion: 'Cable de bujía',
          cantidad: 1,
          valor_unitario: 50000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[1].id,
          tipo: 'REPUESTO',
          descripcion: 'Pastillas de freno delanteras',
          cantidad: 2,
          valor_unitario: 80000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[1].id,
          tipo: 'MANO_OBRA',
          descripcion: 'Revisión y cambio de pastillas',
          cantidad: 1,
          valor_unitario: 90000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[2].id,
          tipo: 'REPUESTO',
          descripcion: 'Bujías NGK',
          cantidad: 2,
          valor_unitario: 45000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[2].id,
          tipo: 'MANO_OBRA',
          descripcion: 'Afinación de motor',
          cantidad: 1,
          valor_unitario: 290000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[3].id,
          tipo: 'REPUESTO',
          descripcion: 'Llanta delantera',
          cantidad: 1,
          valor_unitario: 180500.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[3].id,
          tipo: 'REPUESTO',
          descripcion: 'Llanta trasera',
          cantidad: 1,
          valor_unitario: 210250.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          orden_trabajo_id: ordenes[3].id,
          tipo: 'MANO_OBRA',
          descripcion: 'Balanceo y cambio de llantas',
          cantidad: 1,
          valor_unitario: 130000.00,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      console.log(`✅ ${await queryInterface.sequelize.query('SELECT COUNT(*) FROM items')} items insertados`);
      console.log('🎉 ¡Seeders ejecutados exitosamente!');

      return true;

    } catch (error) {
      console.error('❌ Error en el seeder:', error.message);
      console.error('📝 Detalles completos:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Eliminar en orden inverso (primero items, luego órdenes, motos, clientes)
      await queryInterface.bulkDelete('items', null, {});
      await queryInterface.bulkDelete('orden_trabajo', null, {});
      await queryInterface.bulkDelete('motos', null, {});
      await queryInterface.bulkDelete('clientes', null, {});
      console.log('✅ Seeders deshechos correctamente');
    } catch (error) {
      console.error('❌ Error al deshacer seeders:', error.message);
      throw error;
    }
  }
};