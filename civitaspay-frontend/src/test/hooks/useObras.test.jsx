import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock de la API
vi.mock('../../api/obras.api', () => ({
  obrasAPI: {
    listar:    vi.fn(),
    dashboard: vi.fn(),
    crear:     vi.fn(),
    actualizar: vi.fn(),
    eliminar:  vi.fn(),
  },
}));

vi.mock('../../store/obraStore', () => ({
  default: vi.fn(() => ({
    obraSeleccionada: { id: 'obra-1' },
    seleccionarObra:  vi.fn(),
  })),
}));

import { obrasAPI } from '../../api/obras.api';
import { useObras, useObraDashboard } from '../../hooks/useObras';

const obrasMock = [
  { id: 'obra-1', nombre: 'Torre Norte', estado: 'ACTIVA', cliente: 'Cliente A' },
  { id: 'obra-2', nombre: 'Torre Sur',   estado: 'ACTIVA', cliente: 'Cliente B' },
];

const dashboardMock = {
  costo_contrato:     1000000,
  costo_directo:       800000,
  estimaciones_cobradas: 500000,
  total_gastado:       300000,
};

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('useObras', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista de obras del backend', async () => {
    obrasAPI.listar.mockResolvedValue(obrasMock);
    const { result } = renderHook(() => useObras(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].nombre).toBe('Torre Norte');
  });

  it('retorna array vacío si no hay obras', async () => {
    obrasAPI.listar.mockResolvedValue([]);
    const { result } = renderHook(() => useObras(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it('maneja error del backend correctamente', async () => {
    obrasAPI.listar.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useObras(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Network error');
  });
});

describe('useObraDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna datos del dashboard de la obra', async () => {
    obrasAPI.dashboard.mockResolvedValue(dashboardMock);
    const { result } = renderHook(() => useObraDashboard('obra-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.costo_contrato).toBe(1000000);
  });

  it('no ejecuta la query si no hay obraId', async () => {
    const { result } = renderHook(() => useObraDashboard(null), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(obrasAPI.dashboard).not.toHaveBeenCalled();
  });
});