/**
 * Repository de Usuarios
 * Responsabilidad: Interactuar con la tabla 'usuarios' en MySQL
 */

const { pool } = require('../config/database');

/**
 * Buscar usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
async function findByEmail(email) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.empresa_id,
        u.rol_id,
        u.nombre_completo,
        u.email,
        u.password_hash,
        u.telefono,
        u.activo,
        u.ultimo_login,
        u.ultimo_ip,
        r.nombre as rol_nombre,
        r.permisos as rol_permisos
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = ?
        AND u.deleted_at IS NULL
    `, [email]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findByEmail (usuarios):', error.message);
    throw error;
  }
}

/**
 * Buscar usuario por ID
 * @param {string} id - UUID del usuario
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.empresa_id,
        u.rol_id,
        u.nombre_completo,
        u.email,
        u.telefono,
        u.activo,
        u.ultimo_login,
        r.nombre as rol_nombre,
        r.permisos as rol_permisos
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = ?
        AND u.deleted_at IS NULL
    `, [id]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (usuarios):', error.message);
    throw error;
  }
}

/**
 * Actualizar último login del usuario
 * @param {string} id - UUID del usuario
 * @param {string} ip - Dirección IP
 * @returns {Promise<boolean>}
 */
async function updateLastLogin(id, ip) {
  try {
    await pool.query(`
      UPDATE usuarios 
      SET ultimo_login = NOW(),
          ultimo_ip = ?
      WHERE id = ?
    `, [ip, id]);
    
    return true;
  } catch (error) {
    console.error('Error en updateLastLogin:', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<string>} ID del usuario creado
 */
async function create(userData) {
  try {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    
    await pool.query(`
      INSERT INTO usuarios (
        id, empresa_id, rol_id, nombre_completo, 
        email, password_hash, telefono, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      userData.empresa_id,
      userData.rol_id,
      userData.nombre_completo,
      userData.email,
      userData.password_hash,
      userData.telefono || null,
      userData.activo !== false // Default true
    ]);
    
    return id;
  } catch (error) {
    console.error('Error en create (usuarios):', error.message);
    throw error;
  }
}

module.exports = {
  findByEmail,
  findById,
  updateLastLogin,
  create
};