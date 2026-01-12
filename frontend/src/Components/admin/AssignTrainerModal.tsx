import { useEffect, useState } from 'react';
import { trainerAPI } from '../../services/api';
import { useToast } from '../../Context/ToastContext';

const AssignTrainerModal = ({
  member,
  onClose,
  onAssigned,
}: {
  member: any;
  onClose: () => void;
  onAssigned: () => void;
}) => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await trainerAPI.getAll();
        setTrainers(res.data || []);
      } catch (e: any) {
        setError('Failed to load trainers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = trainers.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    const user = t.userId || t.user || {};
    const name = `${user.profile?.firstName || ''} ${
      user.profile?.lastName || ''
    }`;
    return (
      name.toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q)
    );
  });

  const handleAssign = async () => {
    if (!selected) return;

    const token = localStorage.getItem('token');
    if (!token) {
      const msg = 'You must be logged in to assign a trainer';
      setError(msg);
      showToast('error', msg);
      return;
    }

    setAssigning(true);
    try {
      await trainerAPI.assignMember({
        trainerId: selected._id || selected.id,
        memberId: member._id || member.id,
      });
      onAssigned();
      onClose();
      showToast('success', 'Trainer assigned to member');
    } catch (e: any) {
      console.error('Assign trainer error:', e);
      const msg = e.response?.data?.message || e.message || 'Assign failed';
      setError(msg);
      showToast('error', msg);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-xl">
        <h3 className="text-lg font-semibold mb-3">Assign Trainer to member</h3>
        <div className="mb-2 text-sm text-gray-700">
          Member:{' '}
          {member.userId?.profile?.firstName ||
            member.user?.profile?.firstName ||
            'Unknown'}
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="mb-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trainers..."
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="max-h-64 overflow-y-auto border rounded p-2">
          {loading ? (
            <div>Loading trainers...</div>
          ) : (
            filtered.map(t => {
              const user = t.userId || t.user || {};
              return (
                <div
                  key={t.id || t._id}
                  onClick={() => setSelected(t)}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                    selected === t ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium">
                      {user.profile?.firstName || 'Unknown'}{' '}
                      {user.profile?.lastName || ''}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  {selected === t && (
                    <div className="text-sm text-indigo-600">Selected</div>
                  )}
                </div>
              );
            })
          )}
          {!loading && !filtered.length && <div>No trainers found</div>}
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || assigning}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTrainerModal;
