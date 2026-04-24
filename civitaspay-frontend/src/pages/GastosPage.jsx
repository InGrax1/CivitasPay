    import { useState } from 'react';
    import { Calendar, Download, ShoppingCart, Trash2 } from 'lucide-react';
    import { useGastos, useResumenCategorias, useEliminarGasto } from '../hooks/useGastos';
    import useObraStore from '../store/obraStore';
    import useAuthStore from '../store/authStore';
    import GastoForm from '../components/gastos/GastoForm';
    import Badge from '../components/ui/Badge';
    import Spinner from '../components/ui/Spinner';
    import Button from '../components/ui/Button';
    import { formatCurrencyCompact } from '../utils/formatCurrency';

    const FILTROS = ['Todos', 'MATERIALES', 'NOMINA', 'HERRAMIENTA', 'Personal'];

    const colorCategoria = {
    MATERIALES:  'bg-blue-100 text-blue-700',
    NOMINA:      'bg-green-100 text-green-700',
    HERRAMIENTA: 'bg-orange-100 text-orange-700',
    Personal:    'bg-purple-100 text-purple-700',
    };

    function GastosPage() {
    const { obraSeleccionada } = useObraStore();
    const usuario = useAuthStore((s) => s.usuario);
    const esAdmin = usuario?.rol === 'ADMINISTRADOR';

    const [filtroActivo, setFiltroActivo] = useState('Todos');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [filtrosFecha, setFiltros] = useState({});
    const [mostrarFiltroFecha, setMostrarFiltroFecha] = useState(false);


    // Construir filtros para la query
    const filtros = {};
    if (filtroActivo === 'Personal') filtros.is_personal = true;
    else if (filtroActivo !== 'Todos') {
        // Buscar por tipo de categoría — filtramos en el frontend
    }

    const { data: gastos = [], isLoading } = useGastos(obraSeleccionada?.id,
    { ...filtros, ...filtrosFecha });
    const { data: resumen = [] } = useResumenCategorias(obraSeleccionada?.id);
    const eliminarGasto = useEliminarGasto(obraSeleccionada?.id);

    // Filtrar por categoría en el frontend
    const gastosFiltrados = gastos.filter((g) => {
        if (filtroActivo === 'Todos') return true;
        if (filtroActivo === 'Personal') return g.is_personal;
        return g.categoria_tipo === filtroActivo;
    });

    // Total del mes
    const totalGastado = resumen.reduce(
        (acc, cat) => acc + parseFloat(cat.total_gastado || 0), 0
    );

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
                Gastos y transacciones
            </h1>
            <p className="text-sm text-gray-400">
                Seguimiento presupuestario de materiales, mano de obra y herramientas
            </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
                {/* Selector de fechas */}
                <div className="relative">
                <button
                    onClick={() => setMostrarFiltroFecha(!mostrarFiltroFecha)}
                    className={[
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                    filtrosFecha.fecha_desde
                        ? 'bg-civitas-blue text-white border-civitas-blue'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                >
                    <Calendar size={14} />
                    <span>
                    {filtrosFecha.fecha_desde
                        ? `${filtrosFecha.fecha_desde} → ${filtrosFecha.fecha_hasta}`
                        : 'Filtrar por fecha'}
                    </span>
                </button>

                {mostrarFiltroFecha && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-50 w-72">
                    <p className="text-xs font-semibold text-gray-700 mb-3">Rango de fechas</p>

                    <div className="flex flex-col gap-3">
                        <div>
                        <label className="text-xs text-gray-500 mb-1 block">Desde</label>
                        <input
                            type="date"
                            value={filtrosFecha.fecha_desde ?? ''}
                            onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_desde: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-civitas-blue"
                        />
                        </div>
                        <div>
                        <label className="text-xs text-gray-500 mb-1 block">Hasta</label>
                        <input
                            type="date"
                            value={filtrosFecha.fecha_hasta ?? ''}
                            onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_hasta: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-civitas-blue"
                        />
                        </div>
                    </div>

                    {/* Accesos rápidos */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                        onClick={() => {
                            const hoy = new Date();
                            const hace30 = new Date();
                            hace30.setDate(hoy.getDate() - 30);
                            setFiltros({
                            fecha_desde: hace30.toISOString().split('T')[0],
                            fecha_hasta: hoy.toISOString().split('T')[0],
                            });
                            setMostrarFiltroFecha(false);
                        }}
                        className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        >
                        Últimos 30 días
                        </button>
                        <button
                        onClick={() => {
                            const hoy = new Date();
                            const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                            setFiltros({
                            fecha_desde: inicio.toISOString().split('T')[0],
                            fecha_hasta: hoy.toISOString().split('T')[0],
                            });
                            setMostrarFiltroFecha(false);
                        }}
                        className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        >
                        Este mes
                        </button>
                        <button
                        onClick={() => {
                            setFiltros({});
                            setMostrarFiltroFecha(false);
                        }}
                        className="px-2.5 py-1 text-xs bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                        >
                        Limpiar
                        </button>
                    </div>

                    <button
                        onClick={() => setMostrarFiltroFecha(false)}
                        className="w-full mt-3 py-2 bg-civitas-blue text-white rounded-xl text-xs font-medium hover:bg-civitas-blue-dark transition-colors"
                    >
                        Aplicar
                    </button>
                    </div>
                )}
                </div>

            {/* ── Boton exportar  ─────────────────────────── */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14} />
                <span>Exportar</span>
            </button>
            <Button
                icon={ShoppingCart}
                size="sm"
                onClick={() => setModalAbierto(true)}
            >
                Registrar gastos
            </Button>
            </div>
        </div>

        {/* ── Contenido principal ─────────────────────────── */}
        <div className="flex flex-col xl:flex-row gap-4">

            {/* Tabla de gastos */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Filtros por categoría */}
            <div className="flex flex-wrap gap-2">
                {FILTROS.map((filtro) => (
                <button
                    key={filtro}
                    onClick={() => setFiltroActivo(filtro)}
                    className={[
                    'px-4 py-1.5 rounded-full text-xs font-medium transition-colors',
                    filtroActivo === filtro
                        ? 'bg-civitas-blue text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                >
                    {filtro}
                </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner text="Cargando gastos..." />
                </div>
                ) : gastosFiltrados.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-gray-400 text-sm">No hay gastos registrados</p>
                    <button
                    onClick={() => setModalAbierto(true)}
                    className="mt-2 text-civitas-blue text-sm font-medium hover:underline"
                    >
                    Registrar primer gasto →
                    </button>
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Concepto/Descripción</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Categoría</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Usuario</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Monto</th>
                        {esAdmin && (
                            <th className="px-4 py-3 text-xs font-medium text-gray-500" />
                        )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {gastosFiltrados.map((gasto) => (
                        <tr key={gasto.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(gasto.fecha_gasto).toLocaleDateString('es-MX')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
                            <p className="truncate">{gasto.concepto}</p>
                            {gasto.proveedor && (
                                <p className="text-xs text-gray-400 truncate">{gasto.proveedor}</p>
                            )}
                            </td>
                            <td className="px-4 py-3">
                            <span className={[
                                'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                                gasto.is_personal
                                ? colorCategoria['Personal']
                                : colorCategoria[gasto.categoria_tipo] ?? 'bg-gray-100 text-gray-600',
                            ].join(' ')}>
                                {gasto.is_personal ? 'Personal' : gasto.categoria_nombre}
                            </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                            Admin
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                            ${parseFloat(gasto.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </td>
                            {esAdmin && (
                            <td className="px-4 py-3">
                                <button
                                onClick={() => eliminarGasto.mutate(gasto.id)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                <Trash2 size={14} />
                                </button>
                            </td>
                            )}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            </div>

            {/* Panel lateral — Sumatoria Mensual */}
            <div className="xl:w-64 flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Sumatoria Mensual</p>
                <p className="text-xs text-gray-400 mb-3">Resumen general</p>

                <div className="mb-4">
                <p className="text-xs text-gray-500">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">
                    {formatCurrencyCompact(totalGastado)}
                </p>
                </div>

                <p className="text-xs font-medium text-gray-600 mb-2">
                Desglose por categoría
                </p>

                <div className="flex flex-col gap-2">
                {resumen.map((cat) => (
                    <div key={cat.categoria_id}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{cat.categoria_nombre}</span>
                        <span className="font-medium text-gray-800">
                        {formatCurrencyCompact(cat.total_gastado)}
                        </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                        className={[
                            'h-full rounded-full',
                            cat.categoria_tipo === 'MATERIALES'  ? 'bg-blue-400' :
                            cat.categoria_tipo === 'NOMINA'      ? 'bg-green-400' :
                            cat.categoria_tipo === 'HERRAMIENTA' ? 'bg-orange-400' :
                            'bg-gray-400',
                        ].join(' ')}
                        style={{
                            width: totalGastado > 0
                            ? `${(parseFloat(cat.total_gastado) / totalGastado) * 100}%`
                            : '0%',
                        }}
                        />
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>

        {/* Modal de registro */}
        {modalAbierto && (
            <GastoForm
            obraId={obraSeleccionada.id}
            onClose={() => setModalAbierto(false)}
            />
        )}
        </div>
    );
    }

    export default GastosPage;