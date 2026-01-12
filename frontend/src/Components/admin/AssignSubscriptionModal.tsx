import { useEffect, useState } from 'react';
import { subscriptionAPI } from '../../services/api';
import { useToast } from '../../Context/ToastContext';

const AssignSubscriptionModal = ({
  member,
  onClose,
  onAssigned,
}: {
  member: any;
  onClose: () => void;
  onAssigned: () => void;
}) => {
  const [plans, setPlans] = useState<any>({});
  const [planType, setPlanType] = useState<string>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await subscriptionAPI.getPlans();
        setPlans(res.data || {});
      } catch (e: any) {
        setError('Failed to load plans');
      }
    })();
  }, []);

  const { showToast } = useToast();

  const handleAssign = async () => {
    setError(null);
    setLoading(true);
    try {
      await subscriptionAPI.create({
        memberId: member.id || member._id,
        planType,
        paymentMethod,
      });
      onAssigned();
      onClose();
      showToast('success', 'Subscription assigned');
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to assign';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Assign Subscription</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Plan</label>

            <select
              value={planType}
              onChange={e => setPlanType(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              {Object.keys(plans).map(key => (
                <option key={key} value={key}>
                  {plans[key].name} - ₹{plans[key].price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={loading}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignSubscriptionModal;
