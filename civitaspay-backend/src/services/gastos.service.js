/**
 * Service de Gastos
 * Lógica de negocio para gestión de egresos de obras
 */

const gastosRepository = require('../repositories/gastos.repository');
const obrasRepository = require('../repositories/obras.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Listar gastos de una obra con filtros opcionales
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Object>} Lista de gastos
 */
async function obtenerGastos(obraId, empresaId, filtros = {}) {
  try {
    // Verificar que la obra pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    const gastos = await gastosRepository.findByObra(obraId, filtros);
    
    return {
      total: gastos.length,
      gastos: gastos
    };
  } catch (error) {
    console.error('Error en obtenerGastos:', error.message);
    throw error;
  }
}

/**
 * Obtener detalle de un gasto
 * @param {string} id - UUID del gasto
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Gasto
 */
async function obtenerGastoPorId(id, obraId, empresaId) {
  try {
    // Verificar que la obra pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    const gasto = await gastosRepository.findById(id, obraId);
    
    if (!gasto) {
      throw new Error('Gasto no encontrado');
    }
    
    return gasto;
  } catch (error) {
    console.error('Error en obtenerGastoPorId:', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo gasto
 * @param {Object} gastoData - Datos del gasto
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @param {string} usuarioId - UUID del usuario que crea
 * @returns {Promise<Object>} Gasto creado
 */
async function crearGasto(gastoData, obraId, empresaId, usuarioId) {
  try {
    // Verificar que la obra existe y pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    // Validar monto
    const monto = parseFloat(gastoData.monto);
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    
    // Validar concepto
    if (!gastoData.concepto || gastoData.concepto.trim().length < 3) {
      throw new Error('El concepto debe tener al menos 3 caracteres');
    }
    
    // Validar fecha
    if (!gastoData.fecha_gasto) {
      throw new Error('La fecha del gasto es requerida');
    }
    
    // Crear objeto completo
    const nuevoGasto = {
      id: uuidv4(),
      obra_id: obraId,
      categoria_id: gastoData.categoria_id || null,
      concepto: gastoData.concepto.trim(),
      proveedor: gastoData.proveedor || null,
      monto: monto,
      fecha_gasto: gastoData.fecha_gasto,
      is_personal: gastoData.is_personal !== undefined ? gastoData.is_personal : false,
      is_caja_chica: gastoData.is_caja_chica !== undefined ? gastoData.is_caja_chica : false,
      factura_numero: gastoData.factura_numero || null,
      factura_xml_url: gastoData.factura_xml_url || null,
      factura_pdf_url: gastoData.factura_pdf_url || null,
      ticket_foto_url: gastoData.ticket_foto_url || null,
      tags: gastoData.tags || null,
      created_by: usuarioId
    };
    
    // Guardar en base de datos
    const gastoId = await gastosRepository.create(nuevoGasto);
    
    return {
      id: gastoId,
      mensaje: 'Gasto registrado exitosamente',
      monto: monto,
      concepto: nuevoGasto.concepto
    };
  } catch (error) {
    console.error('Error en crearGasto:', error.message);
    throw error;
  }
}

/**
 * Actualizar gasto
 * @param {string} id - UUID del gasto
 * @param {Object} gastoData - Datos a actualizar
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Confirmación
 */
async function actualizarGasto(id, gastoData, obraId, empresaId) {
  try {
    // Verificar que la obra existe
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    // Verificar que el gasto existe
    const gastoExistente = await gastosRepository.findById(id, obraId);
    
    if (!gastoExistente) {
      throw new Error('Gasto no encontrado');
    }
    
    // Validar monto si se proporciona
    if (gastoData.monto !== undefined) {
      const monto = parseFloat(gastoData.monto);
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
    }
    
    // Validar concepto si se proporciona
    if (gastoData.concepto !== undefined && gastoData.concepto.trim().length < 3) {
      throw new Error('El concepto debe tener al menos 3 caracteres');
    }
    
    // Preparar datos para actualizar
    const datosActualizar = {
      categoria_id: gastoData.categoria_id !== undefined ? gastoData.categoria_id : gastoExistente.categoria_id,
      concepto: gastoData.concepto !== undefined ? gastoData.concepto.trim() : gastoExistente.concepto,
      proveedor: gastoData.proveedor !== undefined ? gastoData.proveedor : gastoExistente.proveedor,
      monto: gastoData.monto !== undefined ? parseFloat(gastoData.monto) : gastoExistente.monto,
      fecha_gasto: gastoData.fecha_gasto !== undefined ? gastoData.fecha_gasto : gastoExistente.fecha_gasto,
      is_personal: gastoData.is_personal !== undefined ? gastoData.is_personal : gastoExistente.is_personal,
      is_caja_chica: gastoData.is_caja_chica !== undefined ? gastoData.is_caja_chica : gastoExistente.is_caja_chica,
      factura_numero: gastoData.factura_numero !== undefined ? gastoData.factura_numero : gastoExistente.factura_numero,
      factura_xml_url: gastoData.factura_xml_url !== undefined ? gastoData.factura_xml_url : gastoExistente.factura_xml_url,
      factura_pdf_url: gastoData.factura_pdf_url !== undefined ? gastoData.factura_pdf_url : gastoExistente.factura_pdf_url,
      ticket_foto_url: gastoData.ticket_foto_url !== undefined ? gastoData.ticket_foto_url : gastoExistente.ticket_foto_url,
      tags: gastoData.tags !== undefined ? gastoData.tags : (gastoExistente.tags ? JSON.parse(gastoExistente.tags) : null)
    };
    
    // Actualizar en base de datos
    const actualizado = await gastosRepository.update(id, obraId, datosActualizar);
    
    if (!actualizado) {
      throw new Error('No se pudo actualizar el gasto');
    }
    
    return {
      mensaje: 'Gasto actualizado exitosamente',
      id: id
    };
  } catch (error) {
    console.error('Error en actualizarGasto:', error.message);
    throw error;
  }
}

/**
 * Eliminar gasto
 * @param {string} id - UUID del gasto
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Confirmación
 */
async function eliminarGasto(id, obraId, empresaId) {
  try {
    // Verificar que la obra existe
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    // Verificar que el gasto existe
    const gasto = await gastosRepository.findById(id, obraId);
    
    if (!gasto) {
      throw new Error('Gasto no encontrado');
    }
    
    // Soft delete
    const eliminado = await gastosRepository.softDelete(id, obraId);
    
    if (!eliminado) {
      throw new Error('No se pudo eliminar el gasto');
    }
    
    return {
      mensaje: 'Gasto eliminado exitosamente',
      id: id
    };
  } catch (error) {
    console.error('Error en eliminarGasto:', error.message);
    throw error;
  }
}

/**
 * Obtener resumen de gastos por categoría
 * @param {string} obraId - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Resumen
 */
async function obtenerResumenPorCategoria(obraId, empresaId) {
  try {
    // Verificar que la obra pertenece a la empresa
    const obra = await obrasRepository.findById(obraId, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }
    
    const resumen = await gastosRepository.getResumenPorCategoria(obraId);
    
    return {
      obra_id: obraId,
      obra_nombre: obra.nombre,
      resumen: resumen
    };
  } catch (error) {
    console.error('Error en obtenerResumenPorCategoria:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerGastos,
  obtenerGastoPorId,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  obtenerResumenPorCategoria
};