import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimacionesAPI } from '../api/estimaciones.api';
import toast from 'react-hot-toast';

// Lista de estimaciones
export function useEstimaciones(obraId) {
  return useQuery({
    queryKey: ['obras', obraId, 'estimaciones'],
    queryFn: () => estimacionesAPI.listar(obraId),
    enabled: !!obraId,
  });
}

// Crear estimación
export function useCrearEstimacion(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => estimacionesAPI.crear(obraId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'estimaciones'] });
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'dashboard'] });
      toast.success('Estimación registrada exitosamente');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al registrar la estimación';
      toast.error(mensaje);
    },
  });
}

// Cambiar estado
export function useCambiarEstadoEstimacion(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }) => estimacionesAPI.cambiarEstado(obraId, id, estado),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'estimaciones'] });
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'dashboard'] });
      toast.success(`Estimación cambiada a ${variables.estado}`);
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al cambiar el estado';
      toast.error(mensaje);
    },
  });
}

// Eliminar estimación
export function useEliminarEstimacion(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => estimacionesAPI.eliminar(obraId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'estimaciones'] });
      toast.success('Estimación eliminada');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al eliminar la estimación';
      toast.error(mensaje);
    },
  });
}