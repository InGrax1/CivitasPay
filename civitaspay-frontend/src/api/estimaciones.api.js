import api from './axios.config';

export const estimacionesAPI = {
  listar: async (obraId) => {
    const res = await api.get(`/obras/${obraId}/estimaciones`);
    return res.data.estimaciones;
  },

  crear: async (obraId, data) => {
    const res = await api.post(`/obras/${obraId}/estimaciones`, data);
    return res.data;
  },

  cambiarEstado: async (obraId, id, estado) => {
    const res = await api.patch(`/obras/${obraId}/estimaciones/${id}/estado`, { estado });
    return res.data;
  },

  eliminar: async (obraId, id) => {
    const res = await api.delete(`/obras/${obraId}/estimaciones/${id}`);
    return res.data;
  },
};