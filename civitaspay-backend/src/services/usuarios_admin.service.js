const usuariosAdminRepository = require('../repositories/usuarios_admin.repository');
const rolesRepository = require('../repositories/roles.repository');
const authService = require('./auth.service');

const MAX_ADMINS = 5;

async function listarUsuarios(empresaId) {
  const usuarios = await usuariosAdminRepository.findByEmpresa(empresaId);
  return {
    total: usuarios.length,
    usuarios: usuarios.map((u) => ({
      id:              u.id,
      nombre_completo: u.nombre_completo,
      email:           u.email,
      telefono:        u.telefono,
      activo:          u.activo,
      rol:             u.rol,
      rol_id:          u.rol_id,
      ultimo_login:    u.ultimo_login,
      created_at:      u.created_at,
    })),
  };
}

async function crearUsuario(data, empresaId) {
  // Obtener el rol
  const rol = await rolesRepository.findById(data.rol_id);
  if (!rol) throw new Error('Rol no válido');

  // Validar límite de administradores
  if (rol.nombre === 'ADMINISTRADOR') {
    const totalAdmins = await usuariosAdminRepository.countAdmins(empresaId);
    if (totalAdmins >= MAX_ADMINS) {
      throw new Error(`No se pueden registrar más de ${MAX_ADMINS} administradores por empresa`);
    }
  }

  // Los residentes no tienen password — no acceden al sistema
  let passwordHash = null;
  if (rol.nombre !== 'RESIDENTE') {
    if (!data.password || data.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    passwordHash = await authService.hashPassword(data.password);
  } else {
    // Password genérico para residentes (nunca lo usan)
    passwordHash = await authService.hashPassword('ResidenteSinAcceso2026!');
  }

  const id = await usuariosAdminRepository.create({
    empresa_id:      empresaId,
    rol_id:          data.rol_id,
    nombre_completo: data.nombre_completo,
    email:           data.email,
    telefono:        data.telefono ?? null,
    password_hash:   passwordHash,
  });

  return {
    id,
    mensaje: `${rol.nombre === 'RESIDENTE' ? 'Residente' : 'Usuario'} creado exitosamente`,
  };
}

async function actualizarUsuario(id, data, empresaId) {
  const usuario = await usuariosAdminRepository.findById(id, empresaId);
  if (!usuario) throw new Error('Usuario no encontrado');

  // Si cambia a Admin verificar límite
  const rolNuevo = await rolesRepository.findById(data.rol_id);
  if (!rolNuevo) throw new Error('Rol no válido');

  if (rolNuevo.nombre === 'ADMINISTRADOR' && usuario.rol !== 'ADMINISTRADOR') {
    const totalAdmins = await usuariosAdminRepository.countAdmins(empresaId);
    if (totalAdmins >= MAX_ADMINS) {
      throw new Error(`No se pueden registrar más de ${MAX_ADMINS} administradores por empresa`);
    }
  }

  await usuariosAdminRepository.update(id, empresaId, {
    nombre_completo: data.nombre_completo,
    email:           data.email,
    telefono:        data.telefono ?? null,
    rol_id:          data.rol_id,
    activo:          data.activo !== undefined ? data.activo : usuario.activo,
  });

  return { mensaje: 'Usuario actualizado exitosamente' };
}

async function eliminarUsuario(id, empresaId) {
  const usuario = await usuariosAdminRepository.findById(id, empresaId);
  if (!usuario) throw new Error('Usuario no encontrado');

  const eliminado = await usuariosAdminRepository.softDelete(id, empresaId);
  if (!eliminado) throw new Error('No se pudo eliminar el usuario');

  return { mensaje: 'Usuario eliminado exitosamente' };
}

module.exports = {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};