import { useState } from 'react';
import { X, DollarSign, Calendar, Hash, User } from 'lucide-react';
import { useCrearEstimacion } from '../../hooks/useEstimaciones';
import useObraStore from '../../store/obraStore';
import Button from '../ui/Button';

// Calcula los montos en tiempo real — igual que el backend
function calcularMotor(montoBruto, obra) {
  if (!montoBruto || !obra) return null;
  const bruto = parseFloat(montoBruto);
  if (isNaN(bruto) || bruto <= 0) return null;

  const base      = bruto / 1.16;
  const iva       = bruto - base;
  const retencion = base * (parseFloat(obra.porcentaje_retencion) / 100);
  const costo     = base - retencion;

  return {
    base:        base.toFixed(2),
    iva:         iva.toFixed(2),
    retencion:   retencion.toFixed(2),
    costo:       costo.toFixed(2),
    materiales:  (costo * parseFloat(obra.porcentaje_materiales) / 100).toFixed(2),
    nomina:      (costo * parseFloat(obra.porcentaje_nomina) / 100).toFixed(2),
    herramienta: (costo * parseFloat(obra.porcentaje_herramienta) / 100).toFixed(2),
  };
}

const fmt = (n) => parseFloat(n).toLocaleString('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 2,
});

function EstimacionForm({ obraId, onClose }) {
  const { obraSeleccionada } = useObraStore();

  const [form, setForm] = useState({
    monto_bruto:       '',
    fecha_estimacion:  new Date().toISOString().split('T')[0],
    periodo:           '',
    proveedor:         '',
  });

  const crearEstimacion = useCrearEstimacion(obraId);
  const motor = calcularMotor(form.monto_bruto, obraSeleccionada);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearEstimacion.mutateAsync({
      ...form,
      monto_bruto: parseFloat(form.monto_bruto),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Registrar Estimación</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ingresa los datos para registrar una nueva estimación
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Fila 1: Monto + Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Monto Bruto */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                Monto Bruto:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400">
                  <DollarSign size={15} />
                </div>
                <input
                  type="number"
                  name="monto_bruto"
                  value={form.monto_bruto}
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
                  name="fecha_estimacion"
                  value={form.fecha_estimacion}
                  onChange={handleChange}
                  required
                  className="flex-1 py-2.5 pr-3 text-sm text-gray-700 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Período + Proveedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Período:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
                <div className="px-3 text-gray-400">
                  <Hash size={15} />
                </div>
                <input
                  type="text"
                  name="periodo"
                  value={form.periodo}
                  onChange={handleChange}
                  placeholder="Ej: Abril 2026"
                  className="flex-1 py-2.5 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
              </div>
            </div>

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
          </div>

          {/* Motor Financiero Preview */}
          {motor && (
            <div className="bg-civitas-blue-pale border border-civitas-blue/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-civitas-blue mb-3">
                Desglose automático
              </p>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Monto Base (sin IVA)</span>
                  <span className="font-medium">{fmt(motor.base)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (16%)</span>
                  <span className="font-medium text-red-500">- {fmt(motor.iva)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Retención ({obraSeleccionada?.porcentaje_retencion}%)</span>
                  <span className="font-medium text-red-500">- {fmt(motor.retencion)}</span>
                </div>
                <div className="h-px bg-civitas-blue/20 my-1" />
                <div className="flex justify-between font-semibold text-civitas-blue">
                  <span>Costo Directo</span>
                  <span>{fmt(motor.costo)}</span>
                </div>
                <div className="h-px bg-civitas-blue/20 my-1" />
                <div className="flex justify-between text-gray-500">
                  <span>→ Materiales ({obraSeleccionada?.porcentaje_materiales}%)</span>
                  <span>{fmt(motor.materiales)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>→ Nómina ({obraSeleccionada?.porcentaje_nomina}%)</span>
                  <span>{fmt(motor.nomina)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>→ Herramienta ({obraSeleccionada?.porcentaje_herramienta}%)</span>
                  <span>{fmt(motor.herramienta)}</span>
                </div>
              </div>
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
              loading={crearEstimacion.isPending}
            >
              Registrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EstimacionForm;