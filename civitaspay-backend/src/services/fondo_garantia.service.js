/**
 * Service de Fondo de Garantía
 * Lógica de negocio para gestión del fondo de retenciones
 */

const fondoGarantiaRepository = require('../repositories/fondo_garantia.repository');
const obrasRepository = require('../repositories/obras.repository');

/**
 * Obtener estado del fondo de garantía de una obra
 */
async function obtenerFondo(obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Obtener o crear el fondo
    const fondo = await fondoGarantiaRepository.findOrCreateByObra(obraId);

    // Obtener historial de retenciones
    const historial = await fondoGarantiaRepository.getHistorialRetenciones(obraId);

    // Calcular totales del historial
    const totalRetenciones = historial.reduce(
      (sum, e) => sum + parseFloat(e.retencion), 0
    );

    return {
      fondo: {
        id: fondo.id,
        obra_id: fondo.obra_id,
        saldo_acumulado: parseFloat(fondo.saldo_acumulado),
        porcentaje_retencion: parseFloat(obra.porcentaje_retencion),
        updated_at: fondo.updated_at
      },
      resumen: {
        total_estimaciones_aprobadas: historial.length,
        total_retenido_historico: parseFloat(totalRetenciones.toFixed(2)),
        saldo_disponible: parseFloat(fondo.saldo_acumulado)
      },
      historial_retenciones: historial.map(e => ({
        estimacion_id: e.id,
        numero_estimacion: e.numero_estimacion,
        periodo: e.periodo,
        monto_bruto: parseFloat(e.monto_bruto),
        monto_base: parseFloat(e.monto_base),
        retencion: parseFloat(e.retencion),
        estado: e.estado,
        fecha_estimacion: e.fecha_estimacion,
        aprobada_at: e.aprobada_at
      }))
    };
  } catch (error) {
    console.error('Error en obtenerFondo:', error.message);
    throw error;
  }
}

/**
 * Liberar fondos del fondo de garantía
 * Ocurre cuando el cliente paga la retención al finalizar la obra
 */
async function liberarFondo(obraId, empresaId, monto, notas) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Validar monto
    const montoLiberar = parseFloat(monto);
    if (!montoLiberar || montoLiberar <= 0) {
      throw new Error('El monto a liberar debe ser mayor a 0');
    }

    const resultado = await fondoGarantiaRepository.liberarFondo(obraId, montoLiberar);

    return {
      mensaje: 'Fondos liberados exitosamente',
      monto_liberado: montoLiberar,
      saldo_anterior: resultado.saldo_anterior,
      saldo_nuevo: resultado.saldo_nuevo,
      notas: notas || null
    };
  } catch (error) {
    console.error('Error en liberarFondo:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerFondo,
  liberarFondo
};