import api from './axios.config';

export const personalAPI = {
  listar: async () => {
    const res = await api.get('/personal');
    return res.data.usuarios;
  },

  crear: async (data) => {
    const res = await api.post('/personal', data);
    return res.data;
  },

  actualizar: async (id, data) => {
    const res = await api.put(`/personal/${id}`, data);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.delete(`/personal/${id}`);
    return res.data;
  },
};