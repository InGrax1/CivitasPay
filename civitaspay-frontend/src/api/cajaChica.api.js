import api from './axios.config';

export const cajaChicaAPI = {
  listar: async (obraId) => {
    const res = await api.get(`/obras/${obraId}/caja-chica`);
    return res.data.cajas;
  },

  obtener: async (obraId, id) => {
    const res = await api.get(`/obras/${obraId}/caja-chica/${id}`);
    return res.data.data;
  },

  crear: async (obraId, data) => {
    const res = await api.post(`/obras/${obraId}/caja-chica`, data);
    return res.data;
  },

  reponer: async (obraId, id, data) => {
    const res = await api.post(`/obras/${obraId}/caja-chica/${id}/reposicion`, data);
    return res.data;
  },

  gasto: async (obraId, id, data) => {
    const res = await api.post(`/obras/${obraId}/caja-chica/${id}/gasto`, data);
    return res.data;
  },

  ajuste: async (obraId, id, data) => {
    const res = await api.post(`/obras/${obraId}/caja-chica/${id}/ajuste`, data);
    return res.data;
  },

  toggleActiva: async (obraId, id, activa) => {
    const res = await api.patch(`/obras/${obraId}/caja-chica/${id}/toggle`, { activa });
    return res.data;
  },
};