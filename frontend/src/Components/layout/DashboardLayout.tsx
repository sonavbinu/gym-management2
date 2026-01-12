import { ReactNode } from 'react';
import { useAuth } from '../../Context/AuthContext';
import AdminSidebar from './AdminSidebar';
import MemberSidebar from '../Member/MemberSidebar';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {user?.role === 'member' ? <MemberSidebar /> : <AdminSidebar />}
      <main className="flex-1 overflow-y-auto ">{children}</main>
    </div>
  );
};

export default DashboardLayout;
