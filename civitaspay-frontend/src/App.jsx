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

// Páginas — las iremos creando una por una
import LoginPage from './pages/LoginPage';

// Páginas placeholder — las reemplazaremos después
const Placeholder = ({ nombre }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl font-bold text-civitas-blue">{nombre}</p>
      <p className="text-gray-400 mt-1">Página en construcción</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protege rutas — si no hay sesión redirige al login
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas — todas dentro del layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="obras" element={<ObrasPage />} />
            <Route path="contratos" element={<ContratosPage />} />
            <Route path="gastos" element={<GastosPage />} />
            <Route path="estimaciones" element={<EstimacionesPage />} />
            <Route path="caja-chica" element={<CajaChicaPage />} />
            <Route path="gasto-personal" element={<GastoPersonalPage />} />
            <Route path="personal"       element={<Placeholder nombre="Personal" />} />
            <Route path="config"         element={<Placeholder nombre="Configuración" />} />
          </Route>

          {/* Cualquier ruta desconocida redirige al dashboard */}
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