/**
 * Service de Subcontratos
 * Lógica de negocio para gestión de subcontratos y sus pagos
 */

const subcontratosRepository = require('../repositories/subcontratos.repository');
const obrasRepository = require('../repositories/obras.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Listar subcontratos de una obra
 */
async function obtenerSubcontratos(obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    const subcontratos = await subcontratosRepository.findByObra(obraId);

    return {
      total: subcontratos.length,
      subcontratos
    };
  } catch (error) {
    console.error('Error en obtenerSubcontratos:', error.message);
    throw error;
  }
}

/**
 * Obtener detalle de un subcontrato
 */
async function obtenerSubcontratoPorId(id, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    const subcontrato = await subcontratosRepository.findById(id, obraId);

    if (!subcontrato) {
      throw new Error('Subcontrato no encontrado');
    }

    // Obtener pagos del subcontrato
    const pagos = await subcontratosRepository.findPagosBySubcontrato(id);

    return {
      ...subcontrato,
      pagos
    };
  } catch (error) {
    console.error('Error en obtenerSubcontratoPorId:', error.message);
    throw error;
  }
}

/**
 * Crear un nuevo subcontrato
 */
async function crearSubcontrato(data, obraId, empresaId, usuarioId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Validaciones
    if (!data.proveedor || data.proveedor.trim().length < 3) {
      throw new Error('El proveedor debe tener al menos 3 caracteres');
    }

    if (!data.concepto || data.concepto.trim().length < 3) {
      throw new Error('El concepto debe tener al menos 3 caracteres');
    }

    const montoTotal = parseFloat(data.monto_total);
    if (!montoTotal || montoTotal <= 0) {
      throw new Error('El monto total debe ser mayor a 0');
    }

    const nuevoSubcontrato = {
      id: uuidv4(),
      obra_id: obraId,
      proveedor: data.proveedor.trim(),
      concepto: data.concepto.trim(),
      monto_total: montoTotal,
      fecha_inicio: data.fecha_inicio || null,
      fecha_termino_estimada: data.fecha_termino_estimada || null,
      archivo_contrato_url: data.archivo_contrato_url || null,
      notas: data.notas || null,
      created_by: usuarioId
    };

    const subcontratoId = await subcontratosRepository.create(nuevoSubcontrato);

    return {
      id: subcontratoId,
      mensaje: 'Subcontrato creado exitosamente',
      monto_total: montoTotal,
      proveedor: nuevoSubcontrato.proveedor
    };
  } catch (error) {
    console.error('Error en crearSubcontrato:', error.message);
    throw error;
  }
}

/**
 * Actualizar subcontrato (solo si está ACTIVO o PAUSADO)
 */
async function actualizarSubcontrato(id, data, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const subcontrato = await subcontratosRepository.findById(id, obraId);

    if (!subcontrato) {
      throw new Error('Subcontrato no encontrado');
    }

    // Solo se puede editar si está ACTIVO o PAUSADO
    if (!['ACTIVO', 'PAUSADO'].includes(subcontrato.estado)) {
      throw new Error(
        `No se puede editar un subcontrato en estado ${subcontrato.estado}`
      );
    }

    // Validar monto si se proporciona
    if (data.monto_total !== undefined) {
      const monto = parseFloat(data.monto_total);
      if (monto <= 0) {
        throw new Error('El monto total debe ser mayor a 0');
      }
    }

    const datosActualizar = {
      proveedor: data.proveedor !== undefined
        ? data.proveedor.trim()
        : subcontrato.proveedor,
      concepto: data.concepto !== undefined
        ? data.concepto.trim()
        : subcontrato.concepto,
      monto_total: data.monto_total !== undefined
        ? parseFloat(data.monto_total)
        : subcontrato.monto_total,
      fecha_inicio: data.fecha_inicio !== undefined
        ? data.fecha_inicio
        : subcontrato.fecha_inicio,
      fecha_termino_estimada: data.fecha_termino_estimada !== undefined
        ? data.fecha_termino_estimada
        : subcontrato.fecha_termino_estimada,
      archivo_contrato_url: data.archivo_contrato_url !== undefined
        ? data.archivo_contrato_url
        : subcontrato.archivo_contrato_url,
      notas: data.notas !== undefined
        ? data.notas
        : subcontrato.notas
    };

    const actualizado = await subcontratosRepository.update(id, obraId, datosActualizar);

    if (!actualizado) {
      throw new Error('No se pudo actualizar el subcontrato');
    }

    return {
      mensaje: 'Subcontrato actualizado exitosamente',
      id
    };
  } catch (error) {
    console.error('Error en actualizarSubcontrato:', error.message);
    throw error;
  }
}

/**
 * Cambiar estado del subcontrato
 */
async function cambiarEstado(id, nuevoEstado, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const subcontrato = await subcontratosRepository.findById(id, obraId);

    if (!subcontrato) {
      throw new Error('Subcontrato no encontrado');
    }

    // Validar transiciones permitidas
    const transicionesPermitidas = {
      'ACTIVO': ['PAUSADO', 'CANCELADO'],
      'PAUSADO': ['ACTIVO', 'CANCELADO'],
      'LIQUIDADO': [], // Estado final automático
      'CANCELADO': []  // Estado final
    };

    if (!transicionesPermitidas[subcontrato.estado]?.includes(nuevoEstado)) {
      throw new Error(
        `No se puede cambiar de ${subcontrato.estado} a ${nuevoEstado}`
      );
    }

    await subcontratosRepository.cambiarEstado(id, obraId, nuevoEstado);

    return {
      mensaje: `Subcontrato cambiado a ${nuevoEstado}`,
      estado_anterior: subcontrato.estado,
      estado_nuevo: nuevoEstado
    };
  } catch (error) {
    console.error('Error en cambiarEstado (subcontratos):', error.message);
    throw error;
  }
}

/**
 * Eliminar subcontrato (solo si no tiene pagos)
 */
async function eliminarSubcontrato(id, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const subcontrato = await subcontratosRepository.findById(id, obraId);

    if (!subcontrato) {
      throw new Error('Subcontrato no encontrado');
    }

    // No se puede eliminar si ya tiene pagos
    if (parseFloat(subcontrato.monto_pagado) > 0) {
      throw new Error(
        'No se puede eliminar un subcontrato que ya tiene pagos registrados'
      );
    }

    const eliminado = await subcontratosRepository.softDelete(id, obraId);

    if (!eliminado) {
      throw new Error('No se pudo eliminar el subcontrato');
    }

    return {
      mensaje: 'Subcontrato eliminado exitosamente',
      id
    };
  } catch (error) {
    console.error('Error en eliminarSubcontrato:', error.message);
    throw error;
  }
}

/**
 * Registrar pago a un subcontrato
 */
async function registrarPago(subcontratoId, pagoData, obraId, empresaId, usuarioId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const subcontrato = await subcontratosRepository.findById(subcontratoId, obraId);

    if (!subcontrato) {
      throw new Error('Subcontrato no encontrado');
    }

    // Solo se puede pagar si está ACTIVO
    if (subcontrato.estado !== 'ACTIVO') {
      throw new Error(
        `No se puede registrar un pago en un subcontrato ${subcontrato.estado}`
      );
    }

    // Validar monto del pago
    const monto = parseFloat(pagoData.monto);
    if (!monto || monto <= 0) {
      throw new Error('El monto del pago debe ser mayor a 0');
    }

    // Validar que no exceda el monto pendiente
    const montoPendiente = parseFloat(subcontrato.monto_pendiente);
    if (monto > montoPendiente) {
      throw new Error(
        `El pago ($${monto.toFixed(2)}) excede el monto pendiente ($${montoPendiente.toFixed(2)})`
      );
    }

    // Validar método de pago
    const metodosValidos = ['TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'OTRO'];
    if (pagoData.metodo_pago && !metodosValidos.includes(pagoData.metodo_pago)) {
      throw new Error(
        `Método de pago inválido. Debe ser: ${metodosValidos.join(', ')}`
      );
    }

    const nuevoPago = {
      id: uuidv4(),
      monto,
      fecha_pago: pagoData.fecha_pago,
      metodo_pago: pagoData.metodo_pago || 'TRANSFERENCIA',
      referencia: pagoData.referencia || null,
      notas: pagoData.notas || null,
      created_by: usuarioId
    };

    const pagoId = await subcontratosRepository.registrarPago(
      subcontratoId,
      nuevoPago
    );

    // Verificar si quedó liquidado
    const nuevoMontoPendiente = montoPendiente - monto;
    const liquidado = nuevoMontoPendiente <= 0;

    return {
      id: pagoId,
      mensaje: liquidado
        ? '✅ Pago registrado. Subcontrato LIQUIDADO completamente.'
        : `Pago registrado exitosamente. Pendiente: $${nuevoMontoPendiente.toFixed(2)}`,
      monto_pagado: monto,
      monto_pendiente_restante: parseFloat(nuevoMontoPendiente.toFixed(2)),
      liquidado
    };
  } catch (error) {
    console.error('Error en registrarPago:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerSubcontratos,
  obtenerSubcontratoPorId,
  crearSubcontrato,
  actualizarSubcontrato,
  cambiarEstado,
  eliminarSubcontrato,
  registrarPago
};