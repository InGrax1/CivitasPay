import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  Settings,
  LogOut,
  FileText,
  Wallet,
  PiggyBank,
  ShoppingBag,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  {
    label: 'Menú',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    label: 'Obras',
    icon: Building2,
    to: '/obras',
    children: [
      { label: 'Contratos', to: '/contratos' },
    ],
  },
  {
    label: 'Finanzas',
    icon: CreditCard,
    to: null,
    children: [
      { label: 'Gastos',          to: '/gastos' },
      { label: 'Estimaciones',    to: '/estimaciones' },
      { label: 'Caja Chica',      to: '/caja-chica' },
      { label: 'Gasto Personal',  to: '/gasto-personal' },
    ],
  },
  {
    label: 'Personal',
    icon: Users,
    to: '/personal',
  },
  {
    label: 'Config.',
    icon: Settings,
    to: '/config',
  },
];

function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-40 min-h-screen bg-civitas-blue flex flex-col py-6 rounded-r-3xl shadow-lg flex-shrink-0">
      {/* Logo */}
      <div className="px-5 mb-8">
        <h1 className="text-white font-bold text-sm leading-tight">
          CivitasPay
        </h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 flex flex-col gap-1">
        {navItems.map((item) => (
          <div key={item.label}>
            {/* Ítem principal */}
            {item.to ? (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm transition-colors',
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/70 hover:text-white hover:bg-white/10',
                  ].join(' ')
                }
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 text-white/70 text-sm">
                <item.icon size={17} />
                <span>{item.label}</span>
              </div>
            )}

            {/* Sub-ítems */}
            {item.children?.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs rounded-xl transition-colors',
                    isActive
                      ? 'text-white font-medium'
                      : 'text-white/55 hover:text-white/90',
                  ].join(' ')
                }
              >
                <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                {child.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Botón salir */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 mx-2 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl text-sm transition-colors cursor-pointer"
      >
        <LogOut size={17} />
        <span>Salir</span>
      </button>
    </aside>
  );
}

export default Sidebar;