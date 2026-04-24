 /*
Estado — usuario, accessToken, isAuthenticated. Cualquier componente de la app puede leerlos.
login — hace la petición al backend, guarda los datos, y configura Axios para que todas las peticiones futuras lleven el token automáticamente.
logout — limpia todo.
*/
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axios.config';

const useAuthStore = create(
  persist(
    (set, get) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, usuario } = response.data;
        set({ accessToken, refreshToken, usuario, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return usuario;
      },

      logout: () => {
        set({ usuario: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      // Renueva el accessToken usando el refreshToken
      renovarToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          set({ accessToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'civitaspay-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario:         state.usuario,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;