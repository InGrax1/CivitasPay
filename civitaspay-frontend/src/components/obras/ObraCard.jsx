import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import useObraStore from '../../store/obraStore';

function ObraCard({ obra }) {
  const navigate = useNavigate();
  const seleccionarObra = useObraStore((state) => state.seleccionarObra);

  const porcentaje = obra.porcentaje_gastado ?? 0;

  const colorBarra =
    porcentaje > 100 ? 'bg-red-500' :
    porcentaje > 80  ? 'bg-yellow-400' :
    'bg-civitas-blue-light';

  const handleClick = () => {
    seleccionarObra(obra);
    navigate('/obras');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Imagen de la obra */}
      <div className="h-36 bg-gradient-to-br from-civitas-blue to-civitas-blue-light relative overflow-hidden">
        {obra.foto_url ? (
          <img
            src={obra.foto_url}
            alt={obra.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <span className="text-white text-5xl font-black">
              {obra.nombre?.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm truncate">
            {obra.nombre}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-400 truncate">
              {obra.cliente}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Presupuesto gastado</span>
            <span className="font-medium">{porcentaje}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${colorBarra}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Badge estado={obra.estado} />
          <span className="text-xs text-civitas-blue-light font-medium hover:underline">
            Detalles →
          </span>
        </div>
      </div>
    </div>
  );
}

export default ObraCard;