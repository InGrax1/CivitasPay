import { useState } from 'react';
import { FileText, Download, Trash2, ChevronRight } from 'lucide-react';
import { useEstimaciones, useCambiarEstadoEstimacion, useEliminarEstimacion } from '../hooks/useEstimaciones';
import useObraStore from '../store/obraStore';
import useAuthStore from '../store/authStore';
import EstimacionForm from '../components/estimaciones/EstimacionForm';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatCurrencyCompact } from '../utils/formatCurrency';

// Transiciones permitidas por estado
const TRANSICIONES = {
  BORRADOR:    { label: 'Enviar a Revisión', siguiente: 'EN_REVISION' },
  EN_REVISION: { label: 'Aprobar',           siguiente: 'APROBADA' },
  APROBADA:    { label: 'Marcar Cobrada',    siguiente: 'COBRADA' },
  COBRADA:     null,
};

const colorEstado = {
  BORRADOR:    'bg-gray-100 text-gray-600',
  EN_REVISION: 'bg-yellow-100 text-yellow-700',
  APROBADA:    'bg-blue-100 text-blue-700',
  COBRADA:     'bg-green-100 text-green-700',
};

function EstimacionesPage() {
  const { obraSeleccionada } = useObraStore();
  const usuario  = useAuthStore((s) => s.usuario);
  const esAdmin  = usuario?.rol === 'ADMINISTRADOR';

  const [modalAbierto, setModalAbierto] = useState(false);

  const { data: estimaciones = [], isLoading } = useEstimaciones(obraSeleccionada?.id);
  const cambiarEstado   = useCambiarEstadoEstimacion(obraSeleccionada?.id);
  const eliminarEstimacion = useEliminarEstimacion(obraSeleccionada?.id);

  // KPIs
  const totalRecaudado = estimaciones
    .filter((e) => e.estado === 'COBRADA')
    .reduce((acc, e) => acc + parseFloat(e.monto_bruto || 0), 0);

  const saldoPendiente = estimaciones
    .filter((e) => e.estado === 'APROBADA')
    .reduce((acc, e) => acc + parseFloat(e.monto_bruto || 0), 0);

  if (!obraSeleccionada) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Selecciona una obra del menú superior</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Estimaciones y anticipos
          </h1>
          <p className="text-sm text-gray-400">
            Seguimiento de estimaciones y/o anticipos cobrados
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} />
            <span>Exportar</span>
          </button>
          <Button
            icon={FileText}
            size="sm"
            onClick={() => setModalAbierto(true)}
          >
            Registrar Estimación
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
              <FileText size={16} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Ingresos Totales Recaudados</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {formatCurrencyCompact(totalRecaudado)}
          </p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            ↑ {estimaciones.filter((e) => e.estado === 'COBRADA').length} estimaciones cobradas
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center">
              <FileText size={16} className="text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500">Saldo Pendiente</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {formatCurrencyCompact(saldoPendiente)}
          </p>
          {saldoPendiente > 0 && (
            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
              ⚠️ Requiere Atención
            </p>
          )}
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Cargando estimaciones..." />
          </div>
        ) : estimaciones.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">No hay estimaciones registradas</p>
            <button
              onClick={() => setModalAbierto(true)}
              className="mt-2 text-civitas-blue text-sm font-medium hover:underline"
            >
              Registrar primera estimación →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Concepto</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Monto</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Acción</th>
                  {esAdmin && (
                    <th className="px-4 py-3 text-xs font-medium text-gray-500" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {estimaciones.map((est) => {
                  const transicion = TRANSICIONES[est.estado];
                  return (
                    <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">
                        #{est.numero_estimacion}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(est.fecha_estimacion).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px]">
                        <p className="truncate">
                          {est.periodo ?? `Estimación #${est.numero_estimacion}`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colorEstado[est.estado]}`}>
                          {est.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                        +{formatCurrencyCompact(est.monto_bruto)}
                      </td>
                      <td className="px-4 py-3">
                        {transicion && (
                          <button
                            onClick={() => cambiarEstado.mutate({
                              id: est.id,
                              estado: transicion.siguiente,
                            })}
                            disabled={cambiarEstado.isPending}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-civitas-blue-pale text-civitas-blue hover:bg-civitas-blue hover:text-white transition-colors"
                          >
                            {transicion.label}
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </td>
                      {esAdmin && (
                        <td className="px-4 py-3">
                          {est.estado === 'BORRADOR' && (
                            <button
                              onClick={() => eliminarEstimacion.mutate(est.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <EstimacionForm
          obraId={obraSeleccionada.id}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}

export default EstimacionesPage;