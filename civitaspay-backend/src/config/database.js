/**
 * Configuración de MySQL - Pool de Conexiones
 */

// Importar mysql2 con soporte de promesas
const mysql = require('mysql2/promise');

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'civitaspay',
  waitForConnections: true,
  connectionLimit: 10,  // Máximo 10 conexiones simultáneas
  queueLimit: 0         // Sin límite de cola
});

// Función para probar la conexión
async function testConnection() {
  try {
    // Intentar obtener una conexión del pool
    const connection = await pool.getConnection();
    
    console.log('✅ Conexión a MySQL exitosa');
    
    // Hacer una query de prueba
    const [rows] = await connection.query('SELECT 1 + 1 AS resultado');
    console.log('   Query de prueba:', rows[0].resultado === 2 ? 'OK' : 'Error');
    
    // Obtener información de la BD
    const [dbInfo] = await connection.query(`
      SELECT 
        VERSION() as version,
        DATABASE() as database_name
    `);
    
    console.log('   Versión MySQL:', dbInfo[0].version);
    console.log('   Base de datos:', dbInfo[0].database_name);
    
    // Liberar la conexión de vuelta al pool
    connection.release();
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    throw error;
  }
}

// Exportar el pool y la función de prueba
module.exports = {
  pool,
  testConnection
};