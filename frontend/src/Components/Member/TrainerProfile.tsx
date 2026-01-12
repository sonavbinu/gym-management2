import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trainerAPI } from '../../services/api';
import { Trainer } from '../../types';
import MemberLayout from '../layout/MemberLayout';

const TrainerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true);
        const response = await trainerAPI.getById(id!);
        setTrainer(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load trainer profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [id]);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MemberLayout>
    );
  }

  if (error || !trainer) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-red-50 rounded-3xl text-center border border-red-100">
          <p className="text-red-600 font-bold mb-4">
            {error || 'Trainer not found'}
          </p>
          <button
            onClick={() => navigate('/member/trainers')}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            Back to Trainers
          </button>
        </div>
      </MemberLayout>
    );
  }

  const user = trainer.userId;
  const profile = user?.profile;
  const name = `${profile?.firstName || 'Unknown'} ${profile?.lastName || ''}`;

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/member/trainers')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition group curdor-pointer"
        >
          <span className="cursor-pointer">Go back to Our Trainers</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            {/* Profile Image Overlay */}
            <div className="absolute -bottom-16 left-12 w-32 h-32 bg-white rounded-3xl p-2 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-4xl font-black text-slate-400">
                {profile?.firstName?.[0]}
                {profile?.lastName?.[0]}
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
                  Expert Personal Trainer
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm text-slate-600 font-medium">
                    <span>📧</span> {user?.email}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm text-slate-600 font-medium">
                    <span>📞</span> {profile?.phone || 'Not available'}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100">
                  <p className="text-2xl font-black text-blue-700">
                    {trainer.experience}
                  </p>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5">
                    Years exp.
                  </p>
                </div>
                <div className="text-center bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100">
                  <p className="text-2xl font-black text-indigo-700">
                    {trainer.assignedMembers?.length || 0}
                  </p>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">
                    Members
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {/* Specializations */}
                <section>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 font-black italic tracking-tight">
                    <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm not-italic">
                      ⚡
                    </span>
                    Expertise & Focus
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {trainer.specialization?.map((spec, idx) => (
                      <span
                        key={idx}
                        className="bg-white border-2 border-slate-900 px-6 py-3 rounded-2xl font-black text-slate-900 hover:bg-slate-900 hover:text-white transition duration-300"
                      >
                        {spec}
                      </span>
                    )) || <p className="text-slate-400">General Training</p>}
                  </div>
                </section>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-[#1e293b] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <h4 className="text-xl font-black mb-6 italic tracking-tight uppercase">
                    Coach Bio
                  </h4>
                  <p className="text-slate-400 leading-relaxed font-medium italic">
                    "Helping you unlock your full potential through disciplined
                    training and expert guidance. Let's hit those goals
                    together."
                  </p>

                  <div className="mt-8 pt-8 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-4">
                      Coach Since
                    </p>
                    <p className="text-lg font-bold">
                      {new Date(trainer.joinDate).toLocaleDateString(
                        undefined,
                        { month: 'long', year: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default TrainerProfile;
