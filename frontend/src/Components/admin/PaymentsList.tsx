import { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';

const PaymentsList = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setPayments([]);
  }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl mb-4">Payments</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !payments.length && <div>No payments available.</div>}
      </div>
    </AdminLayout>
  );
};

export default PaymentsList;
