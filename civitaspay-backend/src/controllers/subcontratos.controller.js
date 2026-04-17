/**
 * Controller de Subcontratos
 * Manejo de requests HTTP para endpoints de subcontratos
 */

const subcontratosService = require('../services/subcontratos.service');

/**
 * GET /api/obras/:obraId/subcontratos
 */
async function listar(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await subcontratosService.obtenerSubcontratos(obraId, empresaId);

    res.json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/obras/:obraId/subcontratos/:id
 */
async function obtenerPorId(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;

    const subcontrato = await subcontratosService.obtenerSubcontratoPorId(
      id, obraId, empresaId
    );

    res.json({ success: true, data: subcontrato });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/subcontratos
 */
async function crear(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;

    // Validaciones básicas
    if (!req.body.proveedor) {
      return res.status(400).json({ success: false, error: 'El proveedor es requerido' });
    }
    if (!req.body.concepto) {
      return res.status(400).json({ success: false, error: 'El concepto es requerido' });
    }
    if (!req.body.monto_total) {
      return res.status(400).json({ success: false, error: 'El monto_total es requerido' });
    }

    const resultado = await subcontratosService.crearSubcontrato(
      req.body, obraId, empresaId, usuarioId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('debe') || error.message.includes('caracteres')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/obras/:obraId/subcontratos/:id
 */
async function actualizar(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await subcontratosService.actualizarSubcontrato(
      id, req.body, obraId, empresaId
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrado')) statusCode = 404;
    else if (error.message.includes('No se puede editar') ||
             error.message.includes('debe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/obras/:obraId/subcontratos/:id/estado
 */
async function cambiarEstado(req, res) {
  try {
    const { obraId, id } = req.params;
    const { estado } = req.body;
    const empresaId = req.user.empresa_id;

    if (!estado) {
      return res.status(400).json({ success: false, error: 'El campo estado es requerido' });
    }

    const estadosValidos = ['ACTIVO', 'PAUSADO', 'CANCELADO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Debe ser: ${estadosValidos.join(', ')}`
      });
    }

    const resultado = await subcontratosService.cambiarEstado(
      id, estado, obraId, empresaId
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrado')) statusCode = 404;
    else if (error.message.includes('No se puede cambiar')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/obras/:obraId/subcontratos/:id
 */
async function eliminar(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await subcontratosService.eliminarSubcontrato(
      id, obraId, empresaId
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrado')) statusCode = 404;
    else if (error.message.includes('No se puede eliminar')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/subcontratos/:id/pagos
 */
async function registrarPago(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;

    if (!req.body.monto) {
      return res.status(400).json({ success: false, error: 'El monto es requerido' });
    }
    if (!req.body.fecha_pago) {
      return res.status(400).json({ success: false, error: 'La fecha_pago es requerida' });
    }

    const resultado = await subcontratosService.registrarPago(
      id, req.body, obraId, empresaId, usuarioId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrado')) statusCode = 404;
    else if (error.message.includes('excede') ||
             error.message.includes('No se puede') ||
             error.message.includes('debe') ||
             error.message.includes('inválido')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  eliminar,
  registrarPago
};