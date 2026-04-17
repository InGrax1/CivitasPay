/**
 * Repository de Gastos
 * Acceso a datos de la tabla 'gastos'
 */

const { pool } = require('../config/database');

/**
 * Buscar todos los gastos de una obra
 * @param {string} obraId - UUID de la obra
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} Array de gastos
 */
async function findByObra(obraId, filtros = {}) {
  try {
    let query = `
      SELECT 
        g.id,
        g.obra_id,
        g.categoria_id,
        g.concepto,
        g.proveedor,
        g.monto,
        g.fecha_gasto,
        g.is_personal,
        g.es_caja_chica,
        g.factura_numero,
        g.factura_xml_url,
        g.factura_pdf_url,
        g.ticket_foto_url,
        g.tags,
        g.created_by,
        g.created_at,
        g.updated_at,
        c.nombre AS categoria_nombre,
        c.tipo AS categoria_tipo
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.obra_id = ?
        AND g.deleted_at IS NULL
    `;
    
    const params = [obraId];
    
    // Filtro por categoría
    if (filtros.categoria_id) {
      query += ` AND g.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      query += ` AND g.fecha_gasto >= ?`;
      params.push(filtros.fecha_desde);
    }
    
    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      query += ` AND g.fecha_gasto <= ?`;
      params.push(filtros.fecha_hasta);
    }
    
    // Filtro por tipo (personal o caja chica)
    if (filtros.is_personal !== undefined) {
      query += ` AND g.is_personal = ?`;
      params.push(filtros.is_personal);
    }
    
    if (filtros.es_caja_chica !== undefined) {
      query += ` AND g.es_caja_chica = ?`;
      params.push(filtros.es_caja_chica);
    }
    
    query += ` ORDER BY g.fecha_gasto DESC, g.created_at DESC`;
    
    const [rows] = await pool.query(query, params);
    
    return rows;
  } catch (error) {
    console.error('Error en findByObra (gastos):', error.message);
    throw error;
  }
}

/**
 * Buscar gasto por ID
 * @param {string} id - UUID del gasto
 * @param {string} obraId - UUID de la obra (validación)
 * @returns {Promise<Object|null>} Gasto o null
 */
async function findById(id, obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        g.id,
        g.obra_id,
        g.categoria_id,
        g.concepto,
        g.proveedor,
        g.monto,
        g.fecha_gasto,
        g.is_personal,
        g.es_caja_chica,
        g.factura_numero,
        g.factura_xml_url,
        g.factura_pdf_url,
        g.ticket_foto_url,
        g.tags,
        g.created_by,
        g.created_at,
        g.updated_at,
        c.nombre AS categoria_nombre,
        c.tipo AS categoria_tipo
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.id = ?
        AND g.obra_id = ?
        AND g.deleted_at IS NULL
    `, [id, obraId]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (gastos):', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo gasto
 * @param {Object} gastoData - Datos del gasto
 * @returns {Promise<string>} UUID del gasto creado
 */
async function create(gastoData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(`
      INSERT INTO gastos (
        id,
        obra_id,
        categoria_id,
        concepto,
        proveedor,
        monto,
        fecha_gasto,
        is_personal,
        es_caja_chica,
        factura_numero,
        factura_xml_url,
        factura_pdf_url,
        ticket_foto_url,
        tags,
        created_by,
        sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      gastoData.id,
      gastoData.obra_id,
      gastoData.categoria_id,
      gastoData.concepto,
      gastoData.proveedor || null,
      gastoData.monto,
      gastoData.fecha_gasto,
      gastoData.is_personal !== undefined ? gastoData.is_personal : false,
      gastoData.es_caja_chica !== undefined ? gastoData.es_caja_chica : false,
      gastoData.factura_numero || null,
      gastoData.factura_xml_url || null,
      gastoData.factura_pdf_url || null,
      gastoData.ticket_foto_url || null,
      gastoData.tags ? JSON.stringify(gastoData.tags) : null,
      gastoData.created_by,
      'SINCRONIZADO'
    ]);
    
    await connection.commit();
    return gastoData.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en create (gastos):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualizar gasto
 * @param {string} id - UUID del gasto
 * @param {string} obraId - UUID de la obra
 * @param {Object} gastoData - Datos a actualizar
 * @returns {Promise<boolean>} True si se actualizó
 */
async function update(id, obraId, gastoData) {
  try {
    const [result] = await pool.query(`
      UPDATE gastos
      SET 
        categoria_id = ?,
        concepto = ?,
        proveedor = ?,
        monto = ?,
        fecha_gasto = ?,
        is_personal = ?,
        es_caja_chica = ?,
        factura_numero = ?,
        factura_xml_url = ?,
        factura_pdf_url = ?,
        ticket_foto_url = ?,
        tags = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [
      gastoData.categoria_id,
      gastoData.concepto,
      gastoData.proveedor,
      gastoData.monto,
      gastoData.fecha_gasto,
      gastoData.is_personal,
      gastoData.es_caja_chica,
      gastoData.factura_numero,
      gastoData.factura_xml_url,
      gastoData.factura_pdf_url,
      gastoData.ticket_foto_url,
      gastoData.tags ? JSON.stringify(gastoData.tags) : null,
      id,
      obraId
    ]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en update (gastos):', error.message);
    throw error;
  }
}

/**
 * Eliminar gasto (soft delete)
 * @param {string} id - UUID del gasto
 * @param {string} obraId - UUID de la obra
 * @returns {Promise<boolean>} True si se eliminó
 */
async function softDelete(id, obraId) {
  try {
    const [result] = await pool.query(`
      UPDATE gastos
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [id, obraId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en softDelete (gastos):', error.message);
    throw error;
  }
}

/**
 * Obtener resumen de gastos por categoría
 * @param {string} obraId - UUID de la obra
 * @returns {Promise<Array>} Resumen por categoría
 */
async function getResumenPorCategoria(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id AS categoria_id,
        c.nombre AS categoria_nombre,
        c.tipo AS categoria_tipo,
        COUNT(g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS total_gastado
      FROM categorias c
      LEFT JOIN gastos g ON c.id = g.categoria_id 
        AND g.deleted_at IS NULL 
        AND g.is_personal = FALSE
      WHERE c.obra_id = ?
      GROUP BY c.id, c.nombre, c.tipo
      ORDER BY c.tipo
    `, [obraId]);
    
    return rows;
  } catch (error) {
    console.error('Error en getResumenPorCategoria:', error.message);
    throw error;
  }
}

module.exports = {
  findByObra,
  findById,
  create,
  update,
  softDelete,
  getResumenPorCategoria
};