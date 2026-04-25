import { useState, useEffect } from 'react';
import { X, DollarSign, MapPin, Calendar, User, Percent } from 'lucide-react';
import { useCrearObra, useActualizarObra } from '../../hooks/useObras';
import Button from '../ui/Button';

function ObraForm({ obra = null, onClose }) {
  const esEdicion = !!obra;

  const [form, setForm] = useState({
    nombre:                  '',
    cliente:                 '',
    direccion:               '',
    fecha_inicio:            '',
    fecha_fin_estimada:      '',
    porcentaje_retencion:    5,
    porcentaje_materiales:   60,
    porcentaje_nomina:       30,
    porcentaje_herramienta:  10,
    estado:                  'ACTIVA',
  });

  // Si es edición carga los datos existentes
  useEffect(() => {
    if (obra) {
      setForm({
        nombre:                 obra.nombre ?? '',
        cliente:                obra.cliente ?? '',
        direccion:              obra.direccion ?? '',
        fecha_inicio:           obra.fecha_inicio?.split('T')[0] ?? '',
        fecha_fin_estimada:     obra.fecha_fin_estimada?.split('T')[0] ?? '',
        porcentaje_retencion:   parseFloat(obra.porcentaje_retencion) ?? 5,
        porcentaje_materiales:  parseFloat(obra.porcentaje_materiales) ?? 60,
        porcentaje_nomina:      parseFloat(obra.porcentaje_nomina) ?? 30,
        porcentaje_herramienta: parseFloat(obra.porcentaje_herramienta) ?? 10,
        estado:                 obra.estado ?? 'ACTIVA',
      });
    }
  }, [obra]);

  const crearObra     = useCrearObra();
  const actualizarObra = useActualizarObra();

  const isPending = crearObra.isPending || actualizarObra.isPending;

  // Suma de los tres porcentajes
  const sumaPorc =
    parseFloat(form.porcentaje_materiales || 0) +
    parseFloat(form.porcentaje_nomina || 0) +
    parseFloat(form.porcentaje_herramienta || 0);

  const sumaCien = Math.abs(sumaPorc - 100) < 0.01;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sumaCien) return;

    const payload = {
      ...form,
      porcentaje_retencion:   parseFloat(form.porcentaje_retencion),
      porcentaje_materiales:  parseFloat(form.porcentaje_materiales),
      porcentaje_nomina:      parseFloat(form.porcentaje_nomina),
      porcentaje_herramienta: parseFloat(form.porcentaje_herramienta),
    };

    if (esEdicion) {
      await actualizarObra.mutateAsync({ id: obra.id, data: payload });
    } else {
      await crearObra.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {esEdicion ? 'Editar Obra' : 'Registrar Obra'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {esEdicion
                ? 'Cualquier cambio afectará los registros existentes'
                : 'Ingresa los datos para registrar una nueva obra'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aviso de edición */}
        {esEdicion && (
          <div className="mx-5 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="text-xs text-orange-700">
              ⚠️ AVISO: Está editando información de la obra. Cualquier cambio afectará
              los registros existentes. Verifique cuidadosamente antes de guardar.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Fila 1: Nombre + Fecha inicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                Nombre de la Obra:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400"><DollarSign size={15} /></div>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Ayuntamiento Tultitlan"
                  required
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                Fecha de Inicio/fin:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400"><Calendar size={15} /></div>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  required
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Cliente + Fecha fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Cliente:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400"><User size={15} /></div>
                <input
                  type="text"
                  name="cliente"
                  value={form.cliente}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                  required
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Fecha estimada de fin:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400"><Calendar size={15} /></div>
                <input
                  type="date"
                  name="fecha_fin_estimada"
                  value={form.fecha_fin_estimada}
                  onChange={handleChange}
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fila 3: Ubicación + Retención */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Ubicación:</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400"><MapPin size={15} /></div>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Dirección de la obra"
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Aportación / Retención (%):
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400"><Percent size={15} /></div>
                <input
                  type="number"
                  name="porcentaje_retencion"
                  value={form.porcentaje_retencion}
                  onChange={handleChange}
                  min="0" max="100" step="0.01"
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Estado (solo edición) */}
          {esEdicion && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Estado:</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue bg-white"
              >
                <option value="ACTIVA">Activa</option>
                <option value="PAUSADA">Pausada</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          )}

          {/* Distribución del presupuesto */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Distribución del Presupuesto
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Materiales */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-blue-600">
                  Materiales (%):
                </label>
                <div className="flex items-center border border-blue-200 rounded-xl overflow-hidden focus-within:border-blue-500 bg-blue-50 transition-colors">
                  <div className="px-3 text-blue-400">🚧</div>
                  <input
                    type="number"
                    name="porcentaje_materiales"
                    value={form.porcentaje_materiales}
                    onChange={handleChange}
                    min="0" max="100" step="0.01"
                    placeholder="Porcentaje"
                    className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Nómina */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-green-600">
                  Nómina (%):
                </label>
                <div className="flex items-center border border-green-200 rounded-xl overflow-hidden focus-within:border-green-500 bg-green-50 transition-colors">
                  <div className="px-3 text-green-400">👷</div>
                  <input
                    type="number"
                    name="porcentaje_nomina"
                    value={form.porcentaje_nomina}
                    onChange={handleChange}
                    min="0" max="100" step="0.01"
                    placeholder="Porcentaje"
                    className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Herramienta */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-purple-600">
                  Herramienta (%):
                </label>
                <div className="flex items-center border border-purple-200 rounded-xl overflow-hidden focus-within:border-purple-500 bg-purple-50 transition-colors">
                  <div className="px-3 text-purple-400">🔧</div>
                  <input
                    type="number"
                    name="porcentaje_herramienta"
                    value={form.porcentaje_herramienta}
                    onChange={handleChange}
                    min="0" max="100" step="0.01"
                    placeholder="Porcentaje"
                    className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Indicador de suma */}
            <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${
              sumaCien ? 'text-green-600' : 'text-red-500'
            }`}>
              <span>{sumaCien ? '✓' : '✗'}</span>
              <span>
                Total: {sumaPorc.toFixed(2)}%
                {!sumaCien && ' — debe sumar exactamente 100%'}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={isPending}
              disabled={!sumaCien}
            >
              {esEdicion ? 'Actualizar Información' : '+ Crear Obra'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ObraForm;