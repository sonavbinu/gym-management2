import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../../services/api';
import { useToast } from '../../Context/ToastContext';
import MemberLayout from '../layout/MemberLayout';

interface Plan {
  id: string;
  name: string;
  duration: number;
  price: number;
}

const PurchasePlan = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cash'>(
    'card'
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await subscriptionAPI.getPlans();
        console.log('get plans response:', res);

        const plansArray = (res.data || []).map((plan: any) => ({
          id: plan._id,
          name: plan.name,
          duration: plan.duration,
          price: plan.price,
        }));

        setPlans(plansArray);
      } catch (err: any) {
        showToast(
          'error',
          err.response?.data?.message || 'Failed to load plans'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [showToast]);

  const handlePurchase = async () => {
    if (!selectedPlan) {
      showToast('error', 'Please select a plan');
      return;
    }

    try {
      setProcessing(true);

      await subscriptionAPI.subscribeMe({
        planId: selectedPlan,
        paymentMethod,
      });

      showToast('success', 'Subscription activated successfully');
      navigate('/member/subscriptions');
    } catch (err: any) {
      showToast(
        'error',
        err.response?.data?.message || 'Payment failed. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold"> Loading plans...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  const selected = plans.find(p => p.id === selectedPlan);

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🛒Purchase Subscription</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`cursor-pointer border-2 rounded-lg p-6 transition ${
                selectedPlan === plan.id
                  ? 'border-purple-600 bg-purple-50 shadow:xl'
                  : 'border-gray-200 hover:border-purple-300 shadow-2xl hover:shadow-3xl'
              }`}
            >
              <h3 className="text-xl font-bold">💳 {plan.name}</h3>
              <p className="text-3xl font-bold text-purple-600">
                ₹{plan.price}
              </p>
              <p className="text-gray-600">{plan.duration} month(s)</p>
              <p className="text-sm text-gray-500">
                ₹{Math.round(plan.price / plan.duration)}/month
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 ">Payment Details</h2>

          <div className="space-y-2 mb-6">
            {['card', 'upi', 'cash'].map(method => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() =>
                    setPaymentMethod(method as typeof paymentMethod)
                  }
                />
                {method.toUpperCase()}
              </label>
            ))}
          </div>

          <div className="flex justify-between font-semibold border-t pt-4 mb-6">
            <span>Total</span>
            <span className="text-purple-600">₹{selected?.price}</span>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!selectedPlan || processing}
            className="w-full bg-purple-600 text-white py-3 rounded-lg disabled:bg-gray-400 hover:bg-purple-400 cursor-pointer"
          >
            {processing ? 'Processing...' : `Pay ₹${selected?.price}`}
          </button>
        </div>
      </div>
    </MemberLayout>
  );
};

export default PurchasePlan;
