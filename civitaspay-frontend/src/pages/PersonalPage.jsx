import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, Shield, HardHat, UserCog } from 'lucide-react';
import { usePersonal, useCrearUsuario, useActualizarUsuario, useEliminarUsuario } from '../hooks/usePersonal';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

// IDs de roles — los mismos que devuelve el backend
const ROLES = [
  { id: '6d0fa207-02f8-11f1-881f-047c16bc438e', nombre: 'ADMINISTRADOR', label: 'Administrador' },
  { id: '6d0fdb0a-02f8-11f1-881f-047c16bc438e', nombre: 'AUXILIAR',       label: 'Auxiliar' },
  { id: '6d0fddb4-02f8-11f1-881f-047c16bc438e', nombre: 'RESIDENTE',      label: 'Residente' },
];

const iconRol = {
  ADMINISTRADOR: <Shield size={14} className="text-civitas-blue" />,
  AUXILIAR:      <UserCog size={14} className="text-green-600" />,
  RESIDENTE:     <HardHat size={14} className="text-orange-500" />,
};

const colorRol = {
  ADMINISTRADOR: 'bg-civitas-blue-pale text-civitas-blue',
  AUXILIAR:      'bg-green-100 text-green-700',
  RESIDENTE:     'bg-orange-100 text-orange-700',
};

// Modal para crear o editar usuario
function UsuarioForm({ usuario = null, onClose }) {
  const esEdicion = !!usuario;

  const [form, setForm] = useState({
    nombre_completo: usuario?.nombre_completo ?? '',
    email:           usuario?.email ?? '',
    telefono:        usuario?.telefono ?? '',
    rol_id:          usuario?.rol_id ?? ROLES[1].id,
    password:        '',
    activo:          usuario?.activo ?? true,
  });

  const crearUsuario    = useCrearUsuario();
  const actualizarUsuario = useActualizarUsuario();
  const isPending = crearUsuario.isPending || actualizarUsuario.isPending;

  const rolSeleccionado = ROLES.find((r) => r.id === form.rol_id);
  const esResidente = rolSeleccionado?.nombre === 'RESIDENTE';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (esResidente) delete payload.password;
    if (esEdicion) {
      await actualizarUsuario.mutateAsync({ id: usuario.id, data: payload });
    } else {
      await crearUsuario.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {esEdicion ? 'Actualiza los datos del usuario' : 'Registra un nuevo miembro del equipo'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-civitas-blue">Nombre Completo:</label>
            <input
              type="text"
              name="nombre_completo"
              value={form.nombre_completo}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-civitas-blue"
            />
          </div>

          {/* Email + Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Email:</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@empresa.com"
                required
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-civitas-blue"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="55 1234 5678"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-civitas-blue"
              />
            </div>
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Rol:</label>
            <select
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-civitas-blue bg-white"
            >
              {ROLES.map((rol) => (
                <option key={rol.id} value={rol.id}>{rol.label}</option>
              ))}
            </select>
            {esResidente && (
              <p className="text-xs text-orange-600 mt-0.5">
                ℹ️ Los residentes no tienen acceso al sistema — solo son figura de referencia en obras.
              </p>
            )}
          </div>

          {/* Password — solo si no es Residente */}
          {!esResidente && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                {esEdicion ? 'Nueva Contraseña (dejar vacío para no cambiar):' : 'Contraseña:'}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required={!esEdicion}
                minLength={8}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-civitas-blue"
              />
            </div>
          )}

          {/* Activo — solo en edición */}
          {esEdicion && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${form.activo ? 'bg-civitas-blue' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="hidden" />
              <span className="text-sm text-gray-700">Usuario activo</span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={isPending}>
              {esEdicion ? 'Actualizar' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PersonalPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';

  const [modalNuevo, setModalNuevo]           = useState(false);
  const [usuarioEditar, setUsuarioEditar]     = useState(null);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);

  const { data: usuarios = [], isLoading } = usePersonal();
  const eliminarUsuario = useEliminarUsuario();

  // Separar por rol
  const admins    = usuarios.filter((u) => u.rol === 'ADMINISTRADOR');
  const auxiliares = usuarios.filter((u) => u.rol === 'AUXILIAR');
  const residentes = usuarios.filter((u) => u.rol === 'RESIDENTE');

  if (!esAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Solo los administradores pueden ver esta sección</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Personal</h1>
          <p className="text-sm text-gray-400">Gestión de usuarios de la empresa</p>
        </div>
        <Button icon={Plus} size="sm" onClick={() => setModalNuevo(true)}>
          Nuevo Usuario
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <Shield size={20} className="text-civitas-blue mx-auto mb-1" />
          <p className="text-2xl font-bold text-civitas-blue">{admins.length}<span className="text-sm text-gray-400">/5</span></p>
          <p className="text-xs text-gray-400 mt-0.5">Administradores</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <UserCog size={20} className="text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-600">{auxiliares.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Auxiliares</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <HardHat size={20} className="text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-500">{residentes.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Residentes</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Cargando personal..." />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No hay usuarios registrados</p>
            <button
              onClick={() => setModalNuevo(true)}
              className="mt-2 text-civitas-blue text-sm font-medium hover:underline"
            >
              Crear primer usuario →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Teléfono</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden lg:table-cell">Último acceso</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-civitas-blue-pale flex items-center justify-center flex-shrink-0">
                          <span className="text-civitas-blue text-xs font-bold">
                            {u.nombre_completo.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.nombre_completo}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorRol[u.rol]}`}>
                        {iconRol[u.rol]}
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {u.telefono ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {u.ultimo_login
                        ? new Date(u.ultimo_login).toLocaleDateString('es-MX')
                        : 'Nunca'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setUsuarioEditar(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-civitas-blue hover:bg-civitas-blue-pale transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        {/* No puede eliminarse a sí mismo */}
                        {u.id !== usuario.id && (
                          <button
                            onClick={() => setUsuarioEliminar(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalNuevo && (
        <UsuarioForm onClose={() => setModalNuevo(false)} />
      )}
      {usuarioEditar && (
        <UsuarioForm
          usuario={usuarioEditar}
          onClose={() => setUsuarioEditar(null)}
        />
      )}
      {usuarioEliminar && (
        <ConfirmDeleteModal
          titulo="Eliminar Usuario"
          nombre={usuarioEliminar.nombre_completo}
          onConfirm={async () => {
            await eliminarUsuario.mutateAsync(usuarioEliminar.id);
            setUsuarioEliminar(null);
          }}
          onClose={() => setUsuarioEliminar(null)}
          loading={eliminarUsuario.isPending}
        />
      )}
    </div>
  );
}

export default PersonalPage;