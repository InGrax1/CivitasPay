/**
 * Service de Caja Chica
 * Lógica de negocio para gestión de fondos de caja chica
 */

const cajaChicaRepository = require('../repositories/caja_chica.repository');
const obrasRepository = require('../repositories/obras.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Listar cajas chicas de una obra
 */
async function obtenerCajas(obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    const cajas = await cajaChicaRepository.findByObra(obraId);

    return {
      total: cajas.length,
      cajas
    };
  } catch (error) {
    console.error('Error en obtenerCajas:', error.message);
    throw error;
  }
}

/**
 * Obtener detalle de una caja con sus movimientos
 */
async function obtenerCajaPorId(id, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    const caja = await cajaChicaRepository.findById(id, obraId);

    if (!caja) {
      throw new Error('Caja chica no encontrada');
    }

    const movimientos = await cajaChicaRepository.findMovimientos(id, 20);

    return {
      ...caja,
      movimientos
    };
  } catch (error) {
    console.error('Error en obtenerCajaPorId:', error.message);
    throw error;
  }
}

/**
 * Crear una nueva caja chica para una obra
 */
async function crearCaja(data, obraId, empresaId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada o no pertenece a tu empresa');
    }

    // Validar límite máximo
    if (data.limite_maximo !== undefined) {
      const limite = parseFloat(data.limite_maximo);
      if (limite <= 0) {
        throw new Error('El límite máximo debe ser mayor a 0');
      }
    }

    const nuevaCaja = {
      id: uuidv4(),
      obra_id: obraId,
      nombre: data.nombre || 'Caja Chica Principal',
      limite_maximo: parseFloat(data.limite_maximo || 5000),
      responsable_id: data.responsable_id || null
    };

    const cajaId = await cajaChicaRepository.create(nuevaCaja);

    return {
      id: cajaId,
      mensaje: 'Caja chica creada exitosamente',
      nombre: nuevaCaja.nombre,
      limite_maximo: nuevaCaja.limite_maximo,
      saldo_inicial: 0
    };
  } catch (error) {
    console.error('Error en crearCaja:', error.message);
    throw error;
  }
}

/**
 * Reponer fondos de la caja chica (REPOSICION)
 * El dinero viene de una categoría de la obra
 */
async function reponerFondos(cajaId, data, obraId, empresaId, usuarioId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const caja = await cajaChicaRepository.findById(cajaId, obraId);

    if (!caja) {
      throw new Error('Caja chica no encontrada');
    }

    if (!caja.activa) {
      throw new Error('La caja chica está inactiva');
    }

    // Validar monto
    const monto = parseFloat(data.monto);
    if (!monto || monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    // Validar que no exceda el límite máximo
    const saldoActual = parseFloat(caja.saldo_actual);
    const limiteMaximo = parseFloat(caja.limite_maximo);

    if (saldoActual + monto > limiteMaximo) {
      throw new Error(
        `La reposición excede el límite máximo de $${limiteMaximo.toFixed(2)}. ` +
        `Saldo actual: $${saldoActual.toFixed(2)}, ` +
        `máximo permitido a reponer: $${(limiteMaximo - saldoActual).toFixed(2)}`
      );
    }

    if (!data.concepto || data.concepto.trim().length < 3) {
      throw new Error('El concepto debe tener al menos 3 caracteres');
    }

    const movimiento = {
      id: uuidv4(),
      tipo: 'REPOSICION',
      monto: monto, // Positivo = entrada de dinero
      concepto: data.concepto.trim(),
      categoria_origen_id: data.categoria_origen_id || null,
      notas: data.notas || null,
      created_by: usuarioId
    };

    const resultado = await cajaChicaRepository.registrarMovimiento(cajaId, movimiento);

    return {
      id: resultado.movimiento_id,
      mensaje: `Fondos repuestos exitosamente`,
      monto_repuesto: monto,
      saldo_anterior: resultado.saldo_anterior,
      saldo_nuevo: resultado.saldo_nuevo
    };
  } catch (error) {
    console.error('Error en reponerFondos:', error.message);
    throw error;
  }
}

/**
 * Registrar un gasto de caja chica (GASTO)
 * Descuenta del saldo de la caja
 */
async function registrarGasto(cajaId, data, obraId, empresaId, usuarioId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const caja = await cajaChicaRepository.findById(cajaId, obraId);

    if (!caja) {
      throw new Error('Caja chica no encontrada');
    }

    if (!caja.activa) {
      throw new Error('La caja chica está inactiva');
    }

    // Validar monto
    const monto = parseFloat(data.monto);
    if (!monto || monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    // Validar que haya saldo suficiente
    const saldoActual = parseFloat(caja.saldo_actual);
    if (monto > saldoActual) {
      throw new Error(
        `Saldo insuficiente. Saldo disponible: $${saldoActual.toFixed(2)}, ` +
        `monto solicitado: $${monto.toFixed(2)}`
      );
    }

    if (!data.concepto || data.concepto.trim().length < 3) {
      throw new Error('El concepto debe tener al menos 3 caracteres');
    }

    const movimiento = {
      id: uuidv4(),
      tipo: 'GASTO',
      monto: -monto, // Negativo = salida de dinero
      concepto: data.concepto.trim(),
      gasto_id: data.gasto_id || null,
      notas: data.notas || null,
      created_by: usuarioId
    };

    const resultado = await cajaChicaRepository.registrarMovimiento(cajaId, movimiento);

    return {
      id: resultado.movimiento_id,
      mensaje: 'Gasto registrado en caja chica',
      monto_gastado: monto,
      saldo_anterior: resultado.saldo_anterior,
      saldo_nuevo: resultado.saldo_nuevo
    };
  } catch (error) {
    console.error('Error en registrarGasto:', error.message);
    throw error;
  }
}

/**
 * Registrar un ajuste de caja chica (AJUSTE)
 * Para corregir diferencias de arqueo
 */
async function registrarAjuste(cajaId, data, obraId, empresaId, usuarioId) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const caja = await cajaChicaRepository.findById(cajaId, obraId);

    if (!caja) {
      throw new Error('Caja chica no encontrada');
    }

    // Validar monto (puede ser positivo o negativo)
    const monto = parseFloat(data.monto);
    if (monto === 0) {
      throw new Error('El monto del ajuste no puede ser 0');
    }

    if (!data.concepto || data.concepto.trim().length < 3) {
      throw new Error('El concepto debe tener al menos 3 caracteres');
    }

    // Validar que el ajuste no deje saldo negativo
    const saldoActual = parseFloat(caja.saldo_actual);
    if (saldoActual + monto < 0) {
      throw new Error(
        `El ajuste dejaría el saldo negativo. Saldo actual: $${saldoActual.toFixed(2)}`
      );
    }

    const movimiento = {
      id: uuidv4(),
      tipo: 'AJUSTE',
      monto: monto,
      concepto: data.concepto.trim(),
      notas: data.notas || null,
      created_by: usuarioId
    };

    const resultado = await cajaChicaRepository.registrarMovimiento(cajaId, movimiento);

    return {
      id: resultado.movimiento_id,
      mensaje: 'Ajuste registrado exitosamente',
      monto_ajuste: monto,
      saldo_anterior: resultado.saldo_anterior,
      saldo_nuevo: resultado.saldo_nuevo
    };
  } catch (error) {
    console.error('Error en registrarAjuste:', error.message);
    throw error;
  }
}

/**
 * Activar o desactivar una caja chica
 */
async function toggleActiva(id, obraId, empresaId, activa) {
  try {
    const obra = await obrasRepository.findById(obraId, empresaId);

    if (!obra) {
      throw new Error('Obra no encontrada');
    }

    const caja = await cajaChicaRepository.findById(id, obraId);

    if (!caja) {
      throw new Error('Caja chica no encontrada');
    }

    await cajaChicaRepository.toggleActiva(id, obraId, activa);

    return {
      mensaje: activa ? 'Caja chica activada' : 'Caja chica desactivada',
      id,
      activa
    };
  } catch (error) {
    console.error('Error en toggleActiva:', error.message);
    throw error;
  }
}

module.exports = {
  obtenerCajas,
  obtenerCajaPorId,
  crearCaja,
  reponerFondos,
  registrarGasto,
  registrarAjuste,
  toggleActiva
};