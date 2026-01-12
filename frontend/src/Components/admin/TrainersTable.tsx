import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trainer } from '../../types';

interface TrainersTableProps {
  trainers: Trainer[];
  onEdit?: (trainer: Trainer) => void;
  onDelete?: (trainer: Trainer) => void;
  search?: string;
}

const TrainersTable = ({
  trainers,
  onEdit,
  onDelete,
  search = '',
}: TrainersTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, trainers]);

  if (!trainers.length) {
    return (
      <div className="text-center py-12 text-gray-500">No trainers found.</div>
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

  const totalPages = Math.ceil(trainers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrainers = trainers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] bg-white rounded-md shadow-sm">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left">Trainer</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Specialization</th>
            <th className="py-3 px-4 text-left">Experience</th>
            <th className="py-3 px-4 text-left">Assigned Members</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTrainers.map(t => {
            const trainer = t as any;
            const user = trainer.userId || trainer.user;
            const name = `${user?.profile?.firstName || 'Unknown'} ${
              user?.profile?.lastName || ''
            }`;
            const initials =
              (user?.profile?.firstName?.[0] || 'T') +
              (user?.profile?.lastName?.[0] || '');

            const assignedCount = trainer.assignedMembers?.length || 0;
            const specializations =
              trainer.specialization?.join(', ') || 'None';

            return (
              <tr
                key={trainer._id || trainer.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
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

                <td className="py-3 px-4 text-sm">
                  <div className="max-w-xs truncate" title={specializations}>
                    {specializations}
                  </div>
                </td>

                <td className="py-3 px-4 text-sm font-medium">
                  {trainer.experience || 0} years
                </td>

                <td className="py-3 px-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {assignedCount} {assignedCount === 1 ? 'member' : 'members'}
                  </span>
                </td>

                <td className="py-3 px-4 space-x-2">
                  <Link
                    to={`/admin/trainers/${trainer._id || trainer.id}`}
                    className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200"
                  >
                    View
                  </Link>

                  {onEdit && (
                    <button
                      onClick={() => onEdit(trainer)}
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(trainer)}
                      className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
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
            {Math.min(startIndex + itemsPerPage, trainers.length)} of{' '}
            {trainers.length} trainers
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

export default TrainersTable;
