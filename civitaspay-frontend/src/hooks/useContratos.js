import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contratosAPI } from '../api/contratos.api';
import toast from 'react-hot-toast';

// Lista de contratos
export function useContratos(obraId) {
  return useQuery({
    queryKey: ['obras', obraId, 'contratos'],
    queryFn: () => contratosAPI.listar(obraId),
    enabled: !!obraId,
  });
}

// Crear contrato
export function useCrearContrato(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => contratosAPI.crear(obraId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'contratos'] });
      toast.success('Contrato creado exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al crear el contrato');
    },
  });
}

// Registrar pago
export function useRegistrarPago(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => contratosAPI.registrarPago(obraId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'contratos'] });
      toast.success('Pago registrado exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al registrar el pago');
    },
  });
}

// Cambiar estado
export function useCambiarEstadoContrato(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }) => contratosAPI.cambiarEstado(obraId, id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'contratos'] });
      toast.success('Estado actualizado');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al cambiar el estado');
    },
  });
}

// Eliminar contrato
export function useEliminarContrato(obraId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => contratosAPI.eliminar(obraId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obras', obraId, 'contratos'] });
      toast.success('Contrato eliminado');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al eliminar el contrato');
    },
  });
}