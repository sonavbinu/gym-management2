import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { trainerAPI } from '../../services/api';
import TrainerForm from './TrainerForm';
import type { Trainer } from '../../types';

const TrainersPage = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | undefined>(undefined);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await trainerAPI.getAll();
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-600">
              Loading Trainers...
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
              🏃 Trainers Management
            </h2>
            <p className="text-gray-500 mt-1">
              Manage your gym's training staff
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTrainer(undefined);
              setShowTrainerForm(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            <span>Add Trainer</span>
          </button>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer, index) => (
            <div
              key={trainer._id || trainer.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Trainer Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-6">
                  🏃
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {trainer.userId.profile.firstName}{' '}
                    {trainer.userId.profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {trainer.userId.email}
                  </p>
                </div>
              </div>

              {/* Trainer Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
                    Experience
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {trainer.experience} <span className="text-sm">yrs</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">
                    Members
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {trainer.assignedMembers.length}
                  </p>
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-6">
                <p className="text-gray-700 font-bold mb-3 flex items-center gap-2">
                  <span>💪</span>
                  <span>Specializations</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-lg text-xs font-bold uppercase tracking-wide border border-purple-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {trainer.certifications.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-700 font-bold mb-3 flex items-center gap-2">
                    <span>🎓</span>
                    <span>Certifications</span>
                  </p>
                  <ul className="space-y-2">
                    {trainer.certifications.map((cert, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => {
                    setSelectedTrainer(trainer);
                    setShowTrainerForm(true);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold transition-all"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {trainers.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏃</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Trainers Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first trainer
            </p>
            <button
              onClick={() => {
                setSelectedTrainer(undefined);
                setShowTrainerForm(true);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              ➕ Add First Trainer
            </button>
          </div>
        )}
      </div>


      {showTrainerForm && (
        <TrainerForm
          initialData={selectedTrainer}
          onClose={() => {
            setShowTrainerForm(false);
            setSelectedTrainer(undefined);
          }}
          onSaved={async () => {
            setShowTrainerForm(false);
            setSelectedTrainer(undefined);
            await fetchTrainers();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default TrainersPage;
