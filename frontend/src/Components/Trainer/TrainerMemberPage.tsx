import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerLayout from '../layout/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { Member, SubscriptionStatus } from '../../types';

const TrainerMembersPage = () => {
  const navigate = useNavigate();
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredMembers = assignedMembers.filter(member => {
    const term = search.toLowerCase();
    const name = `${member.userId?.profile?.firstName || ''} ${
      member.userId?.profile?.lastName || ''
    }`.toLowerCase();
    const email = (member.userId?.email || '').toLowerCase();

    return name.includes(term) || email.includes(term);
  });

  if (loading) {
    return (
      <TrainerLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold"> Members Loading ...</p>
          </div>
        </div>
      </TrainerLayout>
    );
  }

  const activeCount = assignedMembers.filter(
    member => member.currentSubscription?.status === SubscriptionStatus.ACTIVE
  ).length;

  return (
    <TrainerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              👥 My Assigned Members
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your athlete roster and track their progress
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl text-gray-500 mb-2 font-semibold">
              Total Athletes
            </h3>
            <p className="text-3xl font-black text-blue-600">
              {assignedMembers.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl text-gray-500 mb-2 font-semibold">
              Active Plans
            </h3>
            <p className="text-3xl font-black text-green-600">{activeCount}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl text-gray-500 mb-2 font-semibold">
              Inactive
            </h3>
            <p className="text-3xl font-black text-red-500">
              {assignedMembers.length - activeCount}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 Search
          </label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-bold text-slate-700 bg-slate-50/50"
          />
        </div>

        {/* Members List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <div
                key={member.id}
                onClick={() =>
                  navigate(
                    `/trainer/members/${member.id || (member as any)._id}`
                  )
                }
                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 flex-1 w-full text-center md:text-left">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center text-3xl font-black text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
                    {member.userId?.profile?.firstName?.[0]}
                    {member.userId?.profile?.lastName?.[0]}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                      <h3 className="text-2xl font-black text-slate-900 ">
                        {member.userId?.profile?.firstName}{' '}
                        {member.userId?.profile?.lastName}
                      </h3>
                      <div className="flex justify-center md:justify-start gap-2">
                        {member.currentSubscription?.status ===
                        SubscriptionStatus.ACTIVE ? (
                          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-50 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
                            {member.currentSubscription?.status || 'Inactive'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          Joined
                        </p>
                        <p className="font-bold text-slate-700">
                          {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          Height
                        </p>
                        <p className="font-bold text-slate-700">
                          {member.personalInfo?.height
                            ? `${member.personalInfo.height} cm`
                            : '—'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          Weight
                        </p>
                        <p className="font-bold text-slate-700">
                          {member.personalInfo?.weight
                            ? `${member.personalInfo.weight} kg`
                            : '—'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          Goal
                        </p>
                        <p className="font-bold text-blue-600 truncate max-w-[100px]">
                          {member.personalInfo?.goal || 'General'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                  {member.currentSubscription?.status ===
                    SubscriptionStatus.ACTIVE && (
                    <div className="text-center md:text-right px-4">
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {member.currentSubscription.plan.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Ends{' '}
                        {new Date(
                          member.currentSubscription.endDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {member.currentSubscription &&
                    member.currentSubscription.status !==
                      SubscriptionStatus.ACTIVE && (
                      <div className="text-center md:text-right px-4 opacity-50">
                        <p className="text-xs font-black text-slate-400 leading-tight italic line-through">
                          {member.currentSubscription.plan.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {member.currentSubscription.status}
                        </p>
                      </div>
                    )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(
                        `/trainer/members/${member.id || (member as any)._id}`
                      );
                    }}
                    className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-sm shadow-xl shadow-slate-200"
                  >
                    Manage Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Members Found
              </h3>
              <p className="text-gray-500">
                {search
                  ? 'Try adjusting your search criteria.'
                  : 'No assigned members yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </TrainerLayout>
  );
};

export default TrainerMembersPage;
