/**
 * Service de Reportes
 * Lógica de negocio para generación de reportes financieros
 */

const reportesRepository = require('../repositories/reportes.repository');
const obrasRepository = require('../repositories/obras.repository');

/**
 * Dashboard financiero completo de una obra
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Dashboard completo
 */
async function getDashboardObra(obraId, empresaId) {
  try {
    // Verificar que la obra pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Obtener todos los datos en paralelo
    const [
      resumenFinanciero,
      balanceCategorias,
      ultimasEstimaciones,
      ultimosGastos,
      gastosEspeciales
    ] = await Promise.all([
      reportesRepository.getResumenFinanciero(obraId),
      reportesRepository.getBalancePorCategoria(obraId),
      reportesRepository.getUltimasEstimaciones(obraId, 5),
      reportesRepository.getUltimosGastos(obraId, 5),
      reportesRepository.getGastosEspeciales(obraId)
    ]);

    if (!resumenFinanciero) {
      throw new Error('No se pudo obtener el resumen financiero');
    }

    // Calcular indicadores clave
    const totalFacturado = parseFloat(resumenFinanciero.total_facturado) || 0;
    const totalGastado = parseFloat(resumenFinanciero.total_gastado) || 0;
    const totalCostoDirecto = parseFloat(resumenFinanciero.total_costo_directo) || 0;

    const saldoDisponible = totalCostoDirecto - totalGastado;
    const porcentajeEjecucion = totalCostoDirecto > 0
      ? parseFloat(((totalGastado / totalCostoDirecto) * 100).toFixed(2))
      : 0;
    const rentabilidad = totalFacturado > 0
      ? parseFloat((((totalFacturado - totalGastado) / totalFacturado) * 100).toFixed(2))
      : 0;

    return {
      obra: {
        id: obra.id,
        nombre: obra.nombre,
        cliente: obra.cliente,
        estado: obra.estado,
        fecha_inicio: obra.fecha_inicio,
        fecha_fin_estimada: obra.fecha_fin_estimada
      },
      resumen_financiero: {
        // Ingresos
        total_facturado: totalFacturado,
        total_base: parseFloat(resumenFinanciero.total_base) || 0,
        total_iva: parseFloat(resumenFinanciero.total_iva) || 0,
        total_retencion: parseFloat(resumenFinanciero.total_retencion) || 0,
        total_costo_directo: totalCostoDirecto,
        total_cobrado: parseFloat(resumenFinanciero.total_cobrado) || 0,

        // Egresos
        total_gastado: totalGastado,

        // Balance
        saldo_disponible: parseFloat(saldoDisponible.toFixed(2)),
      },
      indicadores: {
        porcentaje_ejecucion: porcentajeEjecucion,
        rentabilidad_bruta: rentabilidad,
        estimaciones_total: parseInt(resumenFinanciero.estimaciones_total) || 0,
        estimaciones_por_estado: {
          borrador: parseInt(resumenFinanciero.estimaciones_borrador) || 0,
          en_revision: parseInt(resumenFinanciero.estimaciones_en_revision) || 0,
          aprobadas: parseInt(resumenFinanciero.estimaciones_aprobadas) || 0,
          cobradas: parseInt(resumenFinanciero.estimaciones_cobradas) || 0
        }
      },
      balance_categorias: balanceCategorias.map(cat => ({
        categoria_id: cat.categoria_id,
        nombre: cat.categoria_nombre,
        tipo: cat.categoria_tipo,
        color: cat.color,
        total_asignado: parseFloat(cat.total_asignado) || 0,
        total_gastado: parseFloat(cat.total_gastado) || 0,
        saldo_disponible: parseFloat(cat.saldo_disponible) || 0,
        num_gastos: parseInt(cat.num_gastos) || 0,
        porcentaje_uso: parseFloat(cat.total_asignado) > 0
          ? parseFloat(((parseFloat(cat.total_gastado) / parseFloat(cat.total_asignado)) * 100).toFixed(2))
          : 0
      })),
      gastos_especiales: {
        total_gastos_personales: parseFloat(gastosEspeciales.total_gastos_personales) || 0,
        num_gastos_personales: parseInt(gastosEspeciales.num_gastos_personales) || 0,
        total_caja_chica: parseFloat(gastosEspeciales.total_caja_chica) || 0,
        num_gastos_caja_chica: parseInt(gastosEspeciales.num_gastos_caja_chica) || 0
      },
      actividad_reciente: {
        ultimas_estimaciones: ultimasEstimaciones,
        ultimos_gastos: ultimosGastos
      }
    };
  } catch (error) {
    console.error('Error en getDashboardObra:', error.message);
    throw error;
  }
}

module.exports = {
  getDashboardObra
};