import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ShoppingCart, FileText, FilePlus,
  Building2, DollarSign, TrendingUp, CheckCircle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../api/axios.config';
import StatCard from '../components/ui/StatCard';
import ObraCard from '../components/obras/ObraCard';
import Spinner from '../components/ui/Spinner';
import { formatCurrencyCompact } from '../utils/formatCurrency';
import useObraStore from '../store/obraStore';

// ── Colores para el donut chart ───────────────────────────
const COLORES_PIE = ['#5B7FE8', '#2DC653', '#F5A623', '#A78BFA'];

// ── Datos de ejemplo para las gráficas ───────────────────
// Se reemplazarán con datos reales cuando construyamos el módulo de reportes
const datosLinea = [
  { dia: 'Lun', Materiales: 80000, 'Mano de Obra': 40000, Herramienta: 20000 },
  { dia: 'Mar', Materiales: 120000, 'Mano de Obra': 60000, Herramienta: 35000 },
  { dia: 'Mie', Materiales: 95000, 'Mano de Obra': 55000, Herramienta: 28000 },
  { dia: 'Jue', Materiales: 180000, 'Mano de Obra': 90000, Herramienta: 45000 },
  { dia: 'Vie', Materiales: 140000, 'Mano de Obra': 70000, Herramienta: 38000 },
  { dia: 'Sab', Materiales: 60000, 'Mano de Obra': 30000, Herramienta: 15000 },
  { dia: 'Dom', Materiales: 20000, 'Mano de Obra': 10000, Herramienta: 5000 },
];

const datosPie = [
  { nombre: 'Materiales',   valor: 45 },
  { nombre: 'Mano de Obra', valor: 30 },
  { nombre: 'Herramienta',  valor: 15 },
  { nombre: 'Otros',        valor: 10 },
];

function DashboardPage() {
  const navigate   = useNavigate();
  const seleccionarObra = useObraStore((s) => s.seleccionarObra);

  // Cargar obras desde el backend
  const { data: obras = [], isLoading } = useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const res = await api.get('/obras');
      return res.data.obras;
    },
  });

  // KPIs calculados desde las obras
  const obrasActivas      = obras.filter((o) => o.estado === 'ACTIVA').length;
  const presupuestoTotal  = obras.reduce((acc, o) => acc + parseFloat(o.monto_bruto || 0), 0);

  // ── Botones de acción rápida ──────────────────────────────
  const acciones = [
    { label: 'Nueva Obra',          icono: Plus,        color: 'bg-civitas-blue text-white',          onClick: () => navigate('/obras') },
    { label: 'Registrar Gasto',     icono: ShoppingCart, color: 'bg-green-500 text-white',            onClick: () => navigate('/gastos') },
    { label: 'Registrar Estimación',icono: FileText,    color: 'bg-purple-500 text-white',            onClick: () => navigate('/estimaciones') },
    { label: 'Nuevo Contrato',      icono: FilePlus,    color: 'bg-orange-500 text-white',            onClick: () => navigate('/contratos') },
  ];

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400">Resumen general del control de gastos</p>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex flex-wrap gap-2">
          {acciones.map((accion) => (
            <button
              key={accion.label}
              onClick={accion.onClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-90 ${accion.color}`}
            >
              <accion.icono size={14} />
              <span className="hidden sm:inline">{accion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          titulo="Obras Activas"
          valor={obrasActivas}
          icono={Building2}
          colorValor="text-civitas-blue"
        />
        <StatCard
          titulo="Presupuesto Total"
          valor={formatCurrencyCompact(presupuestoTotal)}
          icono={DollarSign}
          colorValor="text-purple-600"
        />
        <StatCard
          titulo="Total Gastado"
          valor="$6.8M"
          icono={TrendingUp}
          colorValor="text-orange-500"
        />
        <StatCard
          titulo="Estimaciones Cobradas"
          valor="24"
          icono={CheckCircle}
          colorValor="text-green-600"
        />
      </div>

      {/* ── Proyectos + Gráficas ────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Grid de obras */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>Proyectos Activos</span>
            <span className="bg-civitas-blue-pale text-civitas-blue text-xs px-2 py-0.5 rounded-full">
              {obrasActivas}
            </span>
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner text="Cargando obras..." />
            </div>
          ) : obras.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">No hay obras registradas.</p>
              <button
                onClick={() => navigate('/obras')}
                className="mt-3 text-civitas-blue text-sm font-medium hover:underline"
              >
                Crear primera obra →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {obras.map((obra) => (
                <ObraCard key={obra.id} obra={obra} />
              ))}
            </div>
          )}
        </div>

        {/* Gráficas */}
        <div className="xl:w-80 flex flex-col gap-4">

          {/* Gráfica de líneas */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              Distribución de gastos generales
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={datosLinea} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v) => [`$${(v/1000).toFixed(0)}k`]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Materiales"   stroke="#5B7FE8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Mano de Obra" stroke="#2DC653" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Herramienta"  stroke="#F5A623" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              Distribución por categoría
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={datosPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="valor"
                >
                  {datosPie.map((_, i) => (
                    <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none' }}
                  formatter={(v) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;