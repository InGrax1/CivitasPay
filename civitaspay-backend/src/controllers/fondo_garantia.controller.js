/**
 * Controller de Fondo de Garantía
 */

const fondoGarantiaService = require('../services/fondo_garantia.service');

/**
 * GET /api/obras/:obraId/fondo-garantia
 */
async function obtenerFondo(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await fondoGarantiaService.obtenerFondo(obraId, empresaId);

    res.json({ success: true, data: resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/fondo-garantia/liberar
 * Liberar fondos del fondo de garantía
 */
async function liberarFondo(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    const { monto, notas } = req.body;

    if (!monto) {
      return res.status(400).json({
        success: false,
        error: 'El monto a liberar es requerido'
      });
    }

    const resultado = await fondoGarantiaService.liberarFondo(
      obraId, empresaId, monto, notas
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('excede') ||
             error.message.includes('debe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

module.exports = {
  obtenerFondo,
  liberarFondo
};