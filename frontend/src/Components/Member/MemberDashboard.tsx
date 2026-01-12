import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import api, { memberAPI, paymentAPI } from '../../services/api';
import { Member, Subscription, Payment, SubscriptionStatus } from '../../types';
import MemberLayout from '../layout/MemberLayout';
import MemberScheduleView from './MemberScheduleView';
// import MemberProgressChart from '../Shared/MemberProgressChart';

const getStatusBadgeClass = (status?: SubscriptionStatus) => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case SubscriptionStatus.PAUSED:
      return 'bg-yellow-100 text-yellow-800';
    case SubscriptionStatus.EXPIRED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const MemberDashboard = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  // const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Debug auth
        try {
          const debugRes = await api.get('/members/debug/auth');
          console.log('Auth debug:', debugRes.data);
        } catch (err) {
          console.error('Auth debug failed');
        }

        // Member profile
        const memberRes = await memberAPI.getMyProfile();
        setMember(memberRes.data);
        setSubscription(memberRes.data?.currentSubscription || null);

        // Payments
        const paymentsRes = await paymentAPI.getMyPayments();
        setPayments(paymentsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center-gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-600"> Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const trainerProfile =
    (member?.assignedTrainer as any)?.userId?.profile ||
    (member?.assignedTrainer as any)?.profile;

  const trainerName = trainerProfile
    ? `${trainerProfile.firstName || ''} ${
        trainerProfile.lastName || ''
      }`.trim()
    : null;

  console.log('Assigned trainer raw:', member?.assignedTrainer);

  return (
    <MemberLayout>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mt-5">
        {/* PLAN */}
        <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition">
          <div className="flex items-center justify-between gap-2  ">
            <p className="text-sm text-gray-500">Current Plan</p>
            <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center shadow-lg ">
              <span className="text-3xl">💳</span>
            </div>
          </div>

          {subscription ? (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {subscription.plan.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Valid until{' '}
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                  subscription.status
                )}`}
              >
                {subscription.status}
              </span>
            </>
          ) : (
            <p className="text-gray-400">No active subscription</p>
          )}
        </div>

        {/* TRAINER */}
        <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Assigned Trainer</p>

            <div className="h-16 w-16 rounded-2xl bg-indigo-200 flex items-center justify-center shadow-lg ">
              <span className="text-3xl">🏃</span>
            </div>
          </div>

          {trainerName ? (
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                {trainerName[0]}
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {trainerName}
                </p>
                <p className="text-xs text-gray-500">Personal Trainer</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No trainer assigned</div>
          )}
        </div>

        {/* PAYMENTS */}
        <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Total Payments</p>

            <div className="h-16 w-16 rounded-2xl bg-green-200 flex items-center justify-center shadow-lg ">
              <span className="text-3xl">💰</span>
            </div>
          </div>

          <p className="text-3xl font-bold text-green-600">
            ₹
            {payments
              .reduce((sum, p) => sum + (p.amount || 0), 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {payments.length} transactions
          </p>
        </div>
      </div>

      {/* PROGRESS CHART */}
      {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <MemberProgressChart memberId={id!} />
      </div> */}

      {/* SCHEDULE VIEW */}
      <div className="px-6 mt-8">
        <MemberScheduleView />
      </div>

      {/* ACTIONS + PAYMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 mt-10 mb-10">
        {/* QUICK ACTIONS */}
        <div className="rounded-3xl bg-[#1b283b] p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Quick Actions ⚡
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {[
              { to: '/member/trainers', label: 'View Trainers' },
              { to: '/member/subscriptions', label: 'My Subscriptions' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-white text-[#1b283b] font-semibold px-5 py-4 rounded-xl text-center hover:scale-[1.02] transition shadow"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* RECENT PAYMENTS */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            💰 Recent Payments
          </h2>

          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.slice(0, 3).map(payment => (
                <div
                  key={payment._id || payment.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      ₹
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        ₹{payment.amount}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No payments yet</p>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberDashboard;
