import api from './axios.config';

export const fondoGarantiaAPI = {
  obtener: async (obraId) => {
    const res = await api.get(`/obras/${obraId}/fondo-garantia`);
    return res.data.data;
  },
};