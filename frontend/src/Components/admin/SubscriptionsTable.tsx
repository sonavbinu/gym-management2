import { useEffect, useState } from 'react';
import { subscriptionAPI } from '../../services/api';
import AssignToMemberModal from './AssignToMemberModal';
import PlanForm from './PlanForm';
import ConfirmDialog from './ConfirmDialog';

const SubscriptionsTable = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await subscriptionAPI.getPlans();
        const data = res.data || {};
        // normalize: backend returns an object keyed by plan type
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          setPlans(
            Object.keys(data).map(k => ({ key: k, ...(data as any)[k] }))
          );
        }
      } catch (e: any) {
        setError(
          e.response?.data?.message || e.message || 'Failed to load plans'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [search, setSearch] = useState('');
  const [assignPlan, setAssignPlan] = useState<{
    key: string;
    plan: any;
  } | null>(null);

  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<any | null>(null);

  if (loading) return <div>Loading plans...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!plans.length) return <div>No subscription plans found</div>;

  const filtered = plans.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      String(p.duration || '')
        .toLowerCase()
        .includes(q) ||
      String(p.price || '')
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Subscription Plans</h2>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2"
            placeholder="Search plans..."
          />
          <button
            onClick={() => setEditingPlan({})}
            className="px-3 py-2 rounded bg-green-600 text-white text-sm"
          >
            Add Plan
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-[500px] bg-white rounded-md shadow-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any, idx: number) => (
              <tr
                key={p.id || p._id || idx}
                className="border-t hover:bg-gray-50"
              >
                <td className="py-3 px-4">{p.name}</td>
                <td className="py-3 px-4">{p.duration} days</td>
                <td className="py-3 px-4">₹{p.price}</td>
                <td className="py-3 px-4 flex items-center gap-2">
                  <button
                    onClick={() => setAssignPlan({ key: p.key, plan: p })}
                    className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setEditingPlan(p)}
                    className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingPlan(p)}
                    className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignPlan && (
        <AssignToMemberModal
          planKey={assignPlan.key}
          plan={assignPlan.plan}
          onClose={() => setAssignPlan(null)}
          onAssigned={() => setAssignPlan(null)}
        />
      )}

      {editingPlan !== null && (
        <PlanForm
          initial={editingPlan && editingPlan.key ? undefined : editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={async () => {
            // refresh plans
            try {
              const res = await subscriptionAPI.getPlans();
              const data = res.data || {};
              if (Array.isArray(data)) setPlans(data);
              else
                setPlans(
                  Object.keys(data).map(k => ({ key: k, ...(data as any)[k] }))
                );
            } catch (e) {}
          }}
        />
      )}

      {deletingPlan && (
        <ConfirmDialog
          message={`Delete plan ${deletingPlan.name || deletingPlan.key}?`}
          onConfirm={async () => {
            try {
              if (deletingPlan._id || deletingPlan.id) {
                await subscriptionAPI.deletePlan(
                  deletingPlan._id || deletingPlan.id
                );
              } else {
              }
              const res = await subscriptionAPI.getPlans();
              const data = res.data || {};
              if (Array.isArray(data)) setPlans(data);
              else
                setPlans(
                  Object.keys(data).map(k => ({ key: k, ...(data as any)[k] }))
                );
              setDeletingPlan(null);
            } catch (e: any) {
              setDeletingPlan(null);
            }
          }}
          onCancel={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
};

export default SubscriptionsTable;
