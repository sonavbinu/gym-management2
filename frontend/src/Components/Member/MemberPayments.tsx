import { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
// import { useToast } from '../../Context/ToastContext';
import { paymentAPI } from '../../services/api';
import { Payment } from '../../types';
import MemberLayout from '../layout/MemberLayout';

const MemberPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { showToast } = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentAPI.getMyPayments();
      setPayments(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-xl">Loading payments...</p>
          </div>
        </div>
      </DashboardLayout>
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
      <div>
        <h1 className="text-2xl font-bold mb-6">My Payment History</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Invoice Number
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 font-medium">₹{payment.amount}</td>
                  <td className="px-6 py-4 capitalize">{payment.method}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{payment.transactionId}</td>
                  <td className="px-6 py-4">{payment.invoiceNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No payment history found.
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberPayments;
