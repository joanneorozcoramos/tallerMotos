const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    const dbName = process.env.DB_NAME || 'taller_motos';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Base de datos "${dbName}" creada exitosamente`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📌 Soluciones:');
    console.log('1. Verifica que MySQL esté corriendo');
    console.log('2. Revisa las credenciales en .env');
  }
}

createDatabase();