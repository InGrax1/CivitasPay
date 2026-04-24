import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, RefreshCw } from 'lucide-react';
import { useCajas, useCaja, useReponer, useGastoCaja, useCrearCaja } from '../hooks/useCajaChica';
import useObraStore from '../store/obraStore';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatCurrencyCompact } from '../utils/formatCurrency';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// Gauge semicircular
function Gauge({ porcentaje }) {
  const p = Math.min(porcentaje, 100);
  const color = p > 90 ? '#E74C3C' : p > 70 ? '#F5A623' : '#2DC653';
  const angulo = (p / 100) * 180;
  const rad = (angulo - 90) * (Math.PI / 180);
  const x = 60 + 50 * Math.cos(rad);
  const y = 60 + 50 * Math.sin(rad);

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 120 70">
        {/* Fondo gris */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round"
        />
        {/* Progreso */}
        {p > 0 && (
          <path
            d={`M 10 60 A 50 50 0 ${angulo > 90 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          />
        )}
        {/* Texto */}
        <text x="60" y="58" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>
          {p.toFixed(0)}%
        </text>
        <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#9CA3AF">
          Activo
        </text>
      </svg>
      <p className="text-xs text-gray-400 text-center mt-1 max-w-[140px]">
        {p < 70
          ? 'El uso de la caja se encuentra dentro de los límites operativos.'
          : p < 90
          ? 'El uso de la caja está cerca del límite.'
          : 'La caja está por agotarse. Reponer fondos.'}
      </p>
    </div>
  );
}

// Modal de reposición rápida
function ModalReposicion({ obraId, cajaId, onClose }) {
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('Reposición de fondos');
  const reponer = useReponer(obraId, cajaId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await reponer.mutateAsync({ monto: parseFloat(monto), concepto });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <h3 className="font-bold text-gray-800 mb-4">Reponer Fondos</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Monto a reponer</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
              <div className="px-3 text-gray-400"><DollarSign size={15} /></div>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Concepto</label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              required
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={reponer.isPending}>
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de gasto de caja
function ModalGasto({ obraId, cajaId, onClose }) {
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const gastoCaja = useGastoCaja(obraId, cajaId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await gastoCaja.mutateAsync({ monto: parseFloat(monto), concepto });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <h3 className="font-bold text-gray-800 mb-4">Registrar Gasto de Caja</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Monto</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
              <div className="px-3 text-gray-400"><DollarSign size={15} /></div>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                required min="0" step="0.01"
                className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Concepto</label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Descripción del gasto"
              required
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={gastoCaja.isPending}>
              Registrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CajaChicaPage() {
  const { obraSeleccionada } = useObraStore();
  const usuario = useAuthStore((s) => s.usuario);
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';

  const [cajaActivaId, setCajaActivaId] = useState(null);
  const [modalReponer, setModalReponer] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [nombreNuevaCaja, setNombreNuevaCaja] = useState('');
  const [limiteNuevaCaja, setLimiteNuevaCaja] = useState('');

  const { data: cajas = [], isLoading } = useCajas(obraSeleccionada?.id);
  const cajaActiva = cajas.find((c) => c.id === cajaActivaId) ?? cajas[0];

  const { data: detalle } = useCaja(obraSeleccionada?.id, cajaActiva?.id);
  const crearCaja = useCrearCaja(obraSeleccionada?.id);

  // Datos para la gráfica de flujo
  const movimientos = detalle?.movimientos ?? [];
  const datosGrafica = movimientos.slice(0, 7).reverse().map((m, i) => ({
    dia: `M${i + 1}`,
    Entrada: m.tipo === 'REPOSICION' ? parseFloat(m.monto) : 0,
    Salida:  m.tipo === 'GASTO'      ? Math.abs(parseFloat(m.monto)) : 0,
  }));

  // Porcentaje de uso
  const porcentajeUso = cajaActiva
    ? (parseFloat(cajaActiva.saldo_actual) / parseFloat(cajaActiva.limite_maximo)) * 100
    : 0;

  // Entrada y salida del mes
  const entradaMes = movimientos
    .filter((m) => m.tipo === 'REPOSICION')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);
  const salidaMes = movimientos
    .filter((m) => m.tipo === 'GASTO')
    .reduce((acc, m) => acc + Math.abs(parseFloat(m.monto)), 0);

  if (!obraSeleccionada) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Selecciona una obra del menú superior</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner text="Cargando caja chica..." /></div>;
  }

  if (cajas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400 text-sm">No hay caja chica registrada para esta obra</p>
        {esAdmin && (
          <Button icon={Plus} onClick={() => setModalCrear(true)}>
            Crear Caja Chica
          </Button>
        )}
        {modalCrear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
              <h3 className="font-bold text-gray-800 mb-4">Nueva Caja Chica</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await crearCaja.mutateAsync({
                    nombre: nombreNuevaCaja,
                    limite_maximo: parseFloat(limiteNuevaCaja),
                  });
                  setModalCrear(false);
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Nombre</label>
                  <input
                    type="text"
                    value={nombreNuevaCaja}
                    onChange={(e) => setNombreNuevaCaja(e.target.value)}
                    placeholder="Caja Chica Principal"
                    required
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Límite Máximo</label>
                  <input
                    type="number"
                    value={limiteNuevaCaja}
                    onChange={(e) => setLimiteNuevaCaja(e.target.value)}
                    placeholder="5000"
                    required min="0"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="secondary" type="button" onClick={() => setModalCrear(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" loading={crearCaja.isPending}>
                    Crear
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Caja Chica</h1>
          <p className="text-sm text-gray-400">{cajaActiva?.nombre}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={() => setModalReponer(true)}
          >
            Reponer
          </Button>
          <Button
            icon={DollarSign}
            size="sm"
            onClick={() => setModalGasto(true)}
          >
            Registrar Gasto
          </Button>
        </div>
      </div>

      {/* KPI principal */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-500 text-sm">🏦 Liquidez Total</span>
        </div>
        <p className="text-4xl font-bold text-gray-800">
          {formatCurrencyCompact(cajaActiva?.saldo_actual ?? 0)}
        </p>
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-xs text-gray-400">Entrada Mensual</p>
            <p className="text-sm font-semibold text-green-600">
              +{formatCurrencyCompact(entradaMes)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Salida Mensual</p>
            <p className="text-sm font-semibold text-red-500">
              -{formatCurrencyCompact(salidaMes)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Límite Máximo</p>
            <p className="text-sm font-semibold text-gray-600">
              {formatCurrencyCompact(cajaActiva?.limite_maximo ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Gráfica + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfica de flujo */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Tendencia del Flujo de Caja
          </p>
          {datosGrafica.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-400 text-xs">Sin movimientos para mostrar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={datosGrafica} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="Entrada" stroke="#2DC653" fill="#2DC653" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="Salida"  stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gauge */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
          <Gauge porcentaje={porcentajeUso} />
        </div>
      </div>

      {/* Historial de movimientos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Historial de Movimientos</p>
        </div>

        {movimientos.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-400 text-sm">Sin movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID Referencia</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Concepto</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Monto</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(mov.fecha_movimiento).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      #{mov.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {mov.concepto}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                      mov.tipo === 'REPOSICION' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {mov.tipo === 'REPOSICION' ? '+' : '-'}
                      {formatCurrencyCompact(Math.abs(parseFloat(mov.monto)))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        mov.tipo === 'REPOSICION' ? 'bg-green-100 text-green-700' :
                        mov.tipo === 'GASTO'      ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {mov.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalReponer && (
        <ModalReposicion
          obraId={obraSeleccionada.id}
          cajaId={cajaActiva.id}
          onClose={() => setModalReponer(false)}
        />
      )}
      {modalGasto && (
        <ModalGasto
          obraId={obraSeleccionada.id}
          cajaId={cajaActiva.id}
          onClose={() => setModalGasto(false)}
        />
      )}
    </div>
  );
}

export default CajaChicaPage;