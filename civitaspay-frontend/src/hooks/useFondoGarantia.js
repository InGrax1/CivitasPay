import { useQuery } from '@tanstack/react-query';
import { fondoGarantiaAPI } from '../api/fondoGarantia.api';

export function useFondoGarantia(obraId) {
  return useQuery({
    queryKey: ['obras', obraId, 'fondo-garantia'],
    queryFn: () => fondoGarantiaAPI.obtener(obraId),
    enabled: !!obraId,
  });
}