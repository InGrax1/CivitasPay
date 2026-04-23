import { create } from 'zustand';

const useObraStore = create((set) => ({
  // Estado
  obraSeleccionada: null,

  // Acciones
  seleccionarObra: (obra) => set({ obraSeleccionada: obra }),
  limpiarObra: () => set({ obraSeleccionada: null }),
}));

export default useObraStore;