import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { memberAPI, trainerAPI } from '../../services/api';
import TrainerForm from './TrainerForm';
import MemberForm from './MemberForm';
import { type Trainer, type Member, SubscriptionStatus } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [membersRes, trainersRes] = await Promise.all([
        memberAPI.getAll(),
        trainerAPI.getAll(),
      ]);

      setMembers(membersRes.data || []);
      setTrainers(trainersRes.data || []);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeSubscriptions = members.filter(
    m => m.currentSubscription?.status === SubscriptionStatus.ACTIVE
  ).length;

  const filteredMembers = members.filter(m => {
    const term = search.toLowerCase();
    const member = m as any;
    const user = member.userId || member.user;
    const email = (user?.email || '').toLowerCase();
    const firstName = (user?.profile?.firstName || '').toLowerCase();
    const lastName = (user?.profile?.lastName || '').toLowerCase();

    return (
      email.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term)
    );
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-600">
              Loading Dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              📊 Admin Dashboard
            </h2>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's your gym overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <span className="text-xl">🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Total Members
                </p>
                <p className="text-4xl font-bold mt-2 text-blue-600">
                  {members.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl  flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0  transition-transform">
                👥
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Total Trainers
                </p>
                <p className="text-4xl font-bold mt-2 text-green-600">
                  {trainers.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                🏃
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Active Subscriptions
                </p>
                <p className="text-4xl font-bold mt-2 text-purple-600">
                  {activeSubscriptions}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                ✅
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  Inactive Members
                </p>
                <p className="text-4xl font-bold mt-2 text-orange-600">
                  {members.length - activeSubscriptions}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                ⏸️
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>⚡</span>
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowMemberForm(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <span className="text-4xl">👤</span>
              <span>Add Member</span>
            </button>
            <button
              onClick={() => setShowTrainerForm(true)}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <span className="text-4xl">🏃</span>
              <span>Add Trainer</span>
            </button>
            <button
              onClick={() => navigate('/admin/subscriptions')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <span className="text-4xl">💳</span>
              <span>Manage Subscriptions</span>
            </button>
            <button
              onClick={() => navigate('/admin/revenue')}
              className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <span className="text-4xl">📈</span>
              <span>View Revenue</span>
            </button>
          </div>
        </div>

        {/* Search Members */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>👥</span>
              <span>Recent Members</span>
            </h3>
            <Link
              to="/admin/members"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              <span>View All</span>
            </Link>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Search Members
            </label>
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
            />
          </div>
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.slice(0, 6).map((member, index) => {
                const m = member as any;
                const user = m.userId || m.user;
                const name = `${user?.profile?.firstName || 'Unknown'} ${
                  user?.profile?.lastName || ''
                }`;
                const email = user?.email || 'No email';
                const isActive =
                  m.currentSubscription?.status === SubscriptionStatus.ACTIVE;

                return (
                  <div
                    key={m._id || m.id}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/admin/members/${m._id || m.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {user?.profile?.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{name}</h4>
                        <p className="text-xs text-gray-500">{email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500">No members found</p>
            </div>
          )}
        </div>

        {/* Trainers Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>🏃</span>
              <span>Trainers</span>
            </h3>
            <Link
              to="/admin/trainers"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              <span className="hover:text-underline">View All</span>
            </Link>
          </div>
          {trainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trainers.slice(0, 4).map((trainer, index) => {
                const t = trainer as any;
                const user = t.userId || t.user;
                const name = `${user?.profile?.firstName || 'Unknown'} ${
                  user?.profile?.lastName || ''
                }`;
                const email = user?.email || 'No email';

                return (
                  <div
                    key={t._id || t.id}
                    className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/admin/trainers/${t._id || t.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.profile?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{name}</h4>
                        <p className="text-xs text-gray-500">{email}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        🏋️ Trainer
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏃</div>
              <p className="text-gray-500">No trainers found</p>
            </div>
          )}
        </div>

        {/* Trainer Modal */}
        {showTrainerForm && (
          <TrainerForm
            onClose={() => setShowTrainerForm(false)}
            onSaved={async () => {
              setShowTrainerForm(false);
              await fetchDashboardData();
            }}
          />
        )}

        {/* Member Modal */}
        {showMemberForm && (
          <MemberForm
            onClose={() => setShowMemberForm(false)}
            onSaved={async () => {
              setShowMemberForm(false);
              await fetchDashboardData();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
