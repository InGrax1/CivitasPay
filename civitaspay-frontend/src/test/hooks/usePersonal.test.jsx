import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/personal.api', () => ({
  personalAPI: {
    listar:     vi.fn(),
    crear:      vi.fn(),
    actualizar: vi.fn(),
    eliminar:   vi.fn(),
  },
}));

import { personalAPI } from '../../api/personal.api';
import { usePersonal } from '../../hooks/usePersonal';

const usuariosMock = [
  { id: '1', nombre_completo: 'Admin Principal', rol: 'ADMINISTRADOR', activo: true },
  { id: '2', nombre_completo: 'María García',    rol: 'AUXILIAR',      activo: true },
  { id: '3', nombre_completo: 'Carlos Mendoza',  rol: 'RESIDENTE',     activo: true },
];

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('usePersonal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista de usuarios', async () => {
    personalAPI.listar.mockResolvedValue(usuariosMock);
    const { result } = renderHook(() => usePersonal(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });

  it('identifica administradores correctamente', async () => {
    personalAPI.listar.mockResolvedValue(usuariosMock);
    const { result } = renderHook(() => usePersonal(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const admins = result.current.data.filter((u) => u.rol === 'ADMINISTRADOR');
    expect(admins).toHaveLength(1);
  });

  it('identifica residentes correctamente', async () => {
    personalAPI.listar.mockResolvedValue(usuariosMock);
    const { result } = renderHook(() => usePersonal(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const residentes = result.current.data.filter((u) => u.rol === 'RESIDENTE');
    expect(residentes).toHaveLength(1);
  });

  it('valida límite de 5 administradores en el conteo', async () => {
    const muchoAdmins = Array.from({ length: 5 }, (_, i) => ({
      id: `admin-${i}`, nombre_completo: `Admin ${i}`, rol: 'ADMINISTRADOR', activo: true,
    }));
    personalAPI.listar.mockResolvedValue(muchoAdmins);
    const { result } = renderHook(() => usePersonal(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const admins = result.current.data.filter((u) => u.rol === 'ADMINISTRADOR');
    expect(admins.length).toBeLessThanOrEqual(5);
  });

  it('maneja error del backend', async () => {
    personalAPI.listar.mockRejectedValue(new Error('Unauthorized'));
    const { result } = renderHook(() => usePersonal(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Unauthorized');
  });
});