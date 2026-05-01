import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';

// Mock de axios
vi.mock('../../api/axios.config', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get:  vi.fn().mockResolvedValue({ data: {} }),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useAuthStore', () => {
  beforeEach(() => {
  useAuthStore.setState({
    usuario: null, accessToken: null, refreshToken: null, isAuthenticated: false,
  });
});

  it('inicia sin autenticación', () => {
    const { result } = renderHook(() => useAuthStore(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('inicia sin usuario', () => {
    const { result } = renderHook(() => useAuthStore(), { wrapper });
    expect(result.current.usuario).toBeNull();
  });

 it('login guarda el usuario y tokens', () => {
  const { result } = renderHook(() => useAuthStore(), { wrapper });
  act(() => {
    useAuthStore.setState({
      usuario:         { id: '1', nombre_completo: 'Admin', rol: 'ADMINISTRADOR' },
      accessToken:     'access-token-123',
      refreshToken:    'refresh-token-456',
      isAuthenticated: true,
    });
  });
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.usuario.nombre_completo).toBe('Admin');
  expect(result.current.accessToken).toBe('access-token-123');
});

  it('logout limpia el estado', () => {
    const { result } = renderHook(() => useAuthStore(), { wrapper });
    act(() => {
      result.current.login(
        { id: '1', nombre_completo: 'Admin', rol: 'ADMINISTRADOR' },
        'access-token-123',
        'refresh-token-456'
      );
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.usuario).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it('rol del usuario se guarda correctamente', () => {
  const { result } = renderHook(() => useAuthStore(), { wrapper });
  act(() => {
    useAuthStore.setState({
      usuario:         { id: '1', nombre_completo: 'Admin', rol: 'ADMINISTRADOR' },
      accessToken:     'token',
      refreshToken:    'refresh',
      isAuthenticated: true,
    });
  });
  expect(result.current.usuario.rol).toBe('ADMINISTRADOR');
});
});