import api from './axios.config';

export const gastosAPI = {
  listar: async (obraId, filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
    if (filtros.fecha_desde)  params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta)  params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.is_personal !== undefined) params.append('is_personal', filtros.is_personal);

    const res = await api.get(`/obras/${obraId}/gastos?${params}`);
    return res.data.gastos;
  },

  resumenCategorias: async (obraId) => {
    const res = await api.get(`/obras/${obraId}/gastos/resumen/categorias`);
    return res.data.resumen;
  },

  crear: async (obraId, data) => {
    const res = await api.post(`/obras/${obraId}/gastos`, data);
    return res.data;
  },

  eliminar: async (obraId, id) => {
    const res = await api.delete(`/obras/${obraId}/gastos/${id}`);
    return res.data;
  },
};