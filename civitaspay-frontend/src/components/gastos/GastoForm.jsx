import { useState } from 'react';
import { X, DollarSign, User, FileText, Calendar } from 'lucide-react';
import { useCrearGasto } from '../../hooks/useGastos';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios.config';
import Button from '../ui/Button';

function GastoForm({ obraId, onClose, personalPorDefecto = false }) {
  const [form, setForm] = useState({
    categoria_id: '',
    monto: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    proveedor: '',
    concepto: '',
    is_personal: personalPorDefecto,
  });

  const crearGasto = useCrearGasto(obraId);

  // Cargar categorías de la obra
  const { data: categorias = [] } = useQuery({
    queryKey: ['obras', obraId, 'categorias'],
    queryFn: async () => {
      const res = await api.get(`/obras/${obraId}/gastos/resumen/categorias`);
      return res.data.resumen;
    },
    enabled: !!obraId,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearGasto.mutateAsync({
      ...form,
      monto: parseFloat(form.monto),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Registrar Gasto</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ingresa los datos para registrar un nuevo gasto de la obra
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Fila 1: Categoría, Monto, Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Categoría */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                Categoría:
              </label>
              <select
                name="categoria_id"
                value={form.categoria_id}
                onChange={handleChange}
                required
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-civitas-blue transition-colors bg-white"
              >
                <option value="">Seleccionar...</option>
                {categorias.map((cat) => (
                  <option key={cat.categoria_id} value={cat.categoria_id}>
                    {cat.categoria_nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                Monto:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400">
                  <DollarSign size={15} />
                </div>
                <input
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="flex-1 py-2.5 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                Fecha:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400">
                  <Calendar size={15} />
                </div>
                <input
                  type="date"
                  name="fecha_gasto"
                  value={form.fecha_gasto}
                  onChange={handleChange}
                  required
                  className="flex-1 py-2.5 pr-3 text-sm text-gray-700 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Proveedor + Toggle Gasto Personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Proveedor */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Proveedor/Vendedor:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  name="proveedor"
                  value={form.proveedor}
                  onChange={handleChange}
                  placeholder="Nombre del proveedor"
                  className="flex-1 py-2.5 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Toggle Gasto Personal */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Tipo de gasto:
              </label>
              <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_personal ? 'bg-civitas-blue' : 'bg-gray-200'}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_personal ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </div>
                <input
                  type="checkbox"
                  name="is_personal"
                  checked={form.is_personal}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-700">Gasto Personal</span>
              </label>
            </div>
          </div>

          {/* Concepto */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Concepto/Descripción:
            </label>
            <div className="flex items-start border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
              <div className="px-3 pt-2.5 text-gray-400">
                <FileText size={15} />
              </div>
              <textarea
                name="concepto"
                value={form.concepto}
                onChange={handleChange}
                placeholder="Descripción del gasto..."
                required
                rows={3}
                className="flex-1 py-2.5 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent resize-none"
              />
            </div>
          </div>

          {/* Advertencia si es gasto personal */}
          {form.is_personal && (
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <p className="text-xs text-yellow-700">
                Este gasto se marcará como personal. Restará del saldo de la categoría para cuadrar la caja, pero no afectará las estadísticas de costo de la obra.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={crearGasto.isPending}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GastoForm;