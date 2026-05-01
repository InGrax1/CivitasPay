import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personalAPI } from '../api/personal.api';
import toast from 'react-hot-toast';

export function usePersonal() {
  return useQuery({
    queryKey: ['personal'],
    queryFn: personalAPI.listar,
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: personalAPI.crear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personal'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al crear el usuario');
    },
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => personalAPI.actualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personal'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al actualizar el usuario');
    },
  });
}

export function useEliminarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: personalAPI.eliminar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personal'] });
      toast.success('Usuario eliminado');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al eliminar el usuario');
    },
  });
}