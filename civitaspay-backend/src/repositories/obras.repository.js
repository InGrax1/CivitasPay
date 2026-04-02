/**
 * Repository de Obras
 * Acceso a datos de la tabla 'obras'
 */

const { pool } = require('../config/database');

/**
 * Buscar todas las obras de una empresa
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Array>} Array de obras
 */
async function findAll(empresaId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        empresa_id,
        nombre,
        codigo,
        cliente,
        direccion,
        fecha_inicio,
        fecha_fin_estimada,
        porcentaje_retencion,
        porcentaje_materiales,
        porcentaje_nomina,
        porcentaje_herramienta,
        residente_id,
        estado,
        activa,
        created_at,
        updated_at
      FROM obras
      WHERE empresa_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `, [empresaId]);
    
    return rows;
  } catch (error) {
    console.error('Error en findAll (obras):', error.message);
    throw error;
  }
}

/**
 * Buscar obra por ID (con validación de empresa)
 * @param {string} id - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object|null>} Obra o null
 */
async function findById(id, empresaId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        empresa_id,
        nombre,
        codigo,
        cliente,
        direccion,
        fecha_inicio,
        fecha_fin_estimada,
        porcentaje_retencion,
        porcentaje_materiales,
        porcentaje_nomina,
        porcentaje_herramienta,
        residente_id,
        estado,
        activa,
        created_at,
        updated_at
      FROM obras
      WHERE id = ?
        AND empresa_id = ?
        AND deleted_at IS NULL
    `, [id, empresaId]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (obras):', error.message);
    throw error;
  }
}

/**
 * Crear una nueva obra
 * @param {Object} obraData - Datos de la obra
 * @returns {Promise<string>} UUID de la obra creada
 */
async function create(obraData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insertar obra
    const [result] = await connection.query(`
      INSERT INTO obras (
        id,
        empresa_id,
        nombre,
        codigo,
        cliente,
        direccion,
        fecha_inicio,
        fecha_fin_estimada,
        porcentaje_retencion,
        porcentaje_materiales,
        porcentaje_nomina,
        porcentaje_herramienta,
        residente_id,
        estado,
        activa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      obraData.id,
      obraData.empresa_id,
      obraData.nombre,
      obraData.codigo || null,
      obraData.cliente,
      obraData.direccion || null,
      obraData.fecha_inicio,
      obraData.fecha_fin_estimada || null,
      obraData.porcentaje_retencion,
      obraData.porcentaje_materiales,
      obraData.porcentaje_nomina,
      obraData.porcentaje_herramienta,
      obraData.residente_id || null,
      obraData.estado || 'ACTIVA',
      obraData.activa !== undefined ? obraData.activa : true
    ]);
    
    await connection.commit();
    return obraData.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en create (obras):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualizar una obra existente
 * @param {string} id - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @param {Object} obraData - Datos a actualizar
 * @returns {Promise<boolean>} True si se actualizó
 */
async function update(id, empresaId, obraData) {
  try {
    const [result] = await pool.query(`
      UPDATE obras
      SET 
        nombre = ?,
        codigo = ?,
        cliente = ?,
        direccion = ?,
        fecha_inicio = ?,
        fecha_fin_estimada = ?,
        porcentaje_retencion = ?,
        porcentaje_materiales = ?,
        porcentaje_nomina = ?,
        porcentaje_herramienta = ?,
        residente_id = ?,
        estado = ?,
        activa = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND empresa_id = ?
        AND deleted_at IS NULL
    `, [
      obraData.nombre,
      obraData.codigo,
      obraData.cliente,
      obraData.direccion,
      obraData.fecha_inicio,
      obraData.fecha_fin_estimada,
      obraData.porcentaje_retencion,
      obraData.porcentaje_materiales,
      obraData.porcentaje_nomina,
      obraData.porcentaje_herramienta,
      obraData.residente_id,
      obraData.estado,
      obraData.activa,
      id,
      empresaId
    ]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en update (obras):', error.message);
    throw error;
  }
}

/**
 * Eliminar obra (soft delete)
 * @param {string} id - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<boolean>} True si se eliminó
 */
async function softDelete(id, empresaId) {
  try {
    const [result] = await pool.query(`
      UPDATE obras
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND empresa_id = ?
        AND deleted_at IS NULL
    `, [id, empresaId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en softDelete (obras):', error.message);
    throw error;
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete
};