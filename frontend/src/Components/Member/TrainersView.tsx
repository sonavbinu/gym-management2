import { useEffect, useState } from 'react';
import { trainerAPI } from '../../services/api';
import { Trainer } from '../../types';
import DashboardLayout from '../layout/DashboardLayout';
import MemberLayout from '../layout/MemberLayout';
import { useNavigate } from 'react-router-dom';

const TrainersView = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const response = await trainerAPI.getAll();
        setTrainers(response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold"> Loading Trainers...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between items-center p-2 ">
          <h1 className="text-3xl font-bold text-gray-800 ">Our Trainers</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full ">
            {trainers.map(trainer => {
              const user = trainer.userId;
              const name = `${user?.profile?.firstName || 'Unknown'} ${
                user?.profile?.lastName || ''
              }`;

              return (
                <div
                  key={trainer.id}
                  onClick={() =>
                    navigate(
                      `/member/trainers/${trainer.id || (trainer as any)._id}`
                    )
                  }
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl translate-y-2 transition-all duration-300 transform border-gray-100 cursor-pointer group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-2xl mb-4 hover:rotate-6 shadow-lg">
                      🏃
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                    <hr />

                    <div className="w-full space-y-3">
                      <div className="flex flex-col">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                          <span className="text-xl"> 🏋️</span>
                          Specialization
                        </p>
                        <div className="flex flex-wrap gap-1 font-bold">
                          {trainer.specialization?.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded "
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          <span className="text-xl">💼</span>
                          Experience
                        </p>
                        <p className="text-sm font-medium">
                          {trainer.experience} years
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          <span className="text-xl">👤</span> Assigned Members
                        </p>
                        <p className="text-sm font-medium bg-green-50">
                          {trainer.assignedMembers?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {trainers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No trainers available at the moment.
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default TrainersView;
