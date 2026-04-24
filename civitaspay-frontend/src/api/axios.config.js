import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
});


// Inyecta el token en cada request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('civitaspay-auth');
  if (stored) {
    const token = JSON.parse(stored)?.state?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró (401), renueva automáticamente
let renovando = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._reintentado) {
      original._reintentado = true;

      if (renovando) {
        // Espera a que termine la renovación y reintenta
        await new Promise((r) => setTimeout(r, 1000));
        return api(original);
      }

      renovando = true;

      try {
        // Importación dinámica para evitar dependencia circular
        const { default: useAuthStore } = await import('../store/authStore');
        const renovado = await useAuthStore.getState().renovarToken();

        if (renovado) {
          const stored = localStorage.getItem('civitaspay-auth');
          const token = JSON.parse(stored)?.state?.accessToken;
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } finally {
        renovando = false;
      }
    }

    return Promise.reject(error);
  }
);


export default api;