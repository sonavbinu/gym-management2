import { useEffect, useState } from 'react';
import AdminLayout from '../../Components/layout/AdminLayout';
import { paymentAPI, subscriptionAPI } from '../../services/api';
import StatsCard from '../../Components/admin/StatsCard';

const RevenuePage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const paymentsRes = (await paymentAPI.getAll?.()) || { data: [] };
      const subscriptionsRes = (await subscriptionAPI.getAll?.()) || {
        data: [],
      };

      setPayments(paymentsRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load revenue data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  // Calculate revenue metrics
  const totalRevenue = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );
  const monthlyRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate || p.createdAt);
      const now = new Date();
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const activeSubscriptions = subscriptions.filter(
    s => s.status === 'ACTIVE'
  ).length;
  const totalPayments = payments.length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-600">
              Loading Revenue Data...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <button
            onClick={fetchRevenueData}
            className="text-gray-600 hover:text-indigo-600 p-2 text-xl"
            title="Refresh Data"
          >
            🔄
          </button>
        </div>

        {error && <div className="py-4 text-center text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString()}`}
                color="bg-green-600"
                icon={<span>💰</span>}
              />
              <StatsCard
                title="Monthly Revenue"
                value={`₹${monthlyRevenue.toLocaleString()}`}
                color="bg-blue-600"
                icon={<span>📅</span>}
              />
              <StatsCard
                title="Active Subscriptions"
                value={activeSubscriptions}
                color="bg-purple-600"
                icon={<span>👥</span>}
              />
              <StatsCard
                title="Total Payments"
                value={totalPayments}
                color="bg-orange-600"
                icon={<span>💳</span>}
              />
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 mb-6 ">
              <h2 className="text-2xl font-bold mb-3">Recent Payments</h2>
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xl">
                          👤 Member
                        </th>
                        <th className="py-3 px-4 text-left text-xl">
                          💰 Amount
                        </th>
                        <th className="py-3 px-4 text-left text-xl">📅 Date</th>
                        <th className="py-3 px-4 text-left text-xl">
                          💳 Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="rounded-xl p-5">
                      {payments.slice(0, 10).map((payment, index) => (
                        <tr
                          key={payment._id || index}
                          className="border-t border-gray-300  "
                        >
                          <td className="py-3 px-4">
                            {payment.memberId?.userId?.profile?.firstName ||
                              payment.memberId?.user?.profile?.firstName ||
                              'Unknown Member'}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            ₹{payment.amount?.toLocaleString() || '0'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(
                              payment.paymentDate || payment.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {payment.paymentMethod || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment data available.
                </div>
              )}
            </div>
          </>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading revenue data...</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RevenuePage;
