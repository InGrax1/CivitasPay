import { Settings, ShoppingCart, FileText } from 'lucide-react';
import { useObraDashboard } from '../hooks/useObras';
import useObraStore from '../store/obraStore';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { formatCurrencyCompact } from '../utils/formatCurrency';
import ObraForm from '../components/obras/ObraForm';
import { useState } from 'react';
import { useFondoGarantia } from '../hooks/useFondoGarantia';


import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

function ObrasPage() {
  const { obraSeleccionada } = useObraStore();
  const { data: dashboard, isLoading } = useObraDashboard(obraSeleccionada?.id);
  const [modalEditar, setModalEditar] = useState(false);
  const { data: fondo } = useFondoGarantia(obraSeleccionada?.id);


  if (!obraSeleccionada) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-400 text-sm">Selecciona una obra del menú superior</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner text="Cargando datos de la obra..." />
      </div>
    );
  }

  const rf = dashboard?.resumen_financiero ?? {};
  const ind = dashboard?.indicadores ?? {};
  const alertas = dashboard?.balance_categorias?.filter(
    (c) => c.saldo_disponible < 0
  ) ?? [];

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Panel de control de la Obra
          </h1>
          <p className="text-sm text-gray-400">{obraSeleccionada.nombre}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-civitas-blue text-white hover:bg-civitas-blue-dark transition-colors">
            <ShoppingCart size={14} />
            <span>Registrar gastos</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <FileText size={14} />
            <span>Registrar Estimaciones</span>
          </button>
          <button
            onClick={() => setModalEditar(true)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Costo del Contrato</p>
          <p className="text-xl font-bold text-civitas-blue mt-1">
            {formatCurrencyCompact(rf.total_facturado)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            IVA: {formatCurrencyCompact(rf.total_iva)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Costo Directo</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {formatCurrencyCompact(rf.total_costo_directo)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Estimaciones Cobradas</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {formatCurrencyCompact(rf.total_cobrado)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {ind.estimaciones_por_estado?.cobradas ?? 0} estimaciones
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Gastado</p>
          <p className="text-xl font-bold text-orange-500 mt-1">
            {formatCurrencyCompact(rf.total_gastado)}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Presupuesto gastado</span>
              <span>{ind.porcentaje_ejecucion ?? 0}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full"
                style={{ width: `${Math.min(ind.porcentaje_ejecucion ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido principal ─────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Columna izquierda */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Gráfica distribución de costos */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Distribución de costos
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={dashboard?.actividad_reciente?.ultimos_gastos?.map((g, i) => ({
                  name: `G${i + 1}`,
                  Monto: parseFloat(g.monto),
                })) ?? []}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Monto" stroke="#5B7FE8" strokeWidth={2} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de estimaciones recientes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText size={15} className="text-civitas-blue" />
              Estimaciones
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-medium">Fecha</th>
                    <th className="text-left pb-2 font-medium">Descripción</th>
                    <th className="text-left pb-2 font-medium">Monto</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dashboard?.actividad_reciente?.ultimas_estimaciones?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">
                        Sin estimaciones registradas
                      </td>
                    </tr>
                  ) : (
                    dashboard?.actividad_reciente?.ultimas_estimaciones?.map((e) => (
                      <tr key={e.id}>
                        <td className="py-2 text-gray-500">
                          {new Date(e.fecha_estimacion).toLocaleDateString('es-MX')}
                        </td>
                        <td className="py-2 text-gray-700 max-w-[160px] truncate">
                          {e.periodo ?? `Estimación #${e.numero_estimacion}`}
                        </td>
                        <td className="py-2 font-medium text-green-600">
                          +{formatCurrencyCompact(e.monto_bruto)}
                        </td>
                        <td className="py-2">
                          <Badge estado={e.estado} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="xl:w-72 flex flex-col gap-4">

          {/* Alertas */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-yellow-600 mb-3 flex items-center gap-1.5">
              ⚠️ Alertas
            </p>
            {alertas.length === 0 ? (
              <p className="text-xs text-gray-400">Sin alertas activas</p>
            ) : (
              <div className="flex flex-col gap-2">
                {alertas.map((cat) => (
                  <div key={cat.categoria_id} className="bg-red-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-600">
                      🔴 {cat.nombre} Excedido
                    </p>
                    <p className="text-xs text-red-400 mt-0.5">
                      Saldo: {formatCurrencyCompact(cat.saldo_disponible)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transacciones recientes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              🔄 Transacciones Recientes
            </p>
            <div className="flex flex-col gap-2">
              {dashboard?.actividad_reciente?.ultimos_gastos?.length === 0 ? (
                <p className="text-xs text-gray-400">Sin transacciones</p>
              ) : (
                dashboard?.actividad_reciente?.ultimos_gastos?.map((g) => (
                  <div key={g.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {g.concepto}
                      </p>
                      <p className="text-xs text-gray-400">{g.categoria_nombre}</p>
                    </div>
                    <p className="text-xs font-semibold text-orange-500 ml-2 flex-shrink-0">
                      {formatCurrencyCompact(g.monto)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ubicación y Residente */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">📍 Ubicación</p>
              <p className="text-xs text-gray-700">
                {obraSeleccionada.direccion ?? 'Sin dirección registrada'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">👷 Residente de Obra</p>
              <p className="text-xs font-medium text-gray-700">
                {obraSeleccionada.residente_id ?? 'Sin residente asignado'}
              </p>
            </div>
          </div>

          {/* Fondo de Garantía */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              🔒 Fondo de Garantía
            </p>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Saldo Acumulado</p>
                <p className="text-lg font-bold text-civitas-blue">
                  {formatCurrencyCompact(fondo?.fondo?.saldo_acumulado ?? 0)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">% Retención</p>
                <p className="text-xs font-medium text-gray-600">
                  {fondo?.fondo?.porcentaje_retencion ?? 0}%
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Estimaciones aprobadas</p>
                <p className="text-xs font-medium text-gray-600">
                  {fondo?.resumen?.total_estimaciones_aprobadas ?? 0}
                </p>
              </div>

              <div className="h-px bg-gray-100 my-1" />

              <div className="bg-civitas-blue-pale rounded-xl p-2.5">
                <p className="text-xs text-civitas-blue text-center">
                  💡 Solo lectura — liberación disponible en Fase 2
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      {modalEditar && (
        <ObraForm
        obra={obraSeleccionada}
        onClose={() => setModalEditar(false)}
        />)}
    </div>
  );
}

export default ObrasPage;