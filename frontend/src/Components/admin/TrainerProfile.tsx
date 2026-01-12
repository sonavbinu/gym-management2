import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { trainerAPI } from '../../services/api';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../../Context/ToastContext';
import TrainerForm from './TrainerForm';

const TrainerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<any | null>(null);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await trainerAPI.getById(id as string);
        setTrainer(res.data);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            error.message ||
            'Failed to load trainer'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleUnassignMember = async (memberId: string) => {
    try {
      await trainerAPI.unassignMember({
        trainerId: trainer._id || trainer.id,
        memberId: memberId,
      });
      // Refresh trainer data
      const res = await trainerAPI.getById(trainer._id || trainer.id);
      setTrainer(res.data);
      showToast('success', 'Member unassigned successfully');
    } catch (e: any) {
      showToast(
        'error',
        e.response?.data?.message || e.message || 'Unassign failed'
      );
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this trainer permanently?'
      )
    )
      return;
    try {
      await trainerAPI.delete(id!);
      navigate('/admin/trainers');
    } catch (err) {
      alert('Failed to delete trainer');
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-xl font-semibold text-gray-600">
            Loading trainer details...
          </p>
        </div>
      </AdminLayout>
    );

  if (error || !trainer)
    return (
      <AdminLayout>
        <div className="text-red-600 text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Trainer</h2>
          <p>{error || 'Trainer not found'}</p>
        </div>
      </AdminLayout>
    );

  const user = trainer.user || trainer.userId;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              🏃 Trainer Profile
            </h2>
            <p className="text-gray-500 mt-1">
              View and manage trainer details
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <span className="text-xl">🗑️</span>
            <span>Delete Trainer</span>
          </button>
          <button
            onClick={() => setShowEditForm(true)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <span className="text-xl">✏️</span>
            <span>Edit Trainer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.profile?.firstName?.[0]}
                {user?.profile?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </h3>
                <p className="text-gray-500 text-lg">{user?.email}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Trainer since:{' '}
                  {new Date(trainer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {user?.profile?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Experience
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {trainer.experience || 0} years
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Specialization
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialization &&
                    trainer.specialization.length > 0 ? (
                      trainer.specialization.map(
                        (spec: string, index: number) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {spec}
                          </span>
                        )
                      )
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Assigned Members
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {trainer.assignedMembers?.length || 0} members
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            {trainer.certifications && trainer.certifications.length > 0 && (
              <div className="mt-6">
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-2">
                  {trainer.certifications.map((cert: string, index: number) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Members */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span>Assigned Members</span>
            </h3>

            {trainer.assignedMembers && trainer.assignedMembers.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trainer.assignedMembers.map((member: any) => (
                  <div
                    key={member._id || member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {member.userId?.profile?.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {member.userId?.profile?.firstName || 'Unknown'}{' '}
                          {member.userId?.profile?.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.userId?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUnassignTarget(member);
                        setShowUnassignConfirm(true);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Unassign member"
                    >
                      <span className="text-lg">✕</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500 font-medium">No assigned members</p>
                <p className="text-sm text-gray-400 mt-1">
                  Members will appear here when assigned
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Unassign Confirmation Dialog */}
        {showUnassignConfirm && unassignTarget && (
          <ConfirmDialog
            message={`Are you sure you want to unassign ${
              unassignTarget.userId?.profile?.firstName || 'this member'
            } from this trainer?`}
            onConfirm={() => {
              handleUnassignMember(unassignTarget._id || unassignTarget.id);
              setShowUnassignConfirm(false);
              setUnassignTarget(null);
            }}
            onCancel={() => {
              setShowUnassignConfirm(false);
              setUnassignTarget(null);
            }}
          />
        )}

        {/* Edit Form */}
        {showEditForm && (
          <TrainerForm
            initialData={trainer}
            onClose={() => setShowEditForm(false)}
            onSaved={async () => {
              setShowEditForm(false);
              const res = await trainerAPI.getById(id as string);
              setTrainer(res.data);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default TrainerProfile;
