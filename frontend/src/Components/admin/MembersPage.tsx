import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberForm from './MemberForm';
import AdminLayout from '../layout/AdminLayout';
import { memberAPI, trainerAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { UserRole, SubscriptionStatus } from '../../types';
import type { Member, Trainer } from '../../types';

const MembersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  // const isTrainer = user?.role === UserRole.TRAINER;

  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, trainersRes] = await Promise.all([
        memberAPI.getAll(),
        trainerAPI.getAll(),
      ]);
      setMembers(membersRes.data);
      setTrainers(trainersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTrainer = async () => {
    if (!selectedMember || !selectedTrainer) return;

    const memberId = selectedMember.id || (selectedMember as any)._id;
    const trainerId = selectedTrainer;

    console.log('Assigning trainer:', { trainerId, memberId, selectedMember });

    if (!memberId || !trainerId) {
      alert('Invalid member or trainer ID');
      return;
    }

    try {
      await trainerAPI.assignMember({
        trainerId,
        memberId,
      });
      alert('Trainer assigned successfully!');
      setShowAssignModal(false);
      setSelectedTrainer('');
      fetchData();
    } catch (error) {
      console.error('Failed to assign trainer:', error);
      alert('Failed to assign trainer');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      await memberAPI.delete(id);
      alert('Member deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-600">
              Loading Members...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 ">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              👥 {isAdmin ? 'Members Management' : 'All Members'}
            </h2>
            <p className="text-gray-500 mt-1">
              {isAdmin
                ? 'Manage and track all gym members'
                : 'View all gym members'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowMemberForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              <span>Add Member</span>
            </button>
          )}
        </div>

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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
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
                  {members.filter(m => m.currentSubscription).length}
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
                  {members.filter(m => !m.currentSubscription).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                ⏸️
              </div>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <div
              key={member.id || (member as any)._id}
              onClick={() =>
                navigate(`/admin/members/${member.id || (member as any)._id}`)
              }
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Member Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-6 group-hover:rotate-0 transition-transform">
                  {member.userId.profile.firstName[0]}
                  {member.userId.profile.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {member.userId.profile.firstName}{' '}
                    {member.userId.profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{member.userId.email}</p>
                </div>
              </div>

              {/* Member Info */}
              <div className="space-y-4 mb-6">
                {/* Trainer */}
                <div>
                  <p className="text-gray-700 font-bold mb-2 flex items-center gap-2">
                    <span>🏃</span>
                    <span>Assigned Trainer</span>
                  </p>
                  {member.assignedTrainer ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-700 font-medium">
                        {(member.assignedTrainer as any).userId?.profile
                          ?.firstName || 'Assigned'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      <span className="text-gray-400">Not assigned</span>
                    </div>
                  )}
                </div>

                {/* Subscription Status */}
                <div>
                  <p className="text-gray-700 font-bold mb-2 flex items-center gap-2">
                    <span>💳</span>
                    <span>Subscription</span>
                  </p>
                  {member.currentSubscription?.status ===
                  SubscriptionStatus.ACTIVE ? (
                    <span className="inline-block px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">
                      {member.currentSubscription?.status || 'Inactive'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedMember(member);
                    setShowAssignModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>🏃</span>
                  <span>Assign</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteMember(member.id || (member as any)._id);
                  }}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Members Yet
            </h3>
            <p className="text-gray-500">
              Start by adding your first gym member!
            </p>
          </div>
        )}
      </div>

      {/* Assign Trainer Modal */}
      {isAdmin && showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all animate-slideUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                🏃
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Assign Trainer
              </h3>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">
                Assigning trainer to:
              </p>
              <p className="font-bold text-gray-800 text-lg">
                {selectedMember?.userId.profile.firstName}{' '}
                {selectedMember?.userId.profile.lastName}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Trainer
              </label>
              <select
                value={selectedTrainer}
                onChange={e => setSelectedTrainer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
              >
                <option value="">Choose a trainer...</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.userId.profile.firstName}{' '}
                    {trainer.userId.profile.lastName} -{' '}
                    {trainer.specialization.join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignTrainer}
                disabled={!selectedTrainer}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:cursor-not-allowed"
              >
                ✓ Assign Trainer
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Form Modal */}
      {isAdmin && showMemberForm && (
        <MemberForm
          initialData={editingMember || undefined}
          onClose={() => {
            setShowMemberForm(false);
            setEditingMember(null);
          }}
          onSaved={async (msg?: string) => {
            setShowMemberForm(false);
            setEditingMember(null);
            await fetchData();
            if (msg) alert(msg);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default MembersPage;
