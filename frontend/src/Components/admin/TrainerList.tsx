import { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { trainerAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import TrainerForm from './TrainerForm';
import TrainersTable from './TrainersTable';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../../Context/ToastContext';

const TrainerList = () => {
  const { loading: authLoading } = useAuth();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await trainerAPI.getAll();
        setTrainers(res.data || []);
      } catch (e: any) {
        setError(
          e.response?.data?.message || e.message || 'Failed to load trainers'
        );
        console.error('Failed to load trainers:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (authLoading)
    return (
      <DashboardLayout>
        <div>Loading auth...</div>
      </DashboardLayout>
    );

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await trainerAPI.getAll();
      setTrainers(res.data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const [confirmTarget, setConfirmTarget] = useState<any | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  const [formInitial, setFormInitial] = useState<any | null>(null);

  const filtered = trainers.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    const user = t.userId || t.user || {};
    return (
      (user.profile?.firstName || '').toLowerCase().includes(q) ||
      (user.profile?.lastName || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">Trainers</h1>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Search trainers..."
            />
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Trainer
            </button>
          </div>
        </div>

        {loading && <div>Loading trainers...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div>No trainers found</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <TrainersTable
            trainers={filtered}
            onEdit={t => {
              setShowForm(true);
              setFormInitial(t);
            }}
            onDelete={t => {
              setConfirmTarget(t);
              setShowConfirm(true);
            }}
          />
        )}

        {showForm && (
          <TrainerForm
            initialData={formInitial || undefined}
            onClose={() => {
              setShowForm(false);
              setFormInitial(null);
            }}
            onSaved={async (msg?: string) => {
              await refresh();
              setShowForm(false);
              setFormInitial(null);
              if (msg) showToast('success', msg);
            }}
          />
        )}

        {showConfirm && confirmTarget && (
          <ConfirmDialog
            message={`Delete trainer ${
              confirmTarget.userId?.profile?.firstName ||
              confirmTarget.user?.profile?.firstName
            }?`}
            onConfirm={async () => {
              try {
                await trainerAPI.delete(confirmTarget.id || confirmTarget._id);
                await refresh();
                showToast('success', 'Trainer deleted');
              } catch (e: any) {
                showToast(
                  'error',
                  e.response?.data?.message || e.message || 'Delete failed'
                );
              } finally {
                setShowConfirm(false);
                setConfirmTarget(null);
              }
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrainerList;
