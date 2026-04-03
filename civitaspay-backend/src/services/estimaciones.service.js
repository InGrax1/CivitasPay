/**
 * Service de Estimaciones
 * Lógica de negocio y Motor Financiero Automático
 */

const estimacionesRepository = require('../repositories/estimaciones.repository');
const obrasRepository = require('../repositories/obras.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Motor Financiero - Calcular todos los montos automáticamente
 * @param {number} montoBruto - Monto facturado al cliente (con IVA)
 * @param {number} porcentajeRetencion - % de retención (ej: 5)
 * @returns {Object} Todos los montos calculados
 */
function calcularMontos(montoBruto, porcentajeRetencion) {
  // Paso 1: Calcular monto base (sin IVA)
  const montoBase = montoBruto / 1.16;
  
  // Paso 2: Calcular IVA
  const iva = montoBruto - montoBase;
  
  // Paso 3: Calcular retención
  const retencion = montoBase * (porcentajeRetencion / 100);
  
  // Paso 4: Calcular costo directo
  const costoDirecto = montoBase - retencion;
  
  return {
    monto_base: parseFloat(montoBase.toFixed(2)),
    iva: parseFloat(iva.toFixed(2)),
    retencion: parseFloat(retencion.toFixed(2)),
    costo_directo: parseFloat(costoDirecto.toFixed(2))
  };
}

/**
 * Calcular distribución a categorías
 * @param {number} costoDirecto - Base repartible
 * @param {Object} obra - Obra con porcentajes
 * @returns {Object} Montos para cada categoría
 */
function calcularDistribucion(costoDirecto, obra) {
  const materiales = costoDirecto * (parseFloat(obra.porcentaje_materiales) / 100);
  const nomina = costoDirecto * (parseFloat(obra.porcentaje_nomina) / 100);
  const herramienta = costoDirecto * (parseFloat(obra.porcentaje_herramienta) / 100);
  
  return {
    asignado_materiales: parseFloat(materiales.toFixed(2)),
    asignado_nomina: parseFloat(nomina.toFixed(2)),
    asignado_herramienta: parseFloat(herramienta.toFixed(2))
  };
}

/**
 * Listar estimaciones de una obra
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Lista de estimaciones
 */
async function obtenerEstimaciones(obraId, empresaId) {
  try {
    // Verificar que la obra pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    const estimaciones = await estimacionesRepository.findByObra(obraId);
    
    return {
      total: estimaciones.length,
      estimaciones: estimaciones
    };
  } catch (error) {
    console.error('Error en obtenerEstimaciones:', error.message);
    throw error;
  }
}

/**
 * Obtener detalle de una estimación
 * @param {string} id - UUID de la estimación
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Estimación
 */
async function obtenerEstimacionPorId(id, obraId, empresaId) {
  try {
    // Verificar que la obra pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    const estimacion = await estimacionesRepository.findById(id, obraId);
    
    if (!estimacion) {
      throw new Error('Estimación no encontrada');
    }
    
    return estimacion;
  } catch (error) {
    console.error('Error en obtenerEstimacionPorId:', error.message);
    throw error;
  }
}

/**
 * Crear una nueva estimación
 * @param {Object} estimacionData - Datos de la estimación
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @param {string} usuarioId - UUID del usuario que crea
 * @returns {Promise<Object>} Estimación creada
 */
async function crearEstimacion(estimacionData, obraId, empresaId, usuarioId) {
  try {
    // Verificar que la obra existe y pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    // Validar monto bruto
    const montoBruto = parseFloat(estimacionData.monto_bruto);
    if (montoBruto <= 0) {
      throw new Error('El monto bruto debe ser mayor a 0');
    }
    
    // Obtener siguiente número de estimación
    const numeroEstimacion = await estimacionesRepository.getNextNumero(obraId);
    
    // ====================================
    // MOTOR FINANCIERO - Calcular Montos
    // ====================================
    const montosCalculados = calcularMontos(
      montoBruto,
      parseFloat(obra.porcentaje_retencion)
    );
    
    // Calcular distribución a categorías
    const distribucion = calcularDistribucion(
      montosCalculados.costo_directo,
      obra
    );
    
    // Crear objeto completo
    const nuevaEstimacion = {
      id: uuidv4(),
      obra_id: obraId,
      contrato_id: estimacionData.contrato_id || null,
      numero_estimacion: numeroEstimacion,
      periodo: estimacionData.periodo || null,
      monto_bruto: montoBruto,
      ...montosCalculados,
      ...distribucion,
      asignado_subcontratos: 0, // Por ahora siempre 0
      fecha_estimacion: estimacionData.fecha_estimacion,
      fecha_cobro: estimacionData.fecha_cobro || null,
      estado: 'BORRADOR',
      archivo_xml_url: estimacionData.archivo_xml_url || null,
      archivo_pdf_url: estimacionData.archivo_pdf_url || null,
      created_by: usuarioId
    };
    
    // Guardar en base de datos
    const estimacionId = await estimacionesRepository.create(nuevaEstimacion);
    
    return {
      id: estimacionId,
      numero_estimacion: numeroEstimacion,
      mensaje: 'Estimación creada exitosamente',
      montos_calculados: {
        monto_bruto: montoBruto,
        monto_base: montosCalculados.monto_base,
        iva: montosCalculados.iva,
        retencion: montosCalculados.retencion,
        costo_directo: montosCalculados.costo_directo,
        distribucion: {
          materiales: distribucion.asignado_materiales,
          nomina: distribucion.asignado_nomina,
          herramienta: distribucion.asignado_herramienta
        }
      }
    };
  } catch (error) {
    console.error('Error en crearEstimacion:', error.message);
    throw error;
  }
}

/**
 * Actualizar estimación (solo en estado BORRADOR)
 * @param {string} id - UUID de la estimación
 * @param {Object} estimacionData - Datos a actualizar
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Confirmación
 */
async function actualizarEstimacion(id, estimacionData, obraId, empresaId) {
  try {
    // Verificar que la obra existe
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    // Verificar que la estimación existe
    const estimacionExistente = await estimacionesRepository.findById(id, obraId);
    
    if (!estimacionExistente) {
      throw new Error('Estimación no encontrada');
    }
    
    // Solo se puede editar si está en BORRADOR
    if (estimacionExistente.estado !== 'BORRADOR') {
      throw new Error(`No se puede editar una estimación en estado ${estimacionExistente.estado}`);
    }
    
    // Si se actualiza el monto, recalcular todo
    let datosActualizar = { ...estimacionData };
    
    if (estimacionData.monto_bruto) {
      const montoBruto = parseFloat(estimacionData.monto_bruto);
      
      if (montoBruto <= 0) {
        throw new Error('El monto bruto debe ser mayor a 0');
      }
      
      // Recalcular montos
      const montosCalculados = calcularMontos(
        montoBruto,
        parseFloat(obra.porcentaje_retencion)
      );
      
      const distribucion = calcularDistribucion(
        montosCalculados.costo_directo,
        obra
      );
      
      datosActualizar = {
        ...datosActualizar,
        monto_bruto: montoBruto,
        ...montosCalculados,
        asignado_materiales: distribucion.asignado_materiales,
        asignado_nomina: distribucion.asignado_nomina,
        asignado_herramienta: distribucion.asignado_herramienta
      };
    } else {
      // Mantener montos existentes
      datosActualizar.monto_bruto = estimacionExistente.monto_bruto;
      datosActualizar.monto_base = estimacionExistente.monto_base;
      datosActualizar.iva = estimacionExistente.iva;
      datosActualizar.retencion = estimacionExistente.retencion;
      datosActualizar.costo_directo = estimacionExistente.costo_directo;
    }
    
    // Actualizar en base de datos
    const actualizado = await estimacionesRepository.update(id, obraId, datosActualizar);
    
    if (!actualizado) {
      throw new Error('No se pudo actualizar la estimación');
    }
    
    return {
      mensaje: 'Estimación actualizada exitosamente',
      id: id
    };
  } catch (error) {
    console.error('Error en actualizarEstimacion:', error.message);
    throw error;
  }
}

/**
 * Cambiar estado de estimación
 * @param {string} id - UUID de la estimación
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @param {string} usuarioId - UUID del usuario
 * @returns {Promise<Object>} Confirmación
 */
async function cambiarEstado(id, nuevoEstado, obraId, empresaId, usuarioId) {
  try {
    // Verificar que la obra existe
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    // Verificar que la estimación existe
    const estimacion = await estimacionesRepository.findById(id, obraId);
    
    if (!estimacion) {
      throw new Error('Estimación no encontrada');
    }
    
    // Validar transiciones de estado
    const estadoActual = estimacion.estado;
    const transicionesPermitidas = {
      'BORRADOR': ['EN_REVISION'],
      'EN_REVISION': ['APROBADA', 'BORRADOR'],
      'APROBADA': ['COBRADA'],
      'COBRADA': [] // Estado final
    };
    
    if (!transicionesPermitidas[estadoActual]?.includes(nuevoEstado)) {
      throw new Error(
        `No se puede cambiar de ${estadoActual} a ${nuevoEstado}`
      );
    }
    
    // Cambiar estado
    const actualizado = await estimacionesRepository.cambiarEstado(
      id,
      obraId,
      nuevoEstado,
      usuarioId
    );
    
    if (!actualizado) {
      throw new Error('No se pudo cambiar el estado');
    }
    
    // Mensaje según el nuevo estado
    let mensaje = `Estimación cambiada a ${nuevoEstado}`;
    
    if (nuevoEstado === 'APROBADA') {
      mensaje += '. El dinero se distribuirá automáticamente a las categorías.';
    }
    
    return {
      mensaje: mensaje,
      estado_anterior: estadoActual,
      estado_nuevo: nuevoEstado
    };
  } catch (error) {
    console.error('Error en cambiarEstado:', error.message);
    throw error;
  }
}

/**
 * Eliminar estimación (solo BORRADOR)
 * @param {string} id - UUID de la estimación
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Confirmación
 */
async function eliminarEstimacion(id, obraId, empresaId) {
  try {
    // Verificar que la obra existe
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    // Verificar que la estimación existe
    const estimacion = await estimacionesRepository.findById(id, obraId);
    
    if (!estimacion) {
      throw new Error('Estimación no encontrada');
    }
    
    // Solo se puede eliminar si está en BORRADOR
    if (estimacion.estado !== 'BORRADOR') {
      throw new Error('Solo se pueden eliminar estimaciones en estado BORRADOR');
    }
    
    // Soft delete
    const eliminado = await estimacionesRepository.softDelete(id, obraId);
    
    if (!eliminado) {
      throw new Error('No se pudo eliminar la estimación');
    }
    
    return {
      mensaje: 'Estimación eliminada exitosamente',
      id: id
    };
  } catch (error) {
    console.error('Error en eliminarEstimacion:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerEstimaciones,
  obtenerEstimacionPorId,
  crearEstimacion,
  actualizarEstimacion,
  cambiarEstado,
  eliminarEstimacion,
  calcularMontos, // Exportar para tests
  calcularDistribucion // Exportar para tests
};