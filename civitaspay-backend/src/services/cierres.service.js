/**
 * Service de Cierres Mensuales
 * Lógica de negocio para cierres contables periódicos
 */

const cierresRepository = require('../repositories/cierres.repository');
const obrasRepository = require('../repositories/obras.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Listar todos los cierres de una obra
 */
async function obtenerCierres(obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    const cierres = await cierresRepository.findByObra(obraId);

    return {
      total: cierres.length,
      cierres: cierres.map(c => ({
        ...c,
        snapshot_categorias: typeof c.snapshot_categorias === 'string'
          ? JSON.parse(c.snapshot_categorias)
          : c.snapshot_categorias
      }))
    };
  } catch (error) {
    console.error('Error en obtenerCierres:', error.message);
    throw error;
  }
}

/**
 * Obtener detalle de un cierre
 */
async function obtenerCierrePorId(id, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    const cierre = await cierresRepository.findById(id, obraId);

    if (!cierre) {
      throw new Error('Cierre no encontrado');
    }

    return {
      ...cierre,
      snapshot_categorias: typeof cierre.snapshot_categorias === 'string'
        ? JSON.parse(cierre.snapshot_categorias)
        : cierre.snapshot_categorias
    };
  } catch (error) {
    console.error('Error en obtenerCierrePorId:', error.message);
    throw error;
  }
}

/**
 * Vista previa del cierre — calcula datos sin guardar
 */
async function previsualizarCierre(obraId, empresaId, periodo) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Validar formato del período YYYY-MM
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      throw new Error('El período debe tener formato YYYY-MM (Ej: 2026-04)');
    }

    // Verificar si ya existe un cierre para este período
    const cierreExistente = await cierresRepository.findByPeriodo(obraId, periodo);

    if (cierreExistente && !cierreExistente.reabierto) {
      throw new Error(
        `Ya existe un cierre para el período ${periodo}. ` +
        `Cierre ID: ${cierreExistente.id}`
      );
    }

    // Calcular datos del período
    const datos = await cierresRepository.calcularDatosPeriodo(obraId, periodo);

    return {
      obra: {
        id: obra.id,
        nombre: obra.nombre,
        cliente: obra.cliente
      },
      periodo,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin: datos.fecha_fin,
      resumen: {
        total_ingresos: datos.total_ingresos,
        total_egresos: datos.total_egresos,
        saldo_final: datos.saldo_final,
        snapshot_fondo_garantia: datos.snapshot_fondo_garantia
      },
      categorias: datos.snapshot_categorias,
      advertencia: datos.total_ingresos === 0 && datos.total_egresos === 0
        ? 'No hay movimientos en este período'
        : null
    };
  } catch (error) {
    console.error('Error en previsualizarCierre:', error.message);
    throw error;
  }
}

/**
 * Ejecutar cierre mensual
 * Congela el estado financiero del período
 */
async function ejecutarCierre(obraId, empresaId, periodo, usuarioId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Validar formato del período
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      throw new Error('El período debe tener formato YYYY-MM (Ej: 2026-04)');
    }

    // Verificar que no exista ya un cierre para este período
    const cierreExistente = await cierresRepository.findByPeriodo(obraId, periodo);

    if (cierreExistente && !cierreExistente.reabierto) {
      throw new Error(
        `Ya existe un cierre para el período ${periodo}`
      );
    }

    // Calcular datos del período
    const datos = await cierresRepository.calcularDatosPeriodo(obraId, periodo);

    // Crear el cierre
    const nuevoCierre = {
      id: uuidv4(),
      obra_id: obraId,
      periodo,
      total_ingresos: datos.total_ingresos,
      total_egresos: datos.total_egresos,
      saldo_final: datos.saldo_final,
      snapshot_categorias: datos.snapshot_categorias,
      snapshot_fondo_garantia: datos.snapshot_fondo_garantia,
      fecha_cierre: new Date().toISOString().split('T')[0],
      cerrado_por: usuarioId
    };

    const cierreId = await cierresRepository.create(nuevoCierre);

    return {
      id: cierreId,
      mensaje: `Cierre del período ${periodo} ejecutado exitosamente`,
      periodo,
      resumen: {
        total_ingresos: datos.total_ingresos,
        total_egresos: datos.total_egresos,
        saldo_final: datos.saldo_final,
        snapshot_fondo_garantia: datos.snapshot_fondo_garantia
      }
    };
  } catch (error) {
    console.error('Error en ejecutarCierre:', error.message);
    throw error;
  }
}

/**
 * Reabrir un cierre (para correcciones)
 * Solo Admin, con motivo obligatorio
 */
async function reabrirCierre(id, obraId, empresaId, usuarioId, motivo) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const cierre = await cierresRepository.findById(id, obraId);

    if (!cierre) {
      throw new Error('Cierre no encontrado');
    }

    if (cierre.reabierto) {
      throw new Error('Este cierre ya fue reabierto anteriormente');
    }

    if (!motivo || motivo.trim().length < 10) {
      throw new Error('El motivo de reapertura debe tener al menos 10 caracteres');
    }

    await cierresRepository.reabrir(id, obraId, usuarioId, motivo.trim());

    return {
      mensaje: `Cierre del período ${cierre.periodo} reabierto exitosamente`,
      id,
      periodo: cierre.periodo,
      motivo: motivo.trim()
    };
  } catch (error) {
    console.error('Error en reabrirCierre:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerCierres,
  obtenerCierrePorId,
  previsualizarCierre,
  ejecutarCierre,
  reabrirCierre
};