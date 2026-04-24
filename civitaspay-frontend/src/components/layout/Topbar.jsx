import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import api from '../../api/axios.config';
import useObraStore from '../../store/obraStore';
import useAuthStore from '../../store/authStore';

function Topbar({ onMenuClick }) {
  const { obraSeleccionada, seleccionarObra } = useObraStore();
  const usuario = useAuthStore((state) => state.usuario);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  // Carga las obras para el selector
  const { data: obras = [] } = useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const response = await api.get('/obras');
      return response.data.obras;
    },
  });

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Izquierda — botón de menú en móvil */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Espacio vacío en desktop */}
      <div className="hidden md:block" />

      {/* Derecha — selector de obra + avatar */}
      <div className="flex items-center gap-3">
        {/* Selector de obra */}
        <div className="relative">
          <button
            onClick={() => setDropdownAbierto(!dropdownAbierto)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors max-w-[160px] md:max-w-[220px]"
          >
            <span className="truncate">
              {obraSeleccionada ? obraSeleccionada.nombre : 'Selecciona Obra'}
            </span>
            <ChevronDown
              size={14}
              className={`flex-shrink-0 transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown de obras */}
          {dropdownAbierto && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {obras.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">
                  Sin obras disponibles
                </p>
              ) : (
                obras.map((obra) => (
                  <button
                    key={obra.id}
                    onClick={() => {
                      seleccionarObra(obra);
                      setDropdownAbierto(false);
                    }}
                    className={[
                      'w-full text-left px-4 py-2.5 text-sm transition-colors',
                      obraSeleccionada?.id === obra.id
                        ? 'bg-civitas-blue-pale text-civitas-blue font-medium'
                        : 'text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {obra.nombre}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Avatar del usuario */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-civitas-blue flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {usuario?.nombre_completo?.charAt(0) ?? 'U'}
            </span>
          </div>
          {/* Nombre solo visible en pantallas medianas o más */}
          <span className="hidden md:block text-sm text-gray-600 max-w-[100px] truncate">
            {usuario?.nombre_completo?.split(' ')[0] ?? ''}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;