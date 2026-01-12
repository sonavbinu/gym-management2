import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { trainerAPI } from '../../services/api';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../../Context/ToastContext';

const TrainerDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [trainer, setTrainer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<any | null>(null);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await trainerAPI.getById(id as string);
        setTrainer(res.data);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            error.message ||
            'Failed to load trainer'
        );
      }
    })();
  }, [id]);

  if (error)
    return (
      <DashboardLayout>
        <div className="text-red-500">{error}</div>
      </DashboardLayout>
    );

  if (!trainer)
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );

  const user = trainer.user || trainer.userId;
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl mb-2">
          {user?.profile?.firstName || 'Unknown'}{' '}
          {user?.profile?.lastName || ''}
        </h1>
        <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>

        <div className="mt-4">
          <h2 className="text-lg font-medium">Assigned Members</h2>
          {trainer.assignedMembers && trainer.assignedMembers.length ? (
            <ul className="list-disc pl-6">
              {trainer.assignedMembers.map((m: any) => (
                <li
                  key={m._id || m.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    {m.userId?.profile?.firstName ||
                      m.user?.profile?.firstName ||
                      'Unknown'}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setUnassignTarget(m);
                        setShowUnassignConfirm(true);
                      }}
                      className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded"
                    >
                      Unassign
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>No assigned members</div>
          )}
        </div>

        {showUnassignConfirm && unassignTarget && (
          <ConfirmDialog
            message={`Unassign member ${
              unassignTarget.userId?.profile?.firstName ||
              unassignTarget.user?.profile?.firstName
            }?`}
            onConfirm={async () => {
              try {
                await trainerAPI.unassignMember({
                  trainerId: trainer._id || trainer.id,
                  memberId: unassignTarget._id || unassignTarget.id,
                });
                // refetch trainer
                const res = await trainerAPI.getById(trainer._id || trainer.id);
                setTrainer(res.data);
                setShowUnassignConfirm(false);
                setUnassignTarget(null);
                showToast('success', 'Member unassigned');
              } catch (e: any) {
                showToast(
                  'error',
                  e.response?.data?.message || e.message || 'Unassign failed'
                );
                setShowUnassignConfirm(false);
                setUnassignTarget(null);
              }
            }}
            onCancel={() => setShowUnassignConfirm(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrainerDetail;
