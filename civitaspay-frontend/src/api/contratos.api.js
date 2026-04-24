import api from './axios.config';

export const contratosAPI = {
  listar: async (obraId) => {
    const res = await api.get(`/obras/${obraId}/subcontratos`);
    return res.data.subcontratos;
  },

  obtener: async (obraId, id) => {
    const res = await api.get(`/obras/${obraId}/subcontratos/${id}`);
    return res.data.data;
  },

  crear: async (obraId, data) => {
    const res = await api.post(`/obras/${obraId}/subcontratos`, data);
    return res.data;
  },

  cambiarEstado: async (obraId, id, estado) => {
    const res = await api.patch(`/obras/${obraId}/subcontratos/${id}/estado`, { estado });
    return res.data;
  },

  registrarPago: async (obraId, id, data) => {
    const res = await api.post(`/obras/${obraId}/subcontratos/${id}/pagos`, data);
    return res.data;
  },

  eliminar: async (obraId, id) => {
    const res = await api.delete(`/obras/${obraId}/subcontratos/${id}`);
    return res.data;
  },
};