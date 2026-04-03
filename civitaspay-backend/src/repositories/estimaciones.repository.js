/**
 * Repository de Estimaciones
 * Acceso a datos de la tabla 'estimaciones'
 */

const { pool } = require('../config/database');

/**
 * Buscar todas las estimaciones de una obra
 * @param {string} obraId - UUID de la obra
 * @returns {Promise<Array>} Array de estimaciones
 */
async function findByObra(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        obra_id,
        contrato_id,
        numero_estimacion,
        periodo,
        monto_bruto,
        monto_base,
        iva,
        retencion,
        costo_directo,
        asignado_materiales,
        asignado_nomina,
        asignado_herramienta,
        asignado_subcontratos,
        fecha_estimacion,
        fecha_cobro,
        estado,
        archivo_xml_url,
        archivo_pdf_url,
        created_by,
        aprobada_by,
        aprobada_at,
        created_at,
        updated_at
      FROM estimaciones
      WHERE obra_id = ?
        AND deleted_at IS NULL
      ORDER BY numero_estimacion DESC
    `, [obraId]);
    
    return rows;
  } catch (error) {
    console.error('Error en findByObra (estimaciones):', error.message);
    throw error;
  }
}

/**
 * Buscar estimación por ID
 * @param {string} id - UUID de la estimación
 * @param {string} obraId - UUID de la obra (validación)
 * @returns {Promise<Object|null>} Estimación o null
 */
async function findById(id, obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        obra_id,
        contrato_id,
        numero_estimacion,
        periodo,
        monto_bruto,
        monto_base,
        iva,
        retencion,
        costo_directo,
        asignado_materiales,
        asignado_nomina,
        asignado_herramienta,
        asignado_subcontratos,
        fecha_estimacion,
        fecha_cobro,
        estado,
        archivo_xml_url,
        archivo_pdf_url,
        created_by,
        aprobada_by,
        aprobada_at,
        created_at,
        updated_at
      FROM estimaciones
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [id, obraId]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (estimaciones):', error.message);
    throw error;
  }
}

/**
 * Obtener siguiente número de estimación para una obra
 * @param {string} obraId - UUID de la obra
 * @returns {Promise<number>} Siguiente número
 */
async function getNextNumero(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT COALESCE(MAX(numero_estimacion), 0) + 1 AS siguiente
      FROM estimaciones
      WHERE obra_id = ?
    `, [obraId]);
    
    return rows[0].siguiente;
  } catch (error) {
    console.error('Error en getNextNumero:', error.message);
    throw error;
  }
}

/**
 * Crear una nueva estimación
 * @param {Object} estimacionData - Datos de la estimación
 * @returns {Promise<string>} UUID de la estimación creada
 */
async function create(estimacionData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(`
      INSERT INTO estimaciones (
        id,
        obra_id,
        contrato_id,
        numero_estimacion,
        periodo,
        monto_bruto,
        monto_base,
        iva,
        retencion,
        costo_directo,
        asignado_materiales,
        asignado_nomina,
        asignado_herramienta,
        asignado_subcontratos,
        fecha_estimacion,
        fecha_cobro,
        estado,
        archivo_xml_url,
        archivo_pdf_url,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      estimacionData.id,
      estimacionData.obra_id,
      estimacionData.contrato_id || null,
      estimacionData.numero_estimacion,
      estimacionData.periodo || null,
      estimacionData.monto_bruto,
      estimacionData.monto_base,
      estimacionData.iva,
      estimacionData.retencion,
      estimacionData.costo_directo,
      estimacionData.asignado_materiales || 0,
      estimacionData.asignado_nomina || 0,
      estimacionData.asignado_herramienta || 0,
      estimacionData.asignado_subcontratos || 0,
      estimacionData.fecha_estimacion,
      estimacionData.fecha_cobro || null,
      estimacionData.estado || 'BORRADOR',
      estimacionData.archivo_xml_url || null,
      estimacionData.archivo_pdf_url || null,
      estimacionData.created_by
    ]);
    
    await connection.commit();
    return estimacionData.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en create (estimaciones):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualizar estimación
 * @param {string} id - UUID de la estimación
 * @param {string} obraId - UUID de la obra
 * @param {Object} estimacionData - Datos a actualizar
 * @returns {Promise<boolean>} True si se actualizó
 */
async function update(id, obraId, estimacionData) {
  try {
    const [result] = await pool.query(`
      UPDATE estimaciones
      SET 
        periodo = ?,
        monto_bruto = ?,
        monto_base = ?,
        iva = ?,
        retencion = ?,
        costo_directo = ?,
        fecha_estimacion = ?,
        fecha_cobro = ?,
        estado = ?,
        archivo_xml_url = ?,
        archivo_pdf_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [
      estimacionData.periodo,
      estimacionData.monto_bruto,
      estimacionData.monto_base,
      estimacionData.iva,
      estimacionData.retencion,
      estimacionData.costo_directo,
      estimacionData.fecha_estimacion,
      estimacionData.fecha_cobro,
      estimacionData.estado,
      estimacionData.archivo_xml_url,
      estimacionData.archivo_pdf_url,
      id,
      obraId
    ]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en update (estimaciones):', error.message);
    throw error;
  }
}

/**
 * Cambiar estado de estimación (con registro de aprobación)
 * @param {string} id - UUID de la estimación
 * @param {string} obraId - UUID de la obra
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuarioId - UUID del usuario que aprueba
 * @returns {Promise<boolean>} True si se actualizó
 */
async function cambiarEstado(id, obraId, nuevoEstado, usuarioId) {
  try {
    const campos = ['estado = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const valores = [nuevoEstado];
    
    // Si se aprueba, registrar quién y cuándo
    if (nuevoEstado === 'APROBADA') {
      campos.push('aprobada_by = ?', 'aprobada_at = CURRENT_TIMESTAMP');
      valores.push(usuarioId);
    }
    
    valores.push(id, obraId);
    
    const [result] = await pool.query(`
      UPDATE estimaciones
      SET ${campos.join(', ')}
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, valores);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en cambiarEstado:', error.message);
    throw error;
  }
}

/**
 * Eliminar estimación (soft delete)
 * @param {string} id - UUID de la estimación
 * @param {string} obraId - UUID de la obra
 * @returns {Promise<boolean>} True si se eliminó
 */
async function softDelete(id, obraId) {
  try {
    const [result] = await pool.query(`
      UPDATE estimaciones
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
        AND estado = 'BORRADOR'
    `, [id, obraId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en softDelete (estimaciones):', error.message);
    throw error;
  }
}

module.exports = {
  findByObra,
  findById,
  getNextNumero,
  create,
  update,
  cambiarEstado,
  softDelete
};