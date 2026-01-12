import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import TrainerSidebar from '../Trainer/TrainerSidebar';

interface TrainerLayoutProps {
  children: ReactNode;
}

const MemberLayout = ({ children }: TrainerLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/trainer/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/trainer/my-members', icon: '🏃', label: 'Members' },
    { path: '/trainer/subscriptions', icon: '📅', label: 'Subscriptions' },
    { path: '/trainer/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TrainerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform">
                {menuItems.find(item => item.path === location.pathname)
                  ?.icon || '📊'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {menuItems.find(item => item.path === location.pathname)
                    ?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500">
                  Welcome back, {user?.profile.firstName}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.profile.firstName?.[0]}
                  {user?.profile.lastName?.[0]}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {user?.profile.firstName} {user?.profile.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
