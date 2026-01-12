import { useState, useEffect } from 'react';
import { scheduleAPI } from '../../services/api';

interface ScheduleManagerProps {
  memberId: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

interface Routine {
  day: string;
  exercises: Exercise[];
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const ScheduleManager = ({ memberId }: ScheduleManagerProps) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });
  const [routines, setRoutines] = useState<Routine[]>(
    DAYS.map(day => ({ day, exercises: [] }))
  );

  useEffect(() => {
    fetchSchedules();
  }, [memberId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await scheduleAPI.getMemberSchedule(memberId);
      setSchedules(res.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseChange = (
    dayIndex: number,
    exerciseIndex: number,
    field: keyof Exercise,
    value: any
  ) => {
    const newRoutines = [...routines];
    newRoutines[dayIndex].exercises[exerciseIndex] = {
      ...newRoutines[dayIndex].exercises[exerciseIndex],
      [field]: value,
    };
    setRoutines(newRoutines);
  };

  const addExercise = (dayIndex: number) => {
    const newRoutines = [...routines];
    newRoutines[dayIndex].exercises.push({
      name: '',
      sets: 3,
      reps: 10,
    });
    setRoutines(newRoutines);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newRoutines = [...routines];
    newRoutines[dayIndex].exercises.splice(exerciseIndex, 1);
    setRoutines(newRoutines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        memberId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        routines: routines.filter(r => r.exercises.length > 0),
      };
      await scheduleAPI.create(payload);
      setShowForm(false);
      fetchSchedules();
      // Reset form
      setFormData({ startDate: '', endDate: '' });
      setRoutines(DAYS.map(day => ({ day, exercises: [] })));
    } catch (error) {
      console.error('Failed to create schedule', error);
      alert('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <span>Training Schedules</span>
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Assign New Schedule'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={e =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {routines.map((routine, dayIndex) => (
                <div
                  key={routine.day}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">
                      {routine.day}
                    </h4>
                    <button
                      type="button"
                      onClick={() => addExercise(dayIndex)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Exercise
                    </button>
                  </div>

                  {routine.exercises.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Rest Day</p>
                  )}

                  <div className="space-y-3">
                    {routine.exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="grid grid-cols-12 gap-2 items-end"
                      >
                        <div className="col-span-4">
                          <label className="text-xs text-gray-500 block mb-1">
                            Exercise
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Bench Press"
                            value={exercise.name}
                            onChange={e =>
                              handleExerciseChange(
                                dayIndex,
                                exIndex,
                                'name',
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 block mb-1">
                            Sets
                          </label>
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={e =>
                              handleExerciseChange(
                                dayIndex,
                                exIndex,
                                'sets',
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 block mb-1">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={e =>
                              handleExerciseChange(
                                dayIndex,
                                exIndex,
                                'reps',
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs text-gray-500 block mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={exercise.notes || ''}
                            onChange={e =>
                              handleExerciseChange(
                                dayIndex,
                                exIndex,
                                'notes',
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => removeExercise(dayIndex, exIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Schedules */}
      <div className="space-y-4">
        {schedules.map(schedule => (
          <div
            key={schedule._id || schedule.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-gray-800">
                  {new Date(schedule.startDate).toLocaleDateString()} -{' '}
                  {new Date(schedule.endDate).toLocaleDateString()}
                </h4>
                <p className="text-xs text-gray-500">
                  Created on {new Date(schedule.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.routines.map((routine: any) => (
                <div
                  key={routine._id || routine.day}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <h5 className="font-semibold text-gray-700 mb-2 border-b pb-1">
                    {routine.day}
                  </h5>
                  <ul className="text-sm space-y-2">
                    {routine.exercises.map((ex: any, idx: number) => (
                      <li key={idx}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              ex.completed
                                ? 'text-gray-400 line-through'
                                : 'text-gray-900'
                            }`}
                          >
                            {ex.name}
                          </span>
                          {ex.completed && (
                            <span className="text-green-500 text-xs font-bold">
                              ✓ DONE
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {ex.sets} x {ex.reps}{' '}
                          {ex.weight ? `@ ${ex.weight}kg` : ''}
                        </div>
                        {ex.notes && (
                          <div className="text-gray-400 text-xs italic">
                            {ex.notes}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loading && schedules.length === 0 && !showForm && (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No schedules assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;
