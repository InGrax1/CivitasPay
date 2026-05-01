const usuariosAdminService = require('../services/usuarios_admin.service');

async function listar(req, res) {
  try {
    const empresaId = req.user.empresa_id;
    const resultado = await usuariosAdminService.listarUsuarios(empresaId);
    res.json({ success: true, ...resultado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function crear(req, res) {
  try {
    const empresaId = req.user.empresa_id;
    const { nombre_completo, email, password, telefono, rol_id } = req.body;

    if (!nombre_completo) return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    if (!email)           return res.status(400).json({ success: false, error: 'El email es requerido' });
    if (!rol_id)          return res.status(400).json({ success: false, error: 'El rol es requerido' });

    const resultado = await usuariosAdminService.crearUsuario(
      { nombre_completo, email, password, telefono, rol_id },
      empresaId
    );
    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('máximo') ||
                       error.message.includes('caracteres') ||
                       error.message.includes('válido') ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await usuariosAdminService.actualizarUsuario(id, req.body, empresaId);
    res.json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 :
                       error.message.includes('máximo') ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await usuariosAdminService.eliminarUsuario(id, empresaId);
    res.json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

module.exports = { listar, crear, actualizar, eliminar };