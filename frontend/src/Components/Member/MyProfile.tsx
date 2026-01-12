import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../layout/MemberLayout';
import { memberAPI } from '../../services/api';
import { Member, SubscriptionStatus } from '../../types';

const MyProfile = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await memberAPI.getMyProfile();
        setMember(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium tracking-wide">
              Syncing Profile...
            </p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error || !member) {
    return (
      <MemberLayout>
        <div className="max-w-xl mx-auto mt-12 p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800">Connection Error</h2>
          <p className="text-red-600 mt-2">
            {error || 'Could not load profile details'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
          >
            Retry Sync
          </button>
        </div>
      </MemberLayout>
    );
  }

  const user = member.userId;
  const profile = user?.profile;
  const currentSub = member.currentSubscription;

  const calculateBMI = (h?: number, w?: number) => {
    if (!h || !w) return null;
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI(
    member.personalInfo?.height,
    member.personalInfo?.weight
  );

  return (
    <MemberLayout>
      <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
        {/* Profile Header */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mt-32 opacity-50"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-4xl font-bold text-white shadow-2xl transform rotate-3">
              {profile?.firstName?.[0]}
              {profile?.lastName?.[0]}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-indigo-600 font-bold mt-1 uppercase tracking-wide text-xs">
                Premium Member Since {new Date(member.joinDate).getFullYear()}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-sm">📧</span>
                  <span className="text-slate-700 font-medium text-sm">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-sm">📞</span>
                  <span className="text-slate-700 font-medium text-sm">
                    {profile?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/member/settings"
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-1"
            >
              Update Profile ⚙️
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Membership Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 h-full">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">💎</span> Membership Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100">
                  <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-2">
                    Active Plan
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-tight">
                    {currentSub?.plan.name || 'No Active Plan'}
                  </p>
                  {currentSub && (
                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          currentSub.status === SubscriptionStatus.ACTIVE
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {currentSub.status}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">
                    Valdity
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-800 font-bold">
                      Starts:{' '}
                      <span className="text-slate-500 font-medium">
                        {currentSub
                          ? new Date(currentSub.startDate).toLocaleDateString()
                          : '—'}
                      </span>
                    </p>
                    <p className="text-slate-800 font-bold">
                      Ends:{' '}
                      <span className="text-slate-500 font-medium">
                        {currentSub
                          ? new Date(currentSub.endDate).toLocaleDateString()
                          : '—'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <Link
                  to="/member/subscriptions"
                  className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 text-sm"
                >
                  View Full Membership History
                </Link>
              </div>
            </div>
          </div>

          {/* Trainer Card */}
          <div className="bg-[#1e293b] rounded-[2rem] p-8 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <span className="text-2xl">🏃</span> Expert Guidance
            </h3>

            {member.assignedTrainer ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-4 flex items-center justify-center text-3xl font-black shadow-lg">
                  {(member.assignedTrainer as any).userId?.profile
                    ?.firstName?.[0] || 'T'}
                </div>
                <h4 className="text-xl font-black tracking-tight">
                  {(member.assignedTrainer as any).userId?.profile?.firstName}{' '}
                  {(member.assignedTrainer as any).userId?.profile?.lastName}
                </h4>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] mt-1 mb-6">
                  Personal Coach
                </p>

                <div className="w-full space-y-2 text-left">
                  <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Experience</span>
                    <span className="font-bold text-sm">
                      {(member.assignedTrainer as any).experience || 0}+ Years
                    </span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Specialty</span>
                    <span className="font-bold text-sm truncate ml-4">
                      {(member.assignedTrainer as any).specialization?.[0] ||
                        'General'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center justify-center h-48 opacity-50">
                <p className="text-3xl mb-4">👟</p>
                <p className="font-bold">No trainer assigned</p>
                <p className="text-xs mt-2">Get matched with a pro today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Personal Vitals */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="text-2xl">🦾</span> Body Metrics & Goals
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center gap-1 group hover:border-indigo-200 transition">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Height
              </span>
              <p className="text-3xl font-black text-slate-800">
                {member.personalInfo?.height || '—'}
              </p>
              <span className="text-slate-400 text-xs font-bold uppercase">
                Centimeters
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center gap-1 group hover:border-indigo-200 transition">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Weight
              </span>
              <p className="text-3xl font-black text-slate-800">
                {member.personalInfo?.weight || '—'}
              </p>
              <span className="text-slate-400 text-xs font-bold uppercase">
                Kilograms
              </span>
            </div>

            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center flex flex-col items-center justify-center gap-1 group hover:bg-indigo-600 group-hover:bg-indigo-600 transition duration-300">
              <span className="text-indigo-400 text-xs font-black uppercase tracking-widest group-hover:text-indigo-100 transition">
                Body Mass Index
              </span>
              <p className="text-3xl font-black text-indigo-700 group-hover:text-white transition">
                {bmi || '—'}
              </p>
              <span className="text-indigo-400 text-[10px] font-black uppercase group-hover:text-indigo-200 transition">
                BMI Calculation
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center gap-1 group hover:border-indigo-200 transition">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Goal
              </span>
              <p className="text-xl font-black text-slate-800 truncate px-2">
                {member.personalInfo?.goal || 'General'}
              </p>
              <span className="text-slate-400 text-xs font-bold uppercase">
                Target
              </span>
            </div>
          </div>

          {member.personalInfo?.medicalConditions && (
            <div className="mt-8 bg-red-50 p-6 rounded-[2rem] border border-red-100">
              <div className="flex items-center gap-3 text-red-700 font-bold mb-2">
                <span>🚨</span> Medical Notice
              </div>
              <p className="text-red-600/80 text-sm font-medium leading-relaxed">
                {member.personalInfo.medicalConditions}
              </p>
            </div>
          )}
        </section>
      </div>
    </MemberLayout>
  );
};

export default MyProfile;
