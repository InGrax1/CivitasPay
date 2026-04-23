 /*
Estado — usuario, accessToken, isAuthenticated. Cualquier componente de la app puede leerlos.
login — hace la petición al backend, guarda los datos, y configura Axios para que todas las peticiones futuras lleven el token automáticamente.
logout — limpia todo.
*/
import { create } from 'zustand';
import api from '../api/axios.config';

const useAuthStore = create((set) => ({
  // Estado
  usuario: null,
  accessToken: null,
  isAuthenticated: false,

  // Iniciar sesión
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, usuario } = response.data;

    set({ accessToken, usuario, isAuthenticated: true });

    // Agrega el token a todas las peticiones futuras
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return usuario;
  },

  // Cerrar sesión
  logout: () => {
    set({ usuario: null, accessToken: null, isAuthenticated: false });
    delete api.defaults.headers.common['Authorization'];
  },
}));

export default useAuthStore;