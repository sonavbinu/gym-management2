import { useEffect, useState } from 'react';
import TrainerLayout from '../layout/TrainerLayout';
import { trainerAPI, subscriptionAPI } from '../../services/api';
import { useToast } from '../../Context/ToastContext';
import ConfirmDialog from '../admin/ConfirmDialog';
import { SubscriptionStatus } from '../../types';

const TrainerSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionSubscription, setActionSubscription] = useState<any | null>(
    null
  );
  const [actionType, setActionType] = useState<'pause' | 'resume' | null>(null);
  const { showToast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await trainerAPI.getMySubscriptions();
      setSubscriptions(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async () => {
    if (!actionSubscription || !actionType) return;

    try {
      if (actionType === 'pause') {
        await subscriptionAPI.pause(actionSubscription._id);
        showToast('success', 'Subscription paused');
      } else if (actionType === 'resume') {
        await subscriptionAPI.resume(actionSubscription._id);
        showToast('success', 'Subscription resumed');
      }
      await fetchSubscriptions();
      setActionSubscription(null);
      setActionType(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Action failed');
      setActionSubscription(null);
      setActionType(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const term = search.toLowerCase();
    const member = sub.memberId;
    const user = member?.userId;
    const name = `${user?.profile?.firstName || ''} ${
      user?.profile?.lastName || ''
    }`.toLowerCase();
    const email = (user?.email || '').toLowerCase();
    const planName = (sub.plan?.name || '').toLowerCase();

    const matchesSearch =
      name.includes(term) || email.includes(term) || planName.includes(term);
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'text-green-600 bg-green-100';
      case SubscriptionStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-100';
      case SubscriptionStatus.EXPIRED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-600">
              Loading Subscriptions...
            </p>
          </div>
        </div>
      </TrainerLayout>
    );
  }

  if (error) {
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <div className="space-y-6 px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mt-6">
              💳 Subscriptions Management
            </h2>
            <p className="text-gray-500 mt-1">
              Monitor and manage member subscriptions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Total
                </p>
                <p className="text-4xl font-bold mt-2 text-blue-600">
                  {subscriptions.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                💳
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Active
                </p>
                <p className="text-4xl font-bold mt-2 text-green-600">
                  {
                    subscriptions.filter(
                      s => s.status === SubscriptionStatus.ACTIVE
                    ).length
                  }
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                ✅
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Paused
                </p>
                <p className="text-4xl font-bold mt-2 text-yellow-600">
                  {
                    subscriptions.filter(
                      s => s.status === SubscriptionStatus.PAUSED
                    ).length
                  }
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                ⏸️
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Expired
                </p>
                <p className="text-4xl font-bold mt-2 text-red-600">
                  {
                    subscriptions.filter(
                      s => s.status === SubscriptionStatus.EXPIRED
                    ).length
                  }
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                ❌
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm  text-gray-700 mb-2">
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Search by member name, email, or plan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
              />
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
              >
                <option value="all">All Status</option>
                <option value={SubscriptionStatus.ACTIVE}>Active</option>
                <option value={SubscriptionStatus.PAUSED}>Paused</option>
                <option value={SubscriptionStatus.EXPIRED}>Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((sub, index) => {
            const member = sub.memberId;
            const user = member?.userId;
            const name = `${user?.profile?.firstName || 'Unknown'} ${
              user?.profile?.lastName || ''
            }`;
            const email = user?.email || 'No email';

            return (
              <div
                key={sub._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Member Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-6">
                    {user?.profile?.firstName?.[0] || '?'}
                    {user?.profile?.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="space-y-4 mb-6">
                  {/* Plan */}
                  <div>
                    <p className="text-gray-700 font-bold mb-2 flex items-center gap-2">
                      <span>💳</span>
                      <span>Plan</span>
                    </p>
                    <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-bold text-blue-700">
                        {sub.plan?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-blue-600">
                        ₹{sub.plan?.price || 0}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        Start Date
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        End Date
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-gray-700 font-bold mb-2 flex items-center gap-2">
                      <span>📊</span>
                      <span>Status</span>
                    </p>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  {sub.status === SubscriptionStatus.ACTIVE && (
                    <button
                      onClick={() => {
                        setActionSubscription(sub);
                        setActionType('pause');
                      }}
                      className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <span>⏸️</span>
                      <span>Pause</span>
                    </button>
                  )}
                  {sub.status === SubscriptionStatus.PAUSED && (
                    <button
                      onClick={() => {
                        setActionSubscription(sub);
                        setActionType('resume');
                      }}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <span>▶️</span>
                      <span>Resume</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSubscriptions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Subscriptions Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {actionSubscription && actionType && (
        <ConfirmDialog
          message={`Are you sure you want to ${actionType} the subscription for ${
            actionSubscription.memberId?.userId?.profile?.firstName ||
            'this member'
          }?`}
          onConfirm={handleAction}
          onCancel={() => {
            setActionSubscription(null);
            setActionType(null);
          }}
        />
      )}
    </TrainerLayout>
  );
};

export default TrainerSubscriptionsPage;
