import api from './axios.config';

export const obrasAPI = {
  listar: async () => {
    const res = await api.get('/obras');
    return res.data.obras;
  },

  obtener: async (id) => {
    const res = await api.get(`/obras/${id}`);
    return res.data.data;
  },

  dashboard: async (id) => {
    const res = await api.get(`/obras/${id}/dashboard`);
    return res.data.data;
  },

  crear: async (data) => {
    const res = await api.post('/obras', data);
    return res.data;
  },

  actualizar: async (id, data) => {
    const res = await api.put(`/obras/${id}`, data);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.delete(`/obras/${id}`);
    return res.data;
  },
};