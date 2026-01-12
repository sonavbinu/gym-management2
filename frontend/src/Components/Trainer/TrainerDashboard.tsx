import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerLayout from '../layout/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { Member, SubscriptionStatus } from '../../types';

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedMembers = async () => {
      try {
        setLoading(true);
        const response = await trainerAPI.getMyAssignedMembers();
        setAssignedMembers(response.data);
      } catch (err: any) {
        console.error('Failed to load assigned members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedMembers();
  }, []);

  if (loading) {
    return (
      <TrainerLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold"> Loading ...</p>
          </div>
        </div>
      </TrainerLayout>
    );
  }

  const activeSubscriptions = assignedMembers.filter(
    member => member.currentSubscription?.status === SubscriptionStatus.ACTIVE
  ).length;

  const totalMembers = assignedMembers.length;

  return (
    <TrainerLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">
          Trainer Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl text-gray-500 font-semibold  mb-2">
              Assigned Members
            </h3>
            <p className="text-4xl font-black text-blue-600">{totalMembers}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl text-gray-500 font-semibold mb-2">
              Active Plans
            </h3>
            <p className="text-4xl font-black text-green-600">
              {activeSubscriptions}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl text-gray-500 font-semibold mb-2">
              Inactive
            </h3>
            <p className="text-4xl font-black text-red-500">
              {totalMembers - activeSubscriptions}
            </p>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-xl font-bold text-slate-900 ">
              Assigned Members
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {assignedMembers.length > 0 ? (
              assignedMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() =>
                    navigate(
                      `/trainer/members/${member.id || (member as any)._id}`
                    )
                  }
                  className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:scale-110 transition-transform">
                      {member.userId?.profile?.firstName?.[0]}
                      {member.userId?.profile?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {member.userId?.profile?.firstName}{' '}
                        {member.userId?.profile?.lastName}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium">
                        {member.userId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      {member.currentSubscription?.status ===
                      SubscriptionStatus.ACTIVE ? (
                        <div>
                          <p className="text-xs uppercase text-green-600 font-bold ">
                            Active - {member.currentSubscription.plan.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Until{' '}
                            {new Date(
                              member.currentSubscription.endDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-red-400 ">
                            {member.currentSubscription?.status || 'No Plan'}
                          </p>
                          {member.currentSubscription && (
                            <p className="text-[10px] text-slate-400 font-bold">
                              {member.currentSubscription.plan.name}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-400 font-bold italic">
                  No members assigned to your roster yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
};

export default TrainerDashboard;
