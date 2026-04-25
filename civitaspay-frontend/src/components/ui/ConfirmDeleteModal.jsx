import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

function ConfirmDeleteModal({ titulo, nombre, onConfirm, onClose, loading }) {
  const [input, setInput] = useState('');
  const coincide = input === nombre;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-sm text-red-700">
              Estás a punto de eliminar <span className="font-bold">"{nombre}"</span>.
              Todos los datos asociados quedarán inactivos.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">
              Para confirmar, escribe el nombre de la obra:
            </label>
            <p className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg">
              {nombre}
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe el nombre aquí..."
              className={[
                'border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors',
                coincide
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 focus:border-gray-400',
              ].join(' ')}
            />
            {input.length > 0 && !coincide && (
              <p className="text-xs text-red-500">El nombre no coincide</p>
            )}
            {coincide && (
              <p className="text-xs text-red-600 font-medium">✓ Nombre confirmado</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!coincide}
            loading={loading}
          >
            Eliminar Obra
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;