import { TrendingUp, TrendingDown } from 'lucide-react';

function StatCard({ titulo, valor, icono: Icono, variacion, colorValor = 'text-gray-800' }) {
  const esPositivo = variacion && !variacion.startsWith('-');

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{titulo}</p>
        {Icono && (
          <div className="w-9 h-9 rounded-xl bg-civitas-blue-pale flex items-center justify-center">
            <Icono size={18} className="text-civitas-blue" />
          </div>
        )}
      </div>

      <p className={`text-2xl md:text-3xl font-bold ${colorValor}`}>
        {valor}
      </p>

      {variacion && (
        <div className={`flex items-center gap-1 text-xs font-medium ${esPositivo ? 'text-green-600' : 'text-red-500'}`}>
          {esPositivo ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{variacion}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;