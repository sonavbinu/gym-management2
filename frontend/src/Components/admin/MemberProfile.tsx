import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { memberAPI, trainerAPI, subscriptionAPI } from '../../services/api';
import { Trainer, SubscriptionStatus } from '../../types';

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch member, trainers, and plans
        const [memberRes, trainersRes, plansRes] = await Promise.all([
          memberAPI.getById(id!),
          trainerAPI.getAll(),
          subscriptionAPI.getPlans(),
        ]);

        setMember(memberRes.data);
        setTrainers(trainersRes.data || []);

        const plansData = plansRes.data || {};
        if (Array.isArray(plansData)) {
          setPlans(plansData);
        } else {
          setPlans(
            Object.keys(plansData).map(k => ({
              key: k,
              ...(plansData as any)[k],
            }))
          );
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load member details'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleAssignTrainer = async () => {
    if (!selectedTrainer) return;
    try {
      await trainerAPI.assignMember({
        trainerId: selectedTrainer,
        memberId: id!,
      });
      alert('Trainer assigned successfully');
      // Refresh member data
      const res = await memberAPI.getById(id!);
      setMember(res.data);
    } catch (err) {
      alert('Failed to assign trainer');
    }
  };

  const handleAssignSubscription = async () => {
    if (!selectedPlan) return;
    try {
      const plan = plans.find(p => (p._id || p.id) === selectedPlan);
      await subscriptionAPI.assignToMember(id!, {
        planId: selectedPlan,
        planKey: plan?.key,
        paymentMethod: selectedPaymentMethod,
      });
      alert('Subscription assigned successfully');
      const res = await memberAPI.getById(id!);
      setMember(res.data);
    } catch (err) {
      alert('Failed to assign subscription');
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this member permanently?'
      )
    )
      return;
    try {
      await memberAPI.delete(id!);
      navigate('/admin/members');
    } catch (err) {
      alert('Failed to delete member');
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-xl font-semibold text-gray-600">
            Loading member details...
          </p>
        </div>
      </AdminLayout>
    );

  if (error || !member)
    return (
      <AdminLayout>
        <div className="text-red-600 text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Member</h2>
          <p>{error || 'Member not found'}</p>
        </div>
      </AdminLayout>
    );

  const user = member.userId || member.user;
  const currentPlan =
    member.currentSubscription?.status === SubscriptionStatus.ACTIVE
      ? member.currentSubscription
      : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              👤 Member Profile
            </h2>
            <p className="text-gray-500 mt-1">View and manage member details</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <span className="text-xl">🗑️</span>
              <span>Delete Member</span>
            </button>
          </div>
        </div>

        <div
          onClick={() => navigate(`/admin/members/${id}`)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 "
        >
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.profile?.firstName?.[0]}
                {user?.profile?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </h3>
                <p className="text-gray-500 text-lg">{user?.email}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Member since:{' '}
                  {new Date(
                    member.joinDate || member.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {user?.profile?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${
                      member.currentSubscription?.status ===
                      SubscriptionStatus.ACTIVE
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.currentSubscription?.status?.toUpperCase() ||
                      'INACTIVE'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Current Plan
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {currentPlan ? currentPlan.plan.name : 'No active plan'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Assigned Trainer
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {member.assignedTrainer
                      ? `${
                          member.assignedTrainer.userId?.profile?.firstName ||
                          'Unknown'
                        } ${
                          member.assignedTrainer.userId?.profile?.lastName || ''
                        }`.trim()
                      : 'No trainer assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="space-y-6">
            {/* Subscription Management */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <span>Subscription Management</span>
              </h3>
              {currentPlan ? (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="font-bold text-green-800 mb-2">Active Plan</p>
                  <p className="text-green-700 font-medium">
                    {currentPlan.plan.name}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Expires:{' '}
                    {new Date(currentPlan.endDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this subscription?')) {
                        try {
                          await subscriptionAPI.delete(currentPlan._id || currentPlan.id);
                          alert('Subscription deleted');
                          const res = await memberAPI.getById(id!);
                          setMember(res.data);
                        } catch (err) {
                          alert('Failed to delete subscription');
                        }
                      }
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Delete Subscription</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
                    value={selectedPlan}
                    onChange={e => setSelectedPlan(e.target.value)}
                  >
                    <option value="">Select a Plan</option>
                    {plans.map((p: any) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 Payment Method
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
                      value={selectedPaymentMethod}
                      onChange={e => setSelectedPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank-transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAssignSubscription}
                    disabled={!selectedPlan}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:cursor-not-allowed"
                  >
                    ✓ Assign Plan
                  </button>
                </div>
              )}
            </div>

            {/* Trainer Management */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏃</span>
                <span>Trainer Management</span>
              </h3>
              {member.assignedTrainer ? (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="font-bold text-blue-800 mb-2">
                    Assigned Trainer
                  </p>
                  <p className="text-blue-700 font-medium">
                    {member.assignedTrainer.userId?.profile?.firstName ||
                      'Unknown'}{' '}
                    {member.assignedTrainer.userId?.profile?.lastName || ''}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {member.assignedTrainer.specialization?.join(', ') ||
                      'Specialization not specified'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
                    value={selectedTrainer}
                    onChange={e => setSelectedTrainer(e.target.value)}
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map((t: any) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.userId?.profile?.firstName}{' '}
                        {t.userId?.profile?.lastName} -{' '}
                        {t.specialization?.join(', ')}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignTrainer}
                    disabled={!selectedTrainer}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:cursor-not-allowed"
                  >
                    ✓ Assign Trainer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MemberProfile;
