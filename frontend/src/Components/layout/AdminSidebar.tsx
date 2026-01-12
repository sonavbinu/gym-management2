import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/members', icon: '👥', label: 'Members' },
    { to: '/admin/trainers', icon: '🏃', label: 'Trainers' },
    { to: '/admin/subscriptions', icon: '💳', label: 'Subscriptions' },
    { to: '/admin/revenue', icon: '📈', label: 'Revenue' },
  ];

  return (
    <aside className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-6">
            🏋️
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gym Admin
            </h1>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg scale-105'
                  : 'hover:bg-slate-700/50 hover:translate-x-2'
              }`
            }
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                    isActive ? 'bg-white/20' : 'bg-slate-700'
                  }`}
                >
                  {item.icon}
                </div>
                <span className="font-semibold text-base">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700/50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
            {user?.profile.firstName?.[0]}
            {user?.profile.lastName?.[0]}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">
              {user?.profile.firstName} {user?.profile.lastName}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
