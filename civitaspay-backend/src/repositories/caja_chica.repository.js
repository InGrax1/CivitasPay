/**
 * Repository de Caja Chica
 * Acceso a datos de las tablas 'caja_chica' y 'caja_chica_movimientos'
 */

const { pool } = require('../config/database');

/**
 * Buscar caja chica de una obra
 */
async function findByObra(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        obra_id,
        nombre,
        saldo_actual,
        limite_maximo,
        responsable_id,
        activa,
        created_at,
        updated_at
      FROM caja_chica
      WHERE obra_id = ?
      ORDER BY created_at ASC
    `, [obraId]);

    return rows;
  } catch (error) {
    console.error('Error en findByObra (caja_chica):', error.message);
    throw error;
  }
}

/**
 * Buscar caja chica por ID
 */
async function findById(id, obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        obra_id,
        nombre,
        saldo_actual,
        limite_maximo,
        responsable_id,
        activa,
        created_at,
        updated_at
      FROM caja_chica
      WHERE id = ?
        AND obra_id = ?
    `, [id, obraId]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (caja_chica):', error.message);
    throw error;
  }
}

/**
 * Crear una nueva caja chica
 */
async function create(data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`
      INSERT INTO caja_chica (
        id,
        obra_id,
        nombre,
        saldo_actual,
        limite_maximo,
        responsable_id,
        activa
      ) VALUES (?, ?, ?, 0.00, ?, ?, TRUE)
    `, [
      data.id,
      data.obra_id,
      data.nombre || 'Caja Chica Principal',
      data.limite_maximo || 5000.00,
      data.responsable_id || null
    ]);

    await connection.commit();
    return data.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en create (caja_chica):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Registrar un movimiento y actualizar saldo de la caja
 */
async function registrarMovimiento(cajaId, movimientoData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener saldo actual con bloqueo
    const [cajaRows] = await connection.query(
      'SELECT saldo_actual FROM caja_chica WHERE id = ? FOR UPDATE',
      [cajaId]
    );

    if (cajaRows.length === 0) {
      throw new Error('Caja chica no encontrada');
    }

    const saldoAnterior = parseFloat(cajaRows[0].saldo_actual);
    const saldoNuevo = saldoAnterior + parseFloat(movimientoData.monto);

    // 2. Insertar movimiento
    await connection.query(`
      INSERT INTO caja_chica_movimientos (
        id,
        caja_chica_id,
        tipo,
        monto,
        concepto,
        saldo_anterior,
        saldo_nuevo,
        gasto_id,
        categoria_origen_id,
        notas,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      movimientoData.id,
      cajaId,
      movimientoData.tipo,
      movimientoData.monto,
      movimientoData.concepto,
      saldoAnterior,
      saldoNuevo,
      movimientoData.gasto_id || null,
      movimientoData.categoria_origen_id || null,
      movimientoData.notas || null,
      movimientoData.created_by
    ]);

    // 3. Actualizar saldo de la caja
    await connection.query(
      'UPDATE caja_chica SET saldo_actual = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [saldoNuevo, cajaId]
    );

    await connection.commit();

    return {
      movimiento_id: movimientoData.id,
      saldo_anterior: saldoAnterior,
      saldo_nuevo: saldoNuevo
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error en registrarMovimiento:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtener movimientos de una caja chica
 */
async function findMovimientos(cajaId, limite = 20) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        caja_chica_id,
        tipo,
        monto,
        concepto,
        saldo_anterior,
        saldo_nuevo,
        gasto_id,
        categoria_origen_id,
        fecha_movimiento,
        notas,
        created_by
      FROM caja_chica_movimientos
      WHERE caja_chica_id = ?
      ORDER BY fecha_movimiento DESC
      LIMIT ?
    `, [cajaId, limite]);

    return rows;
  } catch (error) {
    console.error('Error en findMovimientos:', error.message);
    throw error;
  }
}

/**
 * Activar / desactivar caja chica
 */
async function toggleActiva(id, obraId, activa) {
  try {
    const [result] = await pool.query(`
      UPDATE caja_chica
      SET activa = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND obra_id = ?
    `, [activa, id, obraId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en toggleActiva:', error.message);
    throw error;
  }
}

module.exports = {
  findByObra,
  findById,
  create,
  registrarMovimiento,
  findMovimientos,
  toggleActiva
};