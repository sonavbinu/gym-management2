import { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useToast } from '../../Context/ToastContext';
import { subscriptionAPI } from '../../services/api';
import { Subscription, SubscriptionStatus } from '../../types';
import MemberLayout from '../layout/MemberLayout';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionAPI.getMySubscriptions();
      setSubscriptions(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handlePause = async (id: string) => {
    try {
      await subscriptionAPI.pauseMy(id);
      showToast('success', 'Subscription paused successfully');
      fetchSubscriptions();
    } catch (err: any) {
      showToast(
        'error',
        err.response?.data?.message || 'Failed to pause subscription'
      );
    }
  };

  const handleResume = async (id: string) => {
    try {
      await subscriptionAPI.resumeMy(id);
      showToast('success', 'Subscription resumed successfully');
      fetchSubscriptions();
    } catch (err: any) {
      showToast(
        'error',
        err.response?.data?.message || 'Failed to resume subscription'
      );
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel your subscription?'))
      return;
    try {
      await subscriptionAPI.cancelMy(id);
      showToast('success', 'Subscription cancelled successfully');
      fetchSubscriptions();
    } catch (err: any) {
      showToast(
        'error',
        err.response?.data?.message || 'Failed to cancel subscription'
      );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex  items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading subscriptions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      </DashboardLayout>
    );
  }

  const currentSubscription = subscriptions.find(
    s =>
      s.status === SubscriptionStatus.ACTIVE ||
      s.status === SubscriptionStatus.PAUSED
  );

  return (
    <MemberLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 ">My Subscriptions</h1>

        {currentSubscription && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-xl hover:shadow-2xl transition-all">
            <h2 className="text-xl font-semibold mb-2">Current Plan</h2>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-2xl font-bold ">
                  <div className="flex gap-1 items-center justify-center">
                    <span className="text-2xl ">💳</span>

                    {currentSubscription.plan.name}
                  </div>
                </p>
                <p className="text-purple-100 mt-1">
                  <span className="text-2xl">💰</span>₹
                  {currentSubscription.plan.price} /{' '}
                  {currentSubscription.plan.duration} month(s)
                </p>
                <p className="text-sm text-purple-100 mt-2">
                  <span className="text-2xl">📅</span>
                  Valid until:{' '}
                  {new Date(currentSubscription.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                {currentSubscription.status === SubscriptionStatus.ACTIVE && (
                  <>
                    <button
                      onClick={() => handlePause(currentSubscription.id)}
                      className="bg-white text-purple-600 px-4 py-2 rounded-xl flex items-center  text-center hover:bg-purple-300 hover:shadow-xl cursor-pointer "
                    >
                      <span className="text-xl">⏸️ </span>
                      Pause
                    </button>
                    <button
                      onClick={() => handleCancel(currentSubscription.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                    >
                      <span className="text-2xl">🚫</span>
                      Cancel
                    </button>
                  </>
                )}

                {currentSubscription.status === SubscriptionStatus.PAUSED && (
                  <>
                    <button
                      onClick={() => handleResume(currentSubscription.id)}
                      className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-purple-50"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => handleCancel(currentSubscription.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">Subscription History</h2>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {subscriptions.map(sub => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 font-medium">{sub.plan.name}</td>
                  <td className="px-6 py-4">{sub.plan.duration} month(s)</td>
                  <td className="px-6 py-4">₹{sub.plan.price}</td>
                  <td className="px-6 py-4">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(sub.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscriptions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No subscriptions found. Purchase a plan to get started.
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default MySubscriptions;
