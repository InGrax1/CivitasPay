/**
 * Repository de Reportes
 * Queries SQL para generación de reportes financieros
 */

const { pool } = require('../config/database');

/**
 * Resumen financiero general de una obra
 * Ingresos (estimaciones APROBADAS/COBRADAS) vs Egresos (gastos)
 */
async function getResumenFinanciero(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        -- Datos de la obra
        o.id AS obra_id,
        o.nombre AS obra_nombre,
        o.cliente,
        o.estado AS obra_estado,
        o.porcentaje_retencion,
        o.porcentaje_materiales,
        o.porcentaje_nomina,
        o.porcentaje_herramienta,

        -- Ingresos: Estimaciones aprobadas y cobradas
        COALESCE(SUM(CASE WHEN e.estado IN ('APROBADA','COBRADA') THEN e.monto_bruto ELSE 0 END), 0) AS total_facturado,
        COALESCE(SUM(CASE WHEN e.estado IN ('APROBADA','COBRADA') THEN e.monto_base ELSE 0 END), 0) AS total_base,
        COALESCE(SUM(CASE WHEN e.estado IN ('APROBADA','COBRADA') THEN e.iva ELSE 0 END), 0) AS total_iva,
        COALESCE(SUM(CASE WHEN e.estado IN ('APROBADA','COBRADA') THEN e.retencion ELSE 0 END), 0) AS total_retencion,
        COALESCE(SUM(CASE WHEN e.estado IN ('APROBADA','COBRADA') THEN e.costo_directo ELSE 0 END), 0) AS total_costo_directo,

        -- Estimaciones cobradas (dinero real recibido)
        COALESCE(SUM(CASE WHEN e.estado = 'COBRADA' THEN e.monto_bruto ELSE 0 END), 0) AS total_cobrado,

        -- Conteos de estimaciones por estado
        COUNT(DISTINCT CASE WHEN e.estado = 'BORRADOR' THEN e.id END) AS estimaciones_borrador,
        COUNT(DISTINCT CASE WHEN e.estado = 'EN_REVISION' THEN e.id END) AS estimaciones_en_revision,
        COUNT(DISTINCT CASE WHEN e.estado = 'APROBADA' THEN e.id END) AS estimaciones_aprobadas,
        COUNT(DISTINCT CASE WHEN e.estado = 'COBRADA' THEN e.id END) AS estimaciones_cobradas,
        COUNT(DISTINCT e.id) AS estimaciones_total,

        -- Egresos: Gastos (excluyendo personales)
        COALESCE(SUM(DISTINCT g.monto_gasto), 0) AS total_gastado

      FROM obras o
      LEFT JOIN estimaciones e ON o.id = e.obra_id AND e.deleted_at IS NULL
      LEFT JOIN (
        SELECT obra_id, SUM(monto) AS monto_gasto
        FROM gastos
        WHERE deleted_at IS NULL AND is_personal = FALSE
        GROUP BY obra_id
      ) g ON o.id = g.obra_id
      WHERE o.id = ?
        AND o.deleted_at IS NULL
      GROUP BY o.id, o.nombre, o.cliente, o.estado,
               o.porcentaje_retencion, o.porcentaje_materiales,
               o.porcentaje_nomina, o.porcentaje_herramienta
    `, [obraId]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en getResumenFinanciero:', error.message);
    throw error;
  }
}

/**
 * Balance por categoría: dinero asignado (de estimaciones) vs gastado
 */
async function getBalancePorCategoria(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id AS categoria_id,
        c.nombre AS categoria_nombre,
        c.tipo AS categoria_tipo,
        c.color,

        -- Dinero asignado desde estimaciones aprobadas/cobradas
        COALESCE(SUM(
          CASE c.tipo
            WHEN 'MATERIALES' THEN e.asignado_materiales
            WHEN 'NOMINA'     THEN e.asignado_nomina
            WHEN 'HERRAMIENTA' THEN e.asignado_herramienta
            ELSE 0
          END
        ), 0) AS total_asignado,

        -- Dinero gastado
        COALESCE(gastos_cat.total_gastado, 0) AS total_gastado,

        -- Saldo disponible
        COALESCE(SUM(
          CASE c.tipo
            WHEN 'MATERIALES' THEN e.asignado_materiales
            WHEN 'NOMINA'     THEN e.asignado_nomina
            WHEN 'HERRAMIENTA' THEN e.asignado_herramienta
            ELSE 0
          END
        ), 0) - COALESCE(gastos_cat.total_gastado, 0) AS saldo_disponible,

        -- Número de gastos
        COALESCE(gastos_cat.num_gastos, 0) AS num_gastos

      FROM categorias c
      LEFT JOIN estimaciones e ON c.obra_id = e.obra_id
        AND e.estado IN ('APROBADA', 'COBRADA')
        AND e.deleted_at IS NULL
      LEFT JOIN (
        SELECT
          categoria_id,
          SUM(monto) AS total_gastado,
          COUNT(*) AS num_gastos
        FROM gastos
        WHERE deleted_at IS NULL AND is_personal = FALSE
        GROUP BY categoria_id
      ) gastos_cat ON c.id = gastos_cat.categoria_id
      WHERE c.obra_id = ?
      GROUP BY c.id, c.nombre, c.tipo, c.color, gastos_cat.total_gastado, gastos_cat.num_gastos
      ORDER BY c.tipo
    `, [obraId]);

    return rows;
  } catch (error) {
    console.error('Error en getBalancePorCategoria:', error.message);
    throw error;
  }
}

/**
 * Últimas estimaciones de una obra (para dashboard)
 */
async function getUltimasEstimaciones(obraId, limite = 5) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        numero_estimacion,
        periodo,
        monto_bruto,
        costo_directo,
        estado,
        fecha_estimacion,
        fecha_cobro
      FROM estimaciones
      WHERE obra_id = ?
        AND deleted_at IS NULL
      ORDER BY numero_estimacion DESC
      LIMIT ?
    `, [obraId, limite]);

    return rows;
  } catch (error) {
    console.error('Error en getUltimasEstimaciones:', error.message);
    throw error;
  }
}

/**
 * Últimos gastos de una obra (para dashboard)
 */
async function getUltimosGastos(obraId, limite = 5) {
  try {
    const [rows] = await pool.query(`
      SELECT
        g.id,
        g.concepto,
        g.monto,
        g.fecha_gasto,
        g.proveedor,
        g.es_caja_chica,
        g.is_personal,
        c.nombre AS categoria_nombre,
        c.tipo AS categoria_tipo
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.obra_id = ?
        AND g.deleted_at IS NULL
      ORDER BY g.fecha_gasto DESC, g.created_at DESC
      LIMIT ?
    `, [obraId, limite]);

    return rows;
  } catch (error) {
    console.error('Error en getUltimosGastos:', error.message);
    throw error;
  }
}

/**
 * Resumen de gastos especiales (personales y caja chica)
 */
async function getGastosEspeciales(obraId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        -- Gastos personales
        COALESCE(SUM(CASE WHEN is_personal = TRUE THEN monto ELSE 0 END), 0) AS total_gastos_personales,
        COUNT(CASE WHEN is_personal = TRUE THEN 1 END) AS num_gastos_personales,

        -- Caja chica
        COALESCE(SUM(CASE WHEN es_caja_chica = TRUE THEN monto ELSE 0 END), 0) AS total_caja_chica,
        COUNT(CASE WHEN es_caja_chica = TRUE THEN 1 END) AS num_gastos_caja_chica

      FROM gastos
      WHERE obra_id = ?
        AND deleted_at IS NULL
    `, [obraId]);

    return rows[0];
  } catch (error) {
    console.error('Error en getGastosEspeciales:', error.message);
    throw error;
  }
}

module.exports = {
  getResumenFinanciero,
  getBalancePorCategoria,
  getUltimasEstimaciones,
  getUltimosGastos,
  getGastosEspeciales
};