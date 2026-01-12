import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../utils/ProtectedRoute';
import { UserRole } from '../../types';
import MemberDashboard from './MemberDashboard';
import MySubscriptions from './MySubscriptions';
import PurchasePlan from './PurchasePlan';
import TrainersView from './TrainersView';

const MemberRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
            <MemberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
            <MySubscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
            <PurchasePlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainers"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MEMBER]}>
            <TrainersView />
          </ProtectedRoute>
        }
      />
      {/* Default redirect to dashboard */}
      <Route path="*" element={<MemberDashboard />} />
    </Routes>
  );
};

export default MemberRoutes;
