import { useState, useEffect } from 'react';
import { scheduleAPI, memberAPI } from '../../services/api';

const MemberScheduleView = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    try {
      setLoading(true);
      const profile = await memberAPI.getMyProfile();
      const id = (profile.data as any)._id || profile.data.id;
      setMemberId(id);
      memberId;

      const res = await scheduleAPI.getMemberSchedule(id);
      setSchedules(res.data);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = async (
    scheduleId: string,
    day: string,
    exerciseIndex: number,
    currentStatus: boolean
  ) => {
    try {
      //  update
      const newSchedules = [...schedules];
      const scheduleIdx = newSchedules.findIndex(
        s => (s._id || s.id) === scheduleId
      );
      const routineIdx = newSchedules[scheduleIdx].routines.findIndex(
        (r: any) => r.day === day
      );
      newSchedules[scheduleIdx].routines[routineIdx].exercises[
        exerciseIndex
      ].completed = !currentStatus;
      setSchedules(newSchedules);

      await scheduleAPI.updateExerciseStatus(scheduleId, {
        day,
        exerciseIndex,
        completed: !currentStatus,
      });
    } catch (error) {
      console.error('Failed to update status', error);
      fetchMySchedule();
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading schedule...</div>;

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No Active Schedule
        </h2>
        <p className="text-gray-500">
          Your trainer hasn't assigned a workout schedule yet.
        </p>
      </div>
    );
  }

  // Show latest schedule
  const activeSchedule = schedules[0];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Weekly Workout Plan</h2>
        <p className="opacity-90 text-sm">
          {new Date(activeSchedule.startDate).toLocaleDateString()} -{' '}
          {new Date(activeSchedule.endDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeSchedule.routines.map((routine: any) => {
          const isToday = routine.day === today;
          return (
            <div
              key={routine._id || routine.day}
              className={`bg-white rounded-xl shadow-sm border transaction-all duration-300 ${
                isToday
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-gray-100'
              }`}
            >
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                <h3
                  className={`font-bold ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {routine.day}
                  {isToday && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      TODAY
                    </span>
                  )}
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  {routine.exercises.length} Exercises
                </span>
              </div>
              <div className="p-4">
                {routine.exercises.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Rest Day 💤</p>
                ) : (
                  <div className="space-y-3">
                    {routine.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={ex.completed || false}
                            onChange={() =>
                              toggleExercise(
                                activeSchedule._id || activeSchedule.id,
                                routine.day,
                                idx,
                                ex.completed
                              )
                            }
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-medium transition-colors ${
                              ex.completed
                                ? 'text-gray-400 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {ex.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ex.sets} sets × {ex.reps} reps
                            {ex.weight && (
                              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                {ex.weight}kg
                              </span>
                            )}
                          </div>
                          {ex.notes && (
                            <p className="text-xs text-blue-500 mt-1">
                              {ex.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberScheduleView;
