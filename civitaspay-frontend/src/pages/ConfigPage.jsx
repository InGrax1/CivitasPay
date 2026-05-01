import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const CONFIG_KEY = 'civitaspay-config';

const CONFIG_DEFAULT = {
  iva:             16,
  decimales:       2,
  moneda:          'MXN',
  tipo_periodo:    'semanal',
  dia_inicio:      1,      // 1=Lunes ... 7=Domingo
  dias_quincena:   [1, 16],
  dias_personalizados: 7,
};

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

const MONEDAS = [
  { value: 'MXN', label: '🇲🇽 Peso Mexicano (MXN)' },
  { value: 'USD', label: '🇺🇸 Dólar Americano (USD)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
];

const DECIMALES = [
  { value: 0, label: '0 decimales — $1,234' },
  { value: 2, label: '2 decimales — $1,234.56 (recomendado)' },
  { value: 4, label: '4 decimales — $1,234.5678' },
  { value: 6, label: '6 decimales — $1,234.567890' },
];

// Calcula el período actual y siguiente según la configuración
function calcularPeriodos(config) {
  const hoy = new Date();
  const periodos = [];

  if (config.tipo_periodo === 'semanal') {
    // Encontrar el inicio de la semana actual
    const diaSemanaHoy = hoy.getDay() === 0 ? 7 : hoy.getDay(); // 1=Lun ... 7=Dom
    const diff = diaSemanaHoy - config.dia_inicio;
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - (diff < 0 ? diff + 7 : diff));

    for (let i = 0; i < 2; i++) {
      const inicio = new Date(inicioSemana);
      inicio.setDate(inicioSemana.getDate() + i * 7);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      periodos.push({ inicio, fin });
    }
  } else if (config.tipo_periodo === 'quincenal') {
    const [d1, d2] = config.dias_quincena;
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    const dia = hoy.getDate();

    let inicioActual, finActual, inicioSig, finSig;

    if (dia < d2) {
      inicioActual = new Date(anio, mes, d1);
      finActual    = new Date(anio, mes, d2 - 1);
      inicioSig    = new Date(anio, mes, d2);
      finSig       = new Date(anio, mes + 1, d1 - 1);
    } else {
      inicioActual = new Date(anio, mes, d2);
      finActual    = new Date(anio, mes + 1, d1 - 1);
      inicioSig    = new Date(anio, mes + 1, d1);
      finSig       = new Date(anio, mes + 1, d2 - 1);
    }

    periodos.push({ inicio: inicioActual, fin: finActual });
    periodos.push({ inicio: inicioSig,    fin: finSig });
  } else if (config.tipo_periodo === 'mensual') {
    for (let i = 0; i < 2; i++) {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      const fin    = new Date(hoy.getFullYear(), hoy.getMonth() + i + 1, 0);
      periodos.push({ inicio, fin });
    }
  } else if (config.tipo_periodo === 'personalizado') {
    const dias = parseInt(config.dias_personalizados) || 7;
    for (let i = 0; i < 2; i++) {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() + i * dias);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + dias - 1);
      periodos.push({ inicio, fin });
    }
  }

  return periodos;
}

const fmt = (date) => date.toLocaleDateString('es-MX', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

function ConfigPage() {
  const [config, setConfig] = useState(CONFIG_DEFAULT);
  const [guardando, setGuardando] = useState(false);

  // Cargar config guardada
  useEffect(() => {
    const guardada = localStorage.getItem(CONFIG_KEY);
    if (guardada) {
      try {
        setConfig({ ...CONFIG_DEFAULT, ...JSON.parse(guardada) });
      } catch {
        setConfig(CONFIG_DEFAULT);
      }
    }
  }, []);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 600)); // Simula guardado
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setGuardando(false);
    toast.success('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    setConfig(CONFIG_DEFAULT);
    localStorage.removeItem(CONFIG_KEY);
    toast.success('Configuración restaurada a valores por defecto');
  };

  const periodos = calcularPeriodos(config);

  return (
    <div className="flex flex-col gap-5 page-enter max-w-3xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Configuración</h1>
          <p className="text-sm text-gray-400">Ajusta los parámetros financieros y de períodos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={RotateCcw} size="sm" onClick={handleReset}>
            Restaurar
          </Button>
          <Button icon={Save} size="sm" loading={guardando} onClick={handleGuardar}>
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* ── Sección 1: Configuración Fiscal ─────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-civitas-blue text-white text-xs flex items-center justify-center font-bold">1</span>
          Configuración Fiscal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* IVA */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">IVA (%):</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue transition-colors">
              <input
                type="number"
                value={config.iva}
                onChange={(e) => handleChange('iva', parseFloat(e.target.value))}
                min="0" max="100" step="0.01"
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
              />
              <span className="px-3 text-gray-400 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-400">Default: 16%</p>
          </div>

          {/* Redondeo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Redondeo financiero:</label>
            <select
              value={config.decimales}
              onChange={(e) => handleChange('decimales', parseInt(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue bg-white"
            >
              {DECIMALES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Moneda */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Moneda:</label>
            <select
              value={config.moneda}
              onChange={(e) => handleChange('moneda', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue bg-white"
            >
              {MONEDAS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview fiscal */}
        <div className="mt-4 bg-civitas-blue-pale rounded-xl p-3 flex flex-wrap gap-4 text-xs">
          <span className="text-gray-600">
            IVA activo: <strong className="text-civitas-blue">{config.iva}%</strong>
          </span>
          <span className="text-gray-600">
            Ejemplo $100,000 bruto →
            Base: <strong>${(100000 / (1 + config.iva / 100)).toFixed(config.decimales)}</strong>,
            IVA: <strong>${(100000 - 100000 / (1 + config.iva / 100)).toFixed(config.decimales)}</strong>
          </span>
        </div>
      </div>

      {/* ── Sección 2: Períodos Contables ───────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-civitas-blue text-white text-xs flex items-center justify-center font-bold">2</span>
          Períodos Contables
        </h2>

        {/* Tipo de período */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-xs font-medium text-gray-600">Tipo de período:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: 'semanal',       label: '📅 Semanal' },
              { value: 'quincenal',     label: '📆 Quincenal' },
              { value: 'mensual',       label: '🗓️ Mensual' },
              { value: 'personalizado', label: '⚙️ Personalizado' },
            ].map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => handleChange('tipo_periodo', tipo.value)}
                className={[
                  'px-3 py-2.5 rounded-xl text-xs font-medium border transition-all',
                  config.tipo_periodo === tipo.value
                    ? 'bg-civitas-blue text-white border-civitas-blue'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-civitas-blue',
                ].join(' ')}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opciones según tipo */}
        {config.tipo_periodo === 'semanal' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">La semana inicia el:</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.value}
                  onClick={() => handleChange('dia_inicio', dia.value)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                    config.dia_inicio === dia.value
                      ? 'bg-civitas-blue text-white border-civitas-blue'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-civitas-blue',
                  ].join(' ')}
                >
                  {dia.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {config.tipo_periodo === 'quincenal' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600">Días de corte del mes:</label>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Corte {i + 1}:</label>
                  <input
                    type="number"
                    value={config.dias_quincena[i]}
                    onChange={(e) => {
                      const nuevos = [...config.dias_quincena];
                      nuevos[i] = parseInt(e.target.value);
                      handleChange('dias_quincena', nuevos);
                    }}
                    min="1" max="28"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-civitas-blue"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Ej: días 1 y 16 — período del 1 al 15, y del 16 al último día del mes
            </p>
          </div>
        )}

        {config.tipo_periodo === 'mensual' && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">
              El período va del <strong>día 1</strong> al <strong>último día</strong> de cada mes,
              sin importar cuántos días tenga el mes.
            </p>
          </div>
        )}

        {config.tipo_periodo === 'personalizado' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Duración del período (días):</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={config.dias_personalizados}
                onChange={(e) => handleChange('dias_personalizados', parseInt(e.target.value))}
                min="1" max="365"
                className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue"
              />
              <span className="text-sm text-gray-500">días por período</span>
            </div>
            <p className="text-xs text-gray-400">
              El período se calcula desde hoy en adelante cada {config.dias_personalizados} días.
            </p>
          </div>
        )}

        {/* Preview de períodos */}
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-600">Vista previa de períodos:</p>
          {periodos.map((p, i) => (
            <div
              key={i}
              className={[
                'flex items-center justify-between rounded-xl px-4 py-3 text-xs border',
                i === 0
                  ? 'bg-civitas-blue-pale border-civitas-blue/20 text-civitas-blue'
                  : 'bg-gray-50 border-gray-100 text-gray-600',
              ].join(' ')}
            >
              <span className="font-medium">
                {i === 0 ? '📍 Período actual' : '⏭️ Período siguiente'}
              </span>
              <span>
                {fmt(p.inicio)} → {fmt(p.fin)}
              </span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">
            ℹ️ Los períodos no tienen restricción de mes — una semana del lunes 28 al domingo 4 es válida aunque cruce dos meses.
          </p>
        </div>
      </div>

    </div>
  );
}

export default ConfigPage;