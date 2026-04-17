/**
 * Repository de Subcontratos
 * Acceso a datos de las tablas 'subcontratos' y 'pagos_subcontratos'
 */

const { pool } = require('../config/database');

/**
 * Buscar todos los subcontratos de una obra
 */
async function findByObra(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        obra_id,
        proveedor,
        concepto,
        monto_total,
        monto_pagado,
        monto_pendiente,
        fecha_inicio,
        fecha_termino_estimada,
        estado,
        archivo_contrato_url,
        notas,
        created_by,
        created_at,
        updated_at
      FROM subcontratos
      WHERE obra_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `, [obraId]);

    return rows;
  } catch (error) {
    console.error('Error en findByObra (subcontratos):', error.message);
    throw error;
  }
}

/**
 * Buscar subcontrato por ID
 */
async function findById(id, obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        obra_id,
        proveedor,
        concepto,
        monto_total,
        monto_pagado,
        monto_pendiente,
        fecha_inicio,
        fecha_termino_estimada,
        estado,
        archivo_contrato_url,
        notas,
        created_by,
        created_at,
        updated_at
      FROM subcontratos
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [id, obraId]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (subcontratos):', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo subcontrato
 */
async function create(data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`
      INSERT INTO subcontratos (
        id,
        obra_id,
        proveedor,
        concepto,
        monto_total,
        monto_pagado,
        monto_pendiente,
        fecha_inicio,
        fecha_termino_estimada,
        estado,
        archivo_contrato_url,
        notas,
        created_by
      ) VALUES (?, ?, ?, ?, ?, 0.00, ?, ?, ?, 'ACTIVO', ?, ?, ?)
    `, [
      data.id,
      data.obra_id,
      data.proveedor,
      data.concepto,
      data.monto_total,
      data.monto_total, // monto_pendiente = monto_total al inicio
      data.fecha_inicio || null,
      data.fecha_termino_estimada || null,
      data.archivo_contrato_url || null,
      data.notas || null,
      data.created_by
    ]);

    await connection.commit();
    return data.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en create (subcontratos):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualizar subcontrato
 */
async function update(id, obraId, data) {
  try {
    const [result] = await pool.query(`
      UPDATE subcontratos
      SET
        proveedor = ?,
        concepto = ?,
        monto_total = ?,
        fecha_inicio = ?,
        fecha_termino_estimada = ?,
        archivo_contrato_url = ?,
        notas = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [
      data.proveedor,
      data.concepto,
      data.monto_total,
      data.fecha_inicio,
      data.fecha_termino_estimada,
      data.archivo_contrato_url,
      data.notas,
      id,
      obraId
    ]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en update (subcontratos):', error.message);
    throw error;
  }
}

/**
 * Cambiar estado del subcontrato
 */
async function cambiarEstado(id, obraId, nuevoEstado) {
  try {
    const [result] = await pool.query(`
      UPDATE subcontratos
      SET estado = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [nuevoEstado, id, obraId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en cambiarEstado (subcontratos):', error.message);
    throw error;
  }
}

/**
 * Soft delete del subcontrato
 */
async function softDelete(id, obraId) {
  try {
    const [result] = await pool.query(`
      UPDATE subcontratos
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND obra_id = ?
        AND deleted_at IS NULL
    `, [id, obraId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en softDelete (subcontratos):', error.message);
    throw error;
  }
}

// =====================================================
// PAGOS DE SUBCONTRATOS
// =====================================================

/**
 * Listar pagos de un subcontrato
 */
async function findPagosBySubcontrato(subcontratoId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        subcontrato_id,
        monto,
        fecha_pago,
        metodo_pago,
        referencia,
        notas,
        created_by,
        created_at
      FROM pagos_subcontratos
      WHERE subcontrato_id = ?
      ORDER BY fecha_pago DESC
    `, [subcontratoId]);

    return rows;
  } catch (error) {
    console.error('Error en findPagosBySubcontrato:', error.message);
    throw error;
  }
}

/**
 * Registrar un pago y actualizar montos del subcontrato
 */
async function registrarPago(subcontratoId, pagoData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertar el pago
    await connection.query(`
      INSERT INTO pagos_subcontratos (
        id,
        subcontrato_id,
        monto,
        fecha_pago,
        metodo_pago,
        referencia,
        notas,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      pagoData.id,
      subcontratoId,
      pagoData.monto,
      pagoData.fecha_pago,
      pagoData.metodo_pago || 'TRANSFERENCIA',
      pagoData.referencia || null,
      pagoData.notas || null,
      pagoData.created_by
    ]);

    // 2. Actualizar monto_pagado y monto_pendiente en subcontrato
    await connection.query(`
      UPDATE subcontratos
      SET
        monto_pagado = monto_pagado + ?,
        monto_pendiente = monto_pendiente - ?,
        -- Si monto_pendiente llega a 0, cambiar estado a LIQUIDADO
        estado = CASE
          WHEN (monto_pendiente - ?) <= 0 THEN 'LIQUIDADO'
          ELSE estado
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [pagoData.monto, pagoData.monto, pagoData.monto, subcontratoId]);

    await connection.commit();
    return pagoData.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en registrarPago:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findByObra,
  findById,
  create,
  update,
  cambiarEstado,
  softDelete,
  findPagosBySubcontrato,
  registrarPago
};