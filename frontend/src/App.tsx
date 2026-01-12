import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { ToastProvider } from './Context/ToastContext';
import { UserRole } from './types';
import ProtectedRoute from './utils/ProtectedRoute';

import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import AdminDashboard from './Components/admin/AdminDashboard';
import TrainerDashboard from './Components/Trainer/TrainerDashboard';
import TrainerMembersPage from './Components/Trainer/TrainerMemberPage';
import TrainerSubscriptionPage from './Components/Trainer/TrainerSubscriptionPage';
import TrainerMyProfile from './Components/Trainer/MyProfile';
import MemberDashboard from './Components/Member/MemberDashboard';
import MemberDetail from './Components/admin/MemberDetail';
import MemberProfile from './Components/admin/MemberProfile';
import TrainerProfile from './Components/admin/TrainerProfile';
import TrainerMemberProfile from './Components/Trainer/MemberProfile';
import RevenuePage from './pages/admin/RevenuePage';
import TrainerList from './Components/admin/TrainerList';
import SubscriptionsPage from './Components/admin/SubscriptionsPage';
import PlansTable from './Components/admin/SubscriptionsTable';
import MembersPage from './Components/admin/MembersPage';
import TrainersPage from './Components/admin/TrainersPage';
import TrainersView from './Components/Member/TrainersView';
import MemberTrainerProfile from './Components/Member/TrainerProfile';
import MySubscriptions from './Components/Member/MySubscriptions';
import PurchasePlan from './Components/Member/PurchasePlan';
import MemberPayments from './Components/Member/MemberPayments';
import MemberProfileSettings from './Components/Member/MemberProfileSettings';
import MyProfile from './Components/Member/MyProfile';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-4 bg-slate-50 p-10 text-center">
      <h1 className="text-4xl font-black text-red-600 ">Unauthorized Access</h1>
      <p className="text-slate-500 font-medium max-w-md">
        Your security clearance does not allow access to this encrypted fitness
        sector.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 px-8 py-3 bg-slate-900 text-white font-black rounded-xl  text-xs"
      >
        Return to Base
      </button>
    </div>
  );
};

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black uppercase tracking-[1em]">
        Syncing...
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case UserRole.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case UserRole.TRAINER:
      return <Navigate to="/trainer/dashboard" replace />;
    case UserRole.MEMBER:
      return <Navigate to="/member/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Unified Dashboard Entry */}
            <Route path="/dashboard" element={<DashboardRouter />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/revenue"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <RevenuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainers"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <TrainerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/plans"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <PlansTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/members"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <TrainersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <TrainerProfile />
                </ProtectedRoute>
              }
            />

            {/* Shared Management Routes (Admin & Trainer) */}
            <Route
              path="/members/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.TRAINER]}
                >
                  <MemberDetail />
                </ProtectedRoute>
              }
            />

            {/* Trainer Protected Routes */}
            <Route
              path="/trainer/profile"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <TrainerMyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/my-members"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <TrainerMembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/subscriptions"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <TrainerSubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/members/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <TrainerMemberProfile />
                </ProtectedRoute>
              }
            />

            {/* Member Protected Routes */}
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/trainers"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <TrainersView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/trainers/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <MemberTrainerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/subscriptions"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <MySubscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/purchase"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <PurchasePlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/payments"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <MemberPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/settings"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
                  <MemberProfileSettings />
                </ProtectedRoute>
              }
            />

            {/* Default Redirection */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
