import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import MemberLayout from '../layout/TrainerLayout';

const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/members/${id}`);
        setMember(res.data);
      } catch (e: any) {
        setError(
          e.response?.data?.message || e.message || 'Failed to load member'
        );
      }
    })();
  }, [id]);

  if (error)
    return (
      <MemberLayout>
        <div className="text-red-500">{error}</div>
      </MemberLayout>
    );

  if (!member)
    return (
      <MemberLayout>
        <div>Loading...</div>
      </MemberLayout>
    );

  const user = member.user || member.userId;

  return (
    <MemberLayout>
      <div>
        <h1>
          {user?.profile?.firstName || 'Unknown'}{' '}
          {user?.profile?.lastName || ''}
        </h1>
        <p>{user?.email || 'No email'}</p>
      </div>
    </MemberLayout>
  );
};

export default MemberDetail;
