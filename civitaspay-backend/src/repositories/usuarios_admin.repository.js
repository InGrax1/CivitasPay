const { pool } = require('../config/database');

async function findByEmpresa(empresaId) {
  const [rows] = await pool.query(`
    SELECT 
      u.id,
      u.nombre_completo,
      u.email,
      u.telefono,
      u.activo,
      u.ultimo_login,
      u.created_at,
      r.nombre AS rol,
      r.id AS rol_id
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id
    WHERE u.empresa_id = ?
      AND u.deleted_at IS NULL
    ORDER BY r.nombre, u.nombre_completo
  `, [empresaId]);
  return rows;
}

async function findById(id, empresaId) {
  const [rows] = await pool.query(`
    SELECT u.id, u.nombre_completo, u.email, u.telefono,
           u.activo, r.nombre AS rol, r.id AS rol_id
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id
    WHERE u.id = ? AND u.empresa_id = ? AND u.deleted_at IS NULL
  `, [id, empresaId]);
  return rows[0] ?? null;
}

async function create(data) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await pool.query(`
    INSERT INTO usuarios (id, empresa_id, rol_id, nombre_completo, email, password_hash, telefono, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
  `, [id, data.empresa_id, data.rol_id, data.nombre_completo, data.email, data.password_hash, data.telefono ?? null]);
  return id;
}

async function update(id, empresaId, data) {
  const [result] = await pool.query(`
    UPDATE usuarios
    SET nombre_completo = ?, email = ?, telefono = ?, rol_id = ?, activo = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ? AND deleted_at IS NULL
  `, [data.nombre_completo, data.email, data.telefono, data.rol_id, data.activo, id, empresaId]);
  return result.affectedRows > 0;
}

async function softDelete(id, empresaId) {
  const [result] = await pool.query(`
    UPDATE usuarios SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ? AND deleted_at IS NULL
  `, [id, empresaId]);
  return result.affectedRows > 0;
}

async function countAdmins(empresaId) {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id
    WHERE u.empresa_id = ?
      AND r.nombre = 'ADMINISTRADOR'
      AND u.deleted_at IS NULL
  `, [empresaId]);
  return parseInt(rows[0].total);
}

module.exports = { findByEmpresa, findById, create, update, softDelete, countAdmins };