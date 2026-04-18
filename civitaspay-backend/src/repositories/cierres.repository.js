/**
 * Repository de Cierres Mensuales
 * Acceso a datos de la tabla 'cierres_mensuales'
 */

const { pool } = require('../config/database');

/**
 * Listar todos los cierres de una obra
 */
async function findByObra(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        obra_id,
        periodo,
        total_ingresos,
        total_egresos,
        saldo_final,
        snapshot_categorias,
        snapshot_fondo_garantia,
        fecha_cierre,
        cerrado_por,
        cerrado_at,
        reabierto,
        reabierto_por,
        reabierto_at,
        motivo_reapertura
      FROM cierres_mensuales
      WHERE obra_id = ?
      ORDER BY periodo DESC
    `, [obraId]);

    return rows;
  } catch (error) {
    console.error('Error en findByObra (cierres):', error.message);
    throw error;
  }
}

/**
 * Buscar cierre por ID
 */
async function findById(id, obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM cierres_mensuales
      WHERE id = ? AND obra_id = ?
    `, [id, obraId]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findById (cierres):', error.message);
    throw error;
  }
}

/**
 * Verificar si ya existe un cierre para el período
 */
async function findByPeriodo(obraId, periodo) {
  try {
    const [rows] = await pool.query(`
      SELECT id, periodo, reabierto
      FROM cierres_mensuales
      WHERE obra_id = ? AND periodo = ?
    `, [obraId, periodo]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findByPeriodo:', error.message);
    throw error;
  }
}

/**
 * Calcular datos financieros del período para el cierre
 */
async function calcularDatosPeriodo(obraId, periodo) {
  try {
    // Obtener año y mes del período
    const [anio, mes] = periodo.split('-');
    const fechaInicio = `${anio}-${mes}-01`;
    const fechaFin = new Date(parseInt(anio), parseInt(mes), 0)
      .toISOString().split('T')[0]; // Último día del mes

    // Total ingresos del período (estimaciones aprobadas/cobradas)
    const [ingresosRows] = await pool.query(`
      SELECT
        COALESCE(SUM(costo_directo), 0) AS total_ingresos,
        COALESCE(SUM(retencion), 0) AS total_retencion
      FROM estimaciones
      WHERE obra_id = ?
        AND estado IN ('APROBADA', 'COBRADA')
        AND fecha_estimacion BETWEEN ? AND ?
        AND deleted_at IS NULL
    `, [obraId, fechaInicio, fechaFin]);

    // Total egresos del período (gastos no personales)
    const [egresosRows] = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) AS total_egresos
      FROM gastos
      WHERE obra_id = ?
        AND is_personal = FALSE
        AND fecha_gasto BETWEEN ? AND ?
        AND deleted_at IS NULL
    `, [obraId, fechaInicio, fechaFin]);

    // Snapshot de categorías
    const [categoriasRows] = await pool.query(`
      SELECT
        c.id,
        c.nombre,
        c.tipo,
        COALESCE(SUM(
          CASE c.tipo
            WHEN 'MATERIALES' THEN e.asignado_materiales
            WHEN 'NOMINA' THEN e.asignado_nomina
            WHEN 'HERRAMIENTA' THEN e.asignado_herramienta
            ELSE 0
          END
        ), 0) AS asignado,
        COALESCE(gastos_cat.total_gastado, 0) AS gastado
      FROM categorias c
      LEFT JOIN estimaciones e ON c.obra_id = e.obra_id
        AND e.estado IN ('APROBADA', 'COBRADA')
        AND e.fecha_estimacion BETWEEN ? AND ?
        AND e.deleted_at IS NULL
      LEFT JOIN (
        SELECT categoria_id, SUM(monto) AS total_gastado
        FROM gastos
        WHERE deleted_at IS NULL
          AND is_personal = FALSE
          AND fecha_gasto BETWEEN ? AND ?
        GROUP BY categoria_id
      ) gastos_cat ON c.id = gastos_cat.categoria_id
      WHERE c.obra_id = ?
      GROUP BY c.id, c.nombre, c.tipo, gastos_cat.total_gastado
    `, [fechaInicio, fechaFin, fechaInicio, fechaFin, obraId]);

    // Saldo del fondo de garantía
    const [fondoRows] = await pool.query(`
      SELECT COALESCE(saldo_acumulado, 0) AS saldo_fondo
      FROM fondo_garantia
      WHERE obra_id = ?
    `, [obraId]);

    const totalIngresos = parseFloat(ingresosRows[0].total_ingresos);
    const totalEgresos = parseFloat(egresosRows[0].total_egresos);
    const saldoFondo = fondoRows.length > 0
      ? parseFloat(fondoRows[0].saldo_fondo)
      : 0;

    return {
      total_ingresos: totalIngresos,
      total_egresos: totalEgresos,
      saldo_final: parseFloat((totalIngresos - totalEgresos).toFixed(2)),
      snapshot_categorias: categoriasRows,
      snapshot_fondo_garantia: saldoFondo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    };
  } catch (error) {
    console.error('Error en calcularDatosPeriodo:', error.message);
    throw error;
  }
}

/**
 * Crear cierre mensual
 */
async function create(data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`
      INSERT INTO cierres_mensuales (
        id,
        obra_id,
        periodo,
        total_ingresos,
        total_egresos,
        saldo_final,
        snapshot_categorias,
        snapshot_fondo_garantia,
        fecha_cierre,
        cerrado_por,
        reabierto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `, [
      data.id,
      data.obra_id,
      data.periodo,
      data.total_ingresos,
      data.total_egresos,
      data.saldo_final,
      JSON.stringify(data.snapshot_categorias),
      data.snapshot_fondo_garantia,
      data.fecha_cierre,
      data.cerrado_por
    ]);

    await connection.commit();
    return data.id;
  } catch (error) {
    await connection.rollback();
    console.error('Error en create (cierres):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Reabrir cierre mensual
 */
async function reabrir(id, obraId, usuarioId, motivo) {
  try {
    const [result] = await pool.query(`
      UPDATE cierres_mensuales
      SET
        reabierto = TRUE,
        reabierto_por = ?,
        reabierto_at = CURRENT_TIMESTAMP,
        motivo_reapertura = ?
      WHERE id = ? AND obra_id = ?
    `, [usuarioId, motivo, id, obraId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en reabrir:', error.message);
    throw error;
  }
}

module.exports = {
  findByObra,
  findById,
  findByPeriodo,
  calcularDatosPeriodo,
  create,
  reabrir
};