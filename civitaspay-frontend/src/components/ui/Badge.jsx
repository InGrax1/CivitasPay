const estilos = {
  Activo:       'bg-green-100 text-green-700',
  'En Revisión':'bg-yellow-100 text-yellow-700',
  Excedido:     'bg-red-100 text-red-700',
  Pausado:      'bg-gray-100 text-gray-600',
  Terminado:    'bg-orange-100 text-orange-700',
  Pendiente:    'bg-yellow-100 text-yellow-700',
  Cobrado:      'bg-teal-100 text-teal-700',
  ACTIVA:       'bg-green-100 text-green-700',
  PAUSADA:      'bg-gray-100 text-gray-600',
  FINALIZADA:   'bg-blue-100 text-blue-700',
  CANCELADA:    'bg-red-100 text-red-700',
};

function Badge({ estado, className = '' }) {
  const estilo = estilos[estado] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estilo} ${className}`}>
      {estado}
    </span>
  );
}

export default Badge;