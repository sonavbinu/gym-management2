import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Member } from '../../types';

const MembersTable = ({
  members,
  onEdit,
  onDelete,
  onAssign,
  onAssignTrainer,
  search = '',
}: {
  members: Member[];
  onEdit?: (m: any) => void;
  onDelete?: (m: any) => void;
  onAssign?: (m: any) => void;
  onAssignTrainer?: (m: any) => void;
  search?: string;
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, members]);

  if (!members.length) {
    return (
      <div className="text-center py-12 text-gray-500">No members found.</div>
    );
  }

  const highlight = (text = '') => {
    if (!search.trim()) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200">
          {text.slice(idx, idx + search.length)}
        </mark>
        {text.slice(idx + search.length)}
      </>
    );
  };

  const totalPages = Math.ceil(members.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = members.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] bg-white rounded-md shadow-sm">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left">Member</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Trainer</th>
            <th className="py-3 px-4 text-left">Joined</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMembers.map(m => {
            const member = m as any;
            const user = member.userId || member.user;
            const name = `${user?.profile?.firstName || 'Unknown'} ${
              user?.profile?.lastName || ''
            }`;
            const initials =
              (user?.profile?.firstName?.[0] || 'U') +
              (user?.profile?.lastName?.[0] || '');

            const rawStatus = member.currentSubscription?.status;
            const status = rawStatus
              ? String(rawStatus).toUpperCase()
              : 'INACTIVE';

            return (
              <tr
                key={member._id || member.id}
                onClick={() => navigate(`/admin/members/${member._id || member.id}`)}
                className="border-t hover:bg-indigo-50/50 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium group-hover:bg-indigo-200 transition-colors">
                    {initials}
                  </div>
                  <div>
                    <div className="font-medium">{highlight(name)}</div>
                    <div className="text-sm text-gray-500">
                      {user?.profile?.phone || ''}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-sm">
                  {highlight(user?.email || '—')}
                </td>

                <td className="py-3 px-4 text-sm font-medium">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {status}
                  </span>
                </td>

                <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                  {member.assignedTrainer ? (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold">
                        {(
                          member.assignedTrainer.userId?.profile?.firstName?.[0] ||
                          'T'
                        ).toUpperCase()}
                      </span>
                      <span>
                        {member.assignedTrainer.userId?.profile?.firstName ||
                          'Unknown'}{' '}
                        {member.assignedTrainer.userId?.profile?.lastName || ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No trainer</span>
                  )}
                </td>

                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(
                    member.joinDate || member.createdAt || Date.now()
                  ).toLocaleDateString()}
                </td>

                <td className="py-3 px-4 space-x-2" onClick={e => e.stopPropagation()}>
                  <Link
                    to={`/admin/members/${member._id || member.id}`}
                    className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded hover:bg-indigo-200 transition-colors"
                  >
                    View
                  </Link>

                  {onAssign && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onAssign(member);
                      }}
                      className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                    >
                      Assign
                    </button>
                  )}

                  {onAssignTrainer && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onAssignTrainer(member);
                      }}
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Assign Trainer
                    </button>
                  )}

                  {onEdit && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(member);
                      }}
                      className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(member);
                      }}
                      className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, members.length)} of{' '}
            {members.length} members
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
import { memo } from 'react';

export default memo(MembersTable);
