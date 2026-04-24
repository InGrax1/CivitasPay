import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obrasAPI } from '../api/obras.api';
import toast from 'react-hot-toast';

// Lista de obras
export function useObras() {
  return useQuery({
    queryKey: ['obras'],
    queryFn: obrasAPI.listar,
  });
}

// Dashboard de una obra específica
export function useObraDashboard(obraId) {
  return useQuery({
    queryKey: ['obras', obraId, 'dashboard'],
    queryFn: () => obrasAPI.dashboard(obraId),
    enabled: !!obraId, // Solo ejecuta si hay obraId
  });
}

// Crear obra
export function useCrearObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: obrasAPI.crear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra creada exitosamente');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al crear la obra';
      toast.error(mensaje);
    },
  });
}

// Actualizar obra
export function useActualizarObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => obrasAPI.actualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra actualizada exitosamente');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al actualizar la obra';
      toast.error(mensaje);
    },
  });
}

// Eliminar obra
export function useEliminarObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: obrasAPI.eliminar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra eliminada');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al eliminar la obra';
      toast.error(mensaje);
    },
  });
}