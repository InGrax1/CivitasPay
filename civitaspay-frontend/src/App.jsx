import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ObrasPage from './pages/ObrasPage';
import GastosPage from './pages/GastosPage';
import EstimacionesPage from './pages/EstimacionesPage';
import CajaChicaPage from './pages/CajaChicaPage';
import GastoPersonalPage from './pages/GastoPersonalPage';
import ContratosPage from './pages/ContratosPage';
import PersonalPage from './pages/PersonalPage';
import ConfigPage from './pages/ConfigPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, usuario } = useAuthStore((s) => s);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (usuario?.rol === 'RESIDENTE') return <Navigate to="/sin-acceso" replace />;
  return children;
}

function SoloAdmin({ children }) {
  const usuario = useAuthStore((s) => s.usuario);
  if (usuario?.rol !== 'ADMINISTRADOR') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sin-acceso" element={
            <div className="min-h-screen flex items-center justify-center bg-civitas-bg">
              <div className="text-center">
                <p className="text-4xl mb-4">🔒</p>
                <h1 className="text-xl font-bold text-gray-700">Sin acceso al sistema</h1>
                <p className="text-sm text-gray-400 mt-2">
                  Tu rol no tiene permisos para acceder a esta plataforma.
                </p>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="mt-4 text-civitas-blue text-sm hover:underline"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          } />

          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<DashboardPage />} />
            <Route path="obras"          element={<ObrasPage />} />
            <Route path="contratos"      element={<ContratosPage />} />
            <Route path="gastos"         element={<GastosPage />} />
            <Route path="estimaciones"   element={<EstimacionesPage />} />
            <Route path="caja-chica"     element={<CajaChicaPage />} />
            <Route path="gasto-personal" element={<GastoPersonalPage />} />
            <Route path="personal"       element={<SoloAdmin><PersonalPage /></SoloAdmin>} />
            <Route path="config"         element={<SoloAdmin><ConfigPage /></SoloAdmin>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;