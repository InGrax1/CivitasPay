/**
 * Repository de Roles
 * Responsabilidad: Interactuar con la tabla 'roles' en MySQL
 */

const { pool } = require('../config/database');

/**
 * Obtener todos los roles
 * @returns {Promise<Array>} Lista de roles
 */
async function findAll() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        permisos,
        created_at
      FROM roles
      WHERE 1=1
      ORDER BY nombre ASC
    `);
    
    return rows;
  } catch (error) {
    console.error('Error en findAll (roles):', error.message);
    throw error;
  }
}

/**
 * Obtener un rol por ID
 * @param {string} id - UUID del rol
 * @returns {Promise<Object|null>} Rol encontrado o null
 */
async function findById(id) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        permisos,
        created_at
      FROM roles
      WHERE id = ?
    `, [id]);
    
    // Si no encuentra nada, rows es un array vacío
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (roles):', error.message);
    throw error;
  }
}

/**
 * Buscar rol por nombre
 * @param {string} nombre - Nombre del rol (ADMINISTRADOR, AUXILIAR, etc.)
 * @returns {Promise<Object|null>}
 */
async function findByNombre(nombre) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        permisos,
        created_at
      FROM roles
      WHERE nombre = ?
    `, [nombre]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findByNombre (roles):', error.message);
    throw error;
  }
}

// Exportar todas las funciones
module.exports = {
  findAll,
  findById,
  findByNombre
};