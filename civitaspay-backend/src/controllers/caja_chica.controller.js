/**
 * Controller de Caja Chica
 * Manejo de requests HTTP para endpoints de caja chica
 */

const cajaChicaService = require('../services/caja_chica.service');

/**
 * GET /api/obras/:obraId/caja-chica
 */
async function listar(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await cajaChicaService.obtenerCajas(obraId, empresaId);

    res.json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/obras/:obraId/caja-chica/:id
 */
async function obtenerPorId(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;

    const caja = await cajaChicaService.obtenerCajaPorId(id, obraId, empresaId);

    res.json({ success: true, data: caja });
  } catch (error) {
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/caja-chica
 */
async function crear(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await cajaChicaService.crearCaja(
      req.body, obraId, empresaId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('debe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/caja-chica/:id/reposicion
 * Reponer fondos a la caja chica
 */
async function reponerFondos(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;

    if (!req.body.monto) {
      return res.status(400).json({ success: false, error: 'El monto es requerido' });
    }
    if (!req.body.concepto) {
      return res.status(400).json({ success: false, error: 'El concepto es requerido' });
    }

    const resultado = await cajaChicaService.reponerFondos(
      id, req.body, obraId, empresaId, usuarioId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('excede') ||
             error.message.includes('inactiva') ||
             error.message.includes('debe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/caja-chica/:id/gasto
 * Registrar gasto desde la caja chica
 */
async function registrarGasto(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;

    if (!req.body.monto) {
      return res.status(400).json({ success: false, error: 'El monto es requerido' });
    }
    if (!req.body.concepto) {
      return res.status(400).json({ success: false, error: 'El concepto es requerido' });
    }

    const resultado = await cajaChicaService.registrarGasto(
      id, req.body, obraId, empresaId, usuarioId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('insuficiente') ||
             error.message.includes('inactiva') ||
             error.message.includes('debe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/caja-chica/:id/ajuste
 * Registrar ajuste de arqueo
 */
async function registrarAjuste(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;

    if (req.body.monto === undefined) {
      return res.status(400).json({ success: false, error: 'El monto es requerido' });
    }
    if (!req.body.concepto) {
      return res.status(400).json({ success: false, error: 'El concepto es requerido' });
    }

    const resultado = await cajaChicaService.registrarAjuste(
      id, req.body, obraId, empresaId, usuarioId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('negativo') ||
             error.message.includes('no puede ser 0') ||
             error.message.includes('debe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/obras/:obraId/caja-chica/:id/toggle
 * Activar o desactivar caja chica
 */
async function toggleActiva(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    const { activa } = req.body;

    if (activa === undefined) {
      return res.status(400).json({
        success: false,
        error: 'El campo activa (true/false) es requerido'
      });
    }

    const resultado = await cajaChicaService.toggleActiva(
      id, obraId, empresaId, activa
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  reponerFondos,
  registrarGasto,
  registrarAjuste,
  toggleActiva
};