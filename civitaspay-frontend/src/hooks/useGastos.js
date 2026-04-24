import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gastosAPI } from '../api/gastos.api';
import toast from 'react-hot-toast';

// Lista de gastos con filtros opcionales
export function useGastos(obraId, filtros = {}) {
  return useQuery({
    queryKey: ['obras', obraId, 'gastos', filtros],
    queryFn: () => gastosAPI.listar(obraId, filtros),
    enabled: !!obraId,
  });
}

// Resumen por categoría
export function useResumenCategorias(obraId) {
  return useQuery({
    queryKey: ['obras', obraId, 'gastos', 'resumen'],
    queryFn: () => gastosAPI.resumenCategorias(obraId),
    enabled: !!obraId,
  });
}

// Crear gasto
export function useCrearGasto(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => gastosAPI.crear(obraId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'gastos'] });
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'dashboard'] });
      toast.success('Gasto registrado exitosamente');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al registrar el gasto';
      toast.error(mensaje);
    },
  });
}

// Eliminar gasto
export function useEliminarGasto(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => gastosAPI.eliminar(obraId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'gastos'] });
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'dashboard'] });
      toast.success('Gasto eliminado');
    },
    onError: (err) => {
      const mensaje = err.response?.data?.error || 'Error al eliminar el gasto';
      toast.error(mensaje);
    },
  });
}