import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';
import useObraStore from '../../store/obraStore';
import useAuthStore from '../../store/authStore';
import { useEliminarObra } from '../../hooks/useObras';

function ObraCard({ obra }) {
  const navigate        = useNavigate();
  const seleccionarObra = useObraStore((state) => state.seleccionarObra);
  const usuario         = useAuthStore((s) => s.usuario);
  const esAdmin         = usuario?.rol === 'ADMINISTRADOR';
  const eliminarObra    = useEliminarObra();

  const [modalEliminar, setModalEliminar] = useState(false);

  const porcentaje = obra.porcentaje_gastado ?? 0;

  const colorBarra =
    porcentaje > 100 ? 'bg-red-500' :
    porcentaje > 80  ? 'bg-yellow-400' :
    'bg-civitas-blue-light';

  const handleClick = () => {
    seleccionarObra(obra);
    navigate('/obras');
  };

  const handleEliminar = async () => {
    await eliminarObra.mutateAsync(obra.id);
    setModalEliminar(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative group">

        {/* Botón eliminar — solo Admin, aparece al hacer hover */}
        {esAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // No navega a la obra
              setModalEliminar(true);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
            title="Eliminar obra"
          >
            <Trash2 size={13} />
          </button>
        )}

        {/* Imagen clickeable */}
        <div
          onClick={handleClick}
          className="h-36 bg-gradient-to-br from-civitas-blue to-civitas-blue-light relative overflow-hidden cursor-pointer"
        >
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

        {/* Contenido clickeable */}
        <div
          onClick={handleClick}
          className="p-4 flex flex-col gap-3 cursor-pointer"
        >
          <div>
            <h3 className="font-semibold text-gray-800 text-sm truncate">
              {obra.nombre}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-400 truncate">{obra.cliente}</p>
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
            <span className="text-xs text-civitas-blue-light font-medium">
              Detalles →
            </span>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalEliminar && (
        <ConfirmDeleteModal
          titulo="Eliminar Obra"
          nombre={obra.nombre}
          onConfirm={handleEliminar}
          onClose={() => setModalEliminar(false)}
          loading={eliminarObra.isPending}
        />
      )}
    </>
  );
}

export default ObraCard;