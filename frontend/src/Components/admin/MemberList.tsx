import { useEffect, useState, useMemo, useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { memberAPI } from '../../services/api';
import MembersTable from './MembersTable';
import MemberForm from './MemberForm';
import ConfirmDialog from './ConfirmDialog';
import AssignSubscriptionModal from './AssignSubscriptionModal';
import AssignTrainerModal from './AssignTrainerModal';
import { useToast } from '../../Context/ToastContext';
import MemberLayout from '../layout/TrainerLayout';

const PAGE_SIZE = 10;

const MemberList = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState<any | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<any | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  // assign trainer state
  const [assignTrainerTarget, setAssignTrainerTarget] = useState<any | null>(
    null
  );
  const [showAssignTrainer, setShowAssignTrainer] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberAPI.getAll();
      setMembers(res.data || []);
    } catch (e: any) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load members'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter(m => {
      const user = m.userId || m.user;
      return (
        user?.profile?.firstName?.toLowerCase().includes(q) ||
        user?.profile?.lastName?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q)
      );
    });
  }, [members, debouncedSearch]);

  // Reset page ..
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = () => {
    setFormInitial(null);
    setShowForm(true);
  };

  const handleEdit = useCallback((m: any) => {
    setFormInitial(m);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((m: any) => {
    setConfirmTarget(m);
    setShowConfirm(true);
  }, []);

  const { showToast } = useToast();

  const handleAssign = useCallback((m: any) => {
    setAssignTarget(m);
    setShowAssign(true);
  }, []);

  const handleAssignTrainer = useCallback((m: any) => {
    setAssignTrainerTarget(m);
    setShowAssignTrainer(true);
  }, []);

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await memberAPI.delete(confirmTarget.id || confirmTarget._id);
      setShowConfirm(false);
      setConfirmTarget(null);
      await fetchMembers();
      showToast('success', 'Member deleted');
    } catch (e: any) {
      showToast(
        'error',
        e.response?.data?.message || e.message || 'Delete failed'
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const onSaved = async (msg?: string) => {
    await fetchMembers();
    if (msg) showToast('success', msg);
  };

  return (
    <MemberLayout>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Members</h1>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Search members..."
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Add Member
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="p-6 bg-white rounded shadow text-gray-600">
                No members match your search.
                <div className="mt-2">
                  <button
                    onClick={() => setSearch('')}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
              <MembersTable
                members={pageItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAssign={handleAssign}
                onAssignTrainer={handleAssignTrainer}
                search={search}
              />
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded"
                  disabled={page === 1}
                >
                  Prev
                </button>
                <div className="px-3 py-1">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border rounded"
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {showForm && (
          <MemberForm
            initialData={formInitial || undefined}
            onClose={() => setShowForm(false)}
            onSaved={onSaved}
          />
        )}
        {showConfirm && confirmTarget && (
          <ConfirmDialog
            message={`Delete member ${
              confirmTarget.userId?.profile?.firstName ||
              confirmTarget.user?.profile?.firstName
            }?`}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirm(false)}
            isLoading={confirmLoading}
          />
        )}
        {showAssign && assignTarget && (
          <AssignSubscriptionModal
            member={assignTarget}
            onClose={() => setShowAssign(false)}
            onAssigned={async () => {
              setShowAssign(false);
              await fetchMembers();
              showToast('success', 'Subscription assigned');
            }}
          />
        )}

        {showAssignTrainer && assignTrainerTarget && (
          <AssignTrainerModal
            member={assignTrainerTarget}
            onClose={() => setShowAssignTrainer(false)}
            onAssigned={async () => {
              setShowAssignTrainer(false);
              await fetchMembers();
              showToast('success', 'Trainer assigned');
            }}
          />
        )}
      </div>
    </MemberLayout>
  );
};
export default MemberList;
