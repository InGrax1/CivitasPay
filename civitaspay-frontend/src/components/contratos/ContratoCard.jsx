import { Calendar } from 'lucide-react';
import { formatCurrencyCompact } from '../../utils/formatCurrency';

const colorEstado = {
  ACTIVO:     { borde: 'border-green-400',  texto: 'text-green-600',  badge: 'bg-green-100 text-green-700' },
  PAUSADO:    { borde: 'border-yellow-400', texto: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  LIQUIDADO:  { borde: 'border-gray-300',   texto: 'text-gray-500',   badge: 'bg-gray-100 text-gray-600' },
  CANCELADO:  { borde: 'border-red-400',    texto: 'text-red-500',    badge: 'bg-red-100 text-red-600' },
};

const etiquetaEstado = {
  ACTIVO:    'Activo',
  PAUSADO:   'Por Terminar',
  LIQUIDADO: 'Terminado',
  CANCELADO: 'Cancelado',
};

function ContratoCard({ contrato, onClick }) {
  const estilos = colorEstado[contrato.estado] ?? colorEstado.ACTIVO;

  const porcentaje = contrato.monto_total > 0
    ? Math.min((parseFloat(contrato.monto_pagado) / parseFloat(contrato.monto_total)) * 100, 100)
    : 0;

  const colorBarra =
    porcentaje >= 100 ? 'bg-gray-400' :
    porcentaje >= 80  ? 'bg-yellow-400' :
    'bg-civitas-blue-light';

  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-2xl p-4 border-2 shadow-sm cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        estilos.borde,
      ].join(' ')}
    >
      {/* Título */}
      <h3 className={`font-semibold text-sm ${estilos.texto}`}>
        {contrato.proveedor}
      </h3>
      <p className="text-xs text-gray-400 mt-0.5 truncate">
        {contrato.concepto}
      </p>

      {/* Montos */}
      <div className="flex justify-between mt-3 text-xs">
        <div>
          <p className="text-gray-400">Contratado</p>
          <p className="font-semibold text-gray-700">
            {formatCurrencyCompact(contrato.monto_total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400">Pagado</p>
          <p className={`font-semibold ${estilos.texto}`}>
            {formatCurrencyCompact(contrato.monto_pagado)}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Proceso de la Ejecución:</span>
          <span className="font-medium">{porcentaje.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colorBarra}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Fechas */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <Calendar size={11} className="flex-shrink-0" />
        <span>{contrato.fecha_inicio
          ? new Date(contrato.fecha_inicio).toLocaleDateString('es-MX')
          : '—'}
        </span>
        <span>→</span>
        <Calendar size={11} className="flex-shrink-0" />
        <span>{contrato.fecha_termino_estimada
          ? new Date(contrato.fecha_termino_estimada).toLocaleDateString('es-MX')
          : '—'}
        </span>
      </div>

      {/* Badge de estado */}
      <div className="mt-3">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${estilos.badge}`}>
          {etiquetaEstado[contrato.estado] ?? contrato.estado}
        </span>
      </div>
    </div>
  );
}

export default ContratoCard;