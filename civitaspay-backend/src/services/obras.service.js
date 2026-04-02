/**
 * Service de Obras
 * Lógica de negocio para gestión de obras (proyectos de construcción)
 */

const obrasRepository = require('../repositories/obras.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Obtener todas las obras de una empresa
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} { total, obras }
 */
async function obtenerObras(empresaId) {
  try {
    const obras = await obrasRepository.findAll(empresaId);
    
    return {
      total: obras.length,
      obras: obras
    };
  } catch (error) {
    console.error('Error en obtenerObras:', error.message);
    throw error;
  }
}

/**
 * Obtener detalle de una obra específica
 * @param {string} id - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Obra con detalles
 */
async function obtenerObraPorId(id, empresaId) {
  try {
    const obra = await obrasRepository.findById(id, empresaId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    return obra;
  } catch (error) {
    console.error('Error en obtenerObraPorId:', error.message);
    throw error;
  }
}

/**
 * Crear una nueva obra
 * @param {Object} obraData - Datos de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<string>} UUID de la obra creada
 */
async function crearObra(obraData, empresaId) {
  try {
    // Validar que los porcentajes sumen 100%
    const sumaPorcentajes = 
      parseFloat(obraData.porcentaje_materiales || 0) +
      parseFloat(obraData.porcentaje_nomina || 0) +
      parseFloat(obraData.porcentaje_herramienta || 0);
    
    if (Math.abs(sumaPorcentajes - 100) > 0.01) {
      throw new Error(
        `Los porcentajes deben sumar 100%. Actual: ${sumaPorcentajes.toFixed(2)}%`
      );
    }
    
    // Validar que porcentaje de retención esté entre 0 y 100
    const retencion = parseFloat(obraData.porcentaje_retencion || 0);
    if (retencion < 0 || retencion > 100) {
      throw new Error('El porcentaje de retención debe estar entre 0 y 100%');
    }
    
    // Crear objeto completo con UUID
    const nuevaObra = {
      id: uuidv4(),
      empresa_id: empresaId,
      nombre: obraData.nombre,
      codigo: obraData.codigo || null,
      cliente: obraData.cliente,
      direccion: obraData.direccion || null,
      fecha_inicio: obraData.fecha_inicio,
      fecha_fin_estimada: obraData.fecha_fin_estimada || null,
      porcentaje_retencion: retencion,
      porcentaje_materiales: parseFloat(obraData.porcentaje_materiales),
      porcentaje_nomina: parseFloat(obraData.porcentaje_nomina),
      porcentaje_herramienta: parseFloat(obraData.porcentaje_herramienta),
      residente_id: obraData.residente_id || null,
      estado: obraData.estado || 'ACTIVA',
      activa: obraData.activa !== undefined ? obraData.activa : true
    };
    
    // Guardar en base de datos
    const obraId = await obrasRepository.create(nuevaObra);
    
    return {
      id: obraId,
      mensaje: 'Obra creada exitosamente'
    };
  } catch (error) {
    console.error('Error en crearObra:', error.message);
    throw error;
  }
}

/**
 * Actualizar una obra existente
 * @param {string} id - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @param {Object} obraData - Datos a actualizar
 * @returns {Promise<Object>} Confirmación de actualización
 */
async function actualizarObra(id, empresaId, obraData) {
  try {
    // Verificar que la obra existe
    const obraExistente = await obrasRepository.findById(id, empresaId);
    
    if (!obraExistente) {
      throw new Error('Obra no encontrada');
    }
    
    // Si se actualizan porcentajes, validar que sumen 100%
    if (obraData.porcentaje_materiales !== undefined ||
        obraData.porcentaje_nomina !== undefined ||
        obraData.porcentaje_herramienta !== undefined) {
      
      const materiales = parseFloat(
        obraData.porcentaje_materiales !== undefined 
          ? obraData.porcentaje_materiales 
          : obraExistente.porcentaje_materiales
      );
      
      const nomina = parseFloat(
        obraData.porcentaje_nomina !== undefined 
          ? obraData.porcentaje_nomina 
          : obraExistente.porcentaje_nomina
      );
      
      const herramienta = parseFloat(
        obraData.porcentaje_herramienta !== undefined 
          ? obraData.porcentaje_herramienta 
          : obraExistente.porcentaje_herramienta
      );
      
      const suma = materiales + nomina + herramienta;
      
      if (Math.abs(suma - 100) > 0.01) {
        throw new Error(
          `Los porcentajes deben sumar 100%. Actual: ${suma.toFixed(2)}%`
        );
      }
    }
    
    // Si se actualiza porcentaje de retención, validar rango
    if (obraData.porcentaje_retencion !== undefined) {
      const retencion = parseFloat(obraData.porcentaje_retencion);
      if (retencion < 0 || retencion > 100) {
        throw new Error('El porcentaje de retención debe estar entre 0 y 100%');
      }
    }
    
    // Preparar datos para actualizar (solo campos proporcionados)
    const datosActualizar = {};
    
    const camposPermitidos = [
      'nombre', 'codigo', 'cliente', 'direccion',
      'fecha_inicio', 'fecha_fin_estimada',
      'porcentaje_retencion', 'porcentaje_materiales', 'porcentaje_nomina',
      'porcentaje_herramienta', 'residente_id', 'estado', 'activa'
    ];
    
    camposPermitidos.forEach(campo => {
      if (obraData[campo] !== undefined) {
        datosActualizar[campo] = obraData[campo];
      } else {
        // Mantener valor existente
        datosActualizar[campo] = obraExistente[campo];
      }
    });
    
    // Actualizar en base de datos
    const actualizado = await obrasRepository.update(id, empresaId, datosActualizar);
    
    if (!actualizado) {
      throw new Error('No se pudo actualizar la obra');
    }
    
    return {
      mensaje: 'Obra actualizada exitosamente',
      id: id
    };
  } catch (error) {
    console.error('Error en actualizarObra:', error.message);
    throw error;
  }
}


/**
 * Eliminar una obra (soft delete)
 * @param {string} id - UUID de la obra
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Confirmación de eliminación
 */
async function eliminarObra(id, empresaId) {
  try {
    // Verificar que la obra existe
    const obraExistente = await obrasRepository.findById(id, empresaId);
    
    if (!obraExistente) {
      throw new Error('Obra no encontrada');
    }
    
    // TODO: Verificar que no tenga gastos o estimaciones pendientes
    // (Implementar en siguiente fase)
    
    // Soft delete
    const eliminado = await obrasRepository.softDelete(id, empresaId);
    
    if (!eliminado) {
      throw new Error('No se pudo eliminar la obra');
    }
    
    return {
      mensaje: 'Obra eliminada exitosamente',
      id: id
    };
  } catch (error) {
    console.error('Error en eliminarObra:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerObras,
  obtenerObraPorId,
  crearObra,
  actualizarObra,
  eliminarObra
};