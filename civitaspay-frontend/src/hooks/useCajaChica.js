import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cajaChicaAPI } from '../api/cajaChica.api';
import toast from 'react-hot-toast';

// Lista de cajas de una obra
export function useCajas(obraId) {
  return useQuery({
    queryKey: ['obras', obraId, 'caja-chica'],
    queryFn: () => cajaChicaAPI.listar(obraId),
    enabled: !!obraId,
  });
}

// Detalle de una caja con movimientos
export function useCaja(obraId, cajaId) {
  return useQuery({
    queryKey: ['obras', obraId, 'caja-chica', cajaId],
    queryFn: () => cajaChicaAPI.obtener(obraId, cajaId),
    enabled: !!obraId && !!cajaId,
  });
}

// Crear caja
export function useCrearCaja(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => cajaChicaAPI.crear(obraId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'caja-chica'] });
      toast.success('Caja chica creada exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al crear la caja');
    },
  });
}

// Reponer fondos
export function useReponer(obraId, cajaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => cajaChicaAPI.reponer(obraId, cajaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'caja-chica'] });
      toast.success('Fondos repuestos exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al reponer fondos');
    },
  });
}

// Registrar gasto de caja chica
export function useGastoCaja(obraId, cajaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => cajaChicaAPI.gasto(obraId, cajaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'caja-chica'] });
      toast.success('Gasto registrado en caja chica');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al registrar el gasto');
    },
  });
}