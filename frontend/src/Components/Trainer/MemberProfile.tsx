import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrainerLayout from '../layout/TrainerLayout';
import { memberAPI } from '../../services/api';
import { SubscriptionStatus } from '../../types';
import ScheduleManager from './ScheduleManager';
import MemberProgressChart from '../Shared/MemberProgressChart';

const MemberProfile = () => {
  const { id } = useParams();
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await memberAPI.getById(id!);
        setMember(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load member details'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading)
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-xl font-semibold text-gray-600">
            Loading member details...
          </p>
        </div>
      </TrainerLayout>
    );

  if (error || !member)
    return (
      <TrainerLayout>
        <div className="text-red-600 text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Member</h2>
          <p>{error || 'Member not found'}</p>
        </div>
      </TrainerLayout>
    );

  const user = member.userId || member.user;
  const currentPlan =
    member.currentSubscription?.status === SubscriptionStatus.ACTIVE
      ? member.currentSubscription
      : null;

  return (
    <TrainerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            👤 Member Profile
          </h2>
          <p className="text-gray-500 mt-1">View member details and progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.profile?.firstName?.[0]}
                {user?.profile?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </h3>
                <p className="text-gray-500 text-lg">{user?.email}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Member since:{' '}
                  {new Date(
                    member.joinDate || member.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {user?.profile?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${
                      member.currentSubscription?.status ===
                      SubscriptionStatus.ACTIVE
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.currentSubscription?.status?.toUpperCase() ||
                      'INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Personal Details
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Height</p>
                    <p className="font-medium text-gray-800">
                      {member.personalInfo?.height
                        ? `${member.personalInfo.height} cm`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Weight</p>
                    <p className="font-medium text-gray-800">
                      {member.personalInfo?.weight
                        ? `${member.personalInfo.weight} kg`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Age</p>
                    <p className="font-medium text-gray-800">
                      {member.personalInfo?.age || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Gender</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {member.personalInfo?.gender || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1">
                  Fitness Goal
                </p>
                <p className="text-lg font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                  {member.personalInfo?.goal || 'No goal set'}
                </p>
              </div>

              {member.personalInfo?.medicalConditions && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1 text-red-500">
                    Medical Conditions
                  </p>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700">
                      ⚠️ {member.personalInfo.medicalConditions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription & Progress Card */}
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <span>Current Plan</span>
              </h3>
              {currentPlan ? (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="font-bold text-green-800 mb-2">
                    {currentPlan.plan.name}
                  </p>
                  <p className="text-green-700 font-medium">
                    ₹{currentPlan.plan.price}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Valid until:{' '}
                    {new Date(currentPlan.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Started:{' '}
                    {new Date(currentPlan.startDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500 font-medium">
                    No active subscription
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Member needs to purchase a plan
                  </p>
                </div>
              )}
            </div>

            {/* Training Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <MemberProgressChart memberId={id!} />
            </div>
          </div>
        </div>

        {/* Schedule Manager */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <ScheduleManager memberId={id!} />
        </div>

      </div>
    </TrainerLayout>
  );
};

export default MemberProfile;
