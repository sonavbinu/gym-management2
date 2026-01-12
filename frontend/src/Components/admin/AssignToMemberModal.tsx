import React, { useState, useEffect } from 'react';
import { memberAPI, subscriptionAPI } from '../../services/api';
import { Member, SubscriptionStatus } from '../../types';

interface AssignToMemberModalProps {
  planKey: string;
  plan: any;
  onClose: () => void;
  onAssigned: () => void;
}

const AssignToMemberModal: React.FC<AssignToMemberModalProps> = ({
  planKey,
  plan,
  onClose,
  onAssigned,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.getAll();
        // Filter out members who already have an active subscription
        const availableMembers = (res.data || []).filter(
          (m: any) =>
            m.currentSubscription?.status !== SubscriptionStatus.ACTIVE
        );
        setMembers(availableMembers);
        setFilteredMembers(availableMembers);
      } catch (err) {
        setError('Failed to load members.');
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = members.filter(m => {
      const member = m as any;
      const user = member.userId || member.user;
      const name = `${user?.profile?.firstName || ''} ${
        user?.profile?.lastName || ''
      }`.toLowerCase();
      const email = (user?.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select a member.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        memberId: selectedMemberId,
        paymentMethod: 'cash',
      };
      if (plan._id || plan.id) payload.planId = plan._id || plan.id;
      else payload.planType = planKey;

      await subscriptionAPI.create(payload);
      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">Assign Plan to Member</h2>
        <p className="text-gray-600 mb-4">
          Assigning <span className="font-semibold">{plan.name}</span> plan.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="member-search"
              className="block text-sm font-medium text-gray-700"
            >
              Find Member
            </label>
            <input
              type="text"
              id="member-search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div className="mb-4 max-h-60 overflow-y-auto border rounded-md">
            {filteredMembers.length > 0 ? (
              filteredMembers.map(m => {
                const member = m as any;
                const user = member.userId || member.user;
                const name = `${user?.profile?.firstName || 'Unknown'} ${
                  user?.profile?.lastName || ''
                }`;
                return (
                  <div
                    key={member._id}
                    onClick={() => setSelectedMemberId(member._id)}
                    className={`p-3 cursor-pointer hover:bg-indigo-50 ${
                      selectedMemberId === member._id ? 'bg-indigo-100' : ''
                    }`}
                  >
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                );
              })
            ) : (
              <p className="p-4 text-center text-gray-500">
                No available members found.
              </p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMemberId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? 'Assigning...' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignToMemberModal;
