import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useGastos, useResumenCategorias } from '../hooks/useGastos';
import useObraStore from '../store/obraStore';
import GastoForm from '../components/gastos/GastoForm';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatCurrencyCompact } from '../utils/formatCurrency';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORES = ['#5B7FE8', '#2DC653', '#F5A623', '#A78BFA', '#E74C3C'];

function GastoPersonalPage() {
  const { obraSeleccionada } = useObraStore();
  const [modalAbierto, setModalAbierto] = useState(false);

  // Filtra solo gastos personales
  const { data: gastos = [], isLoading } = useGastos(
    obraSeleccionada?.id,
    { is_personal: true }
  );

  // Para el donut chart — agrupa por categoría
  const distribucion = gastos.reduce((acc, g) => {
    const nombre = g.categoria_nombre ?? 'Sin categoría';
    const existente = acc.find((a) => a.nombre === nombre);
    if (existente) {
      existente.valor += parseFloat(g.monto);
    } else {
      acc.push({ nombre, valor: parseFloat(g.monto) });
    }
    return acc;
  }, []);

  const totalGastado = gastos.reduce(
    (acc, g) => acc + parseFloat(g.monto), 0
  );

  const totalMes = gastos
    .filter((g) => {
      const fecha = new Date(g.fecha_gasto);
      const ahora = new Date();
      return fecha.getMonth() === ahora.getMonth() &&
             fecha.getFullYear() === ahora.getFullYear();
    })
    .reduce((acc, g) => acc + parseFloat(g.monto), 0);

  // Categoría con más gastos
  const categoriaMasGastos = distribucion.sort((a, b) => b.valor - a.valor)[0];

  if (!obraSeleccionada) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Selecciona una obra del menú superior</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Gasto Personal
          </h1>
          <p className="text-sm text-gray-400">
            Shadow expenses — gastos personales pagados con fondos de la obra
          </p>
        </div>
        <Button
          icon={ShoppingBag}
          size="sm"
          onClick={() => setModalAbierto(true)}
        >
          Registrar gastos
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Total Gastado</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrencyCompact(totalGastado)}
          </p>
          <p className="text-xs text-green-600 mt-1">↑ +12% vs el último mes</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Total Mensual Gastado</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrencyCompact(totalMes)}
          </p>
          <p className="text-xs text-green-600 mt-1">↑ Este mes</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Categoría con más gastos</p>
          {categoriaMasGastos ? (
            <>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">🍽️</span>
                <p className="text-lg font-bold text-orange-500">
                  {categoriaMasGastos.nombre}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrencyCompact(categoriaMasGastos.valor)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Sin datos</p>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Tabla */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner text="Cargando gastos personales..." />
            </div>
          ) : gastos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">No hay gastos personales registrados</p>
              <button
                onClick={() => setModalAbierto(true)}
                className="mt-2 text-civitas-blue text-sm font-medium hover:underline"
              >
                Registrar primer gasto personal →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Categoría</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tienda</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Descripción</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {gastos.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(g.fecha_gasto).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {g.categoria_nombre ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {g.proveedor ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px]">
                        <p className="truncate">{g.concepto}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                        ${parseFloat(g.monto).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div className="xl:w-72 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Distribución por categoría
          </p>

          {distribucion.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs text-gray-400">Sin datos</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={distribucion}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="valor"
                    nameKey="nombre"
                  >
                    {distribucion.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none' }}
                    formatter={(v) => [formatCurrencyCompact(v)]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Leyenda manual */}
              <div className="flex flex-col gap-2 mt-2">
                {distribucion.map((cat, i) => (
                  <div key={cat.nombre} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: COLORES[i % COLORES.length] }}
                      />
                      <span className="text-xs text-gray-600">{cat.nombre}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {formatCurrencyCompact(cat.valor)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-xs font-semibold text-gray-700">Total</span>
                  <span className="text-xs font-bold text-gray-800">
                    {formatCurrencyCompact(totalGastado)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <GastoForm
          obraId={obraSeleccionada.id}
          onClose={() => setModalAbierto(false)}
          personalPorDefecto={true}
        />
      )}
    </div>
  );
}

export default GastoPersonalPage;