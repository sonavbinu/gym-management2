import { useEffect, useState } from 'react';
import { trainerAPI } from '../../services/api';
import { Trainer } from '../../types';
import TrainerLayout from '../layout/TrainerLayout';

const TrainerMyProfile = () => {
  const [profile, setProfile] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await trainerAPI.getProfile();
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </TrainerLayout>
    );
  }

  if (error || !profile) {
    return (
      <TrainerLayout>
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-red-50 rounded-3xl text-center border border-red-100">
          <p className="text-red-600 font-bold mb-4">
            {error || 'Profile not found'}
          </p>
        </div>
      </TrainerLayout>
    );
  }

  const user = profile.userId;
  const name = `${user?.profile?.firstName || 'Unknown'} ${
    user?.profile?.lastName || ''
  }`;

  return (
    <TrainerLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="absolute inset-0  bg-[#131b2e]"></div>

            {/* Profile Image Overlay */}
            <div className="absolute -bottom-16 left-12 w-32 h-32  rounded-3xl p-2 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white">
                {user?.profile?.firstName?.[0]}
                {user?.profile?.lastName?.[0]}
              </div>
            </div>
          </div>

          <div className="pt-20 px-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {name}
                </h1>
                <p className="text-blue-600 font-bold tracking-widest uppercase text-xs mt-1">
                  Certified Professional Coach
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm text-slate-600 font-medium font-bold">
                    <span>📧</span> {user?.email}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100">
                  <p className="text-2xl font-black text-blue-700">
                    {profile.experience}
                  </p>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5">
                    Years exp.
                  </p>
                </div>
                <div className="text-center bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100">
                  <p className="text-2xl font-black text-indigo-700">
                    {profile.assignedMembers?.length || 0}
                  </p>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">
                    Assigned Members
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
              <div className="space-y-8">
                {/* Specializations */}
                <section>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 ">
                    <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm not-italic">
                      ⚡
                    </span>
                    My Expertise
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.specialization?.map((spec, idx) => (
                      <span
                        key={idx}
                        className="bg-white border-2 border-slate-900 px-6 py-3 rounded-2xl font-black text-slate-900 hover:bg-slate-900 hover:text-white transition duration-300"
                      >
                        {spec}
                      </span>
                    )) || (
                      <p className="text-slate-400 font-bold">
                        General Fitness
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
};

export default TrainerMyProfile;
