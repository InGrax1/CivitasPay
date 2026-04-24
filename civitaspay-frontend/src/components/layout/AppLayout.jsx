import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-civitas-bg overflow-hidden">

      {/* Overlay oscuro — solo en móvil cuando el sidebar está abierto */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* Sidebar — fijo en desktop, deslizable en móvil */}
      <div
        className={[
          'fixed md:static z-30 h-full transition-transform duration-300',
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <Sidebar onClose={() => setSidebarAbierto(false)} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarAbierto(!sidebarAbierto)} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Outlet renderiza la página actual según la ruta */}
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AppLayout;