/**
 * Repository de Fondo de Garantía
 * Acceso a datos de la tabla 'fondo_garantia'
 */

const { pool } = require('../config/database');

/**
 * Obtener fondo de garantía de una obra
 * Si no existe, lo crea con saldo 0
 */
async function findOrCreateByObra(obraId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Intentar obtener el fondo existente
    const [rows] = await connection.query(
      'SELECT * FROM fondo_garantia WHERE obra_id = ?',
      [obraId]
    );

    if (rows.length > 0) {
      await connection.commit();
      return rows[0];
    }

    // Si no existe, crearlo con saldo 0
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    await connection.query(
      'INSERT INTO fondo_garantia (id, obra_id, saldo_acumulado) VALUES (?, ?, 0.00)',
      [id, obraId]
    );

    await connection.commit();

    return {
      id,
      obra_id: obraId,
      saldo_acumulado: '0.00'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error en findOrCreateByObra:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Sumar monto al fondo de garantía
 * Se llama al aprobar una estimación
 */
async function acumularRetencion(obraId, montoRetencion) {
  try {
    const [result] = await pool.query(`
      UPDATE fondo_garantia
      SET
        saldo_acumulado = saldo_acumulado + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE obra_id = ?
    `, [montoRetencion, obraId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en acumularRetencion:', error.message);
    throw error;
  }
}

/**
 * Liberar (restar) monto del fondo de garantía
 * Se llama cuando el cliente libera la retención
 */
async function liberarFondo(obraId, monto) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar saldo suficiente
    const [rows] = await connection.query(
      'SELECT saldo_acumulado FROM fondo_garantia WHERE obra_id = ? FOR UPDATE',
      [obraId]
    );

    if (rows.length === 0) {
      throw new Error('Fondo de garantía no encontrado');
    }

    const saldoActual = parseFloat(rows[0].saldo_acumulado);

    if (monto > saldoActual) {
      throw new Error(
        `El monto a liberar ($${monto.toFixed(2)}) excede el saldo acumulado ($${saldoActual.toFixed(2)})`
      );
    }

    await connection.query(`
      UPDATE fondo_garantia
      SET
        saldo_acumulado = saldo_acumulado - ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE obra_id = ?
    `, [monto, obraId]);

    await connection.commit();

    return {
      saldo_anterior: saldoActual,
      saldo_nuevo: parseFloat((saldoActual - monto).toFixed(2))
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error en liberarFondo:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtener historial de retenciones de estimaciones
 * para mostrar el desglose del fondo
 */
async function getHistorialRetenciones(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        numero_estimacion,
        periodo,
        monto_bruto,
        monto_base,
        retencion,
        estado,
        fecha_estimacion,
        aprobada_at
      FROM estimaciones
      WHERE obra_id = ?
        AND estado IN ('APROBADA', 'COBRADA')
        AND deleted_at IS NULL
      ORDER BY numero_estimacion ASC
    `, [obraId]);

    return rows;
  } catch (error) {
    console.error('Error en getHistorialRetenciones:', error.message);
    throw error;
  }
}

module.exports = {
  findOrCreateByObra,
  acumularRetencion,
  liberarFondo,
  getHistorialRetenciones
};