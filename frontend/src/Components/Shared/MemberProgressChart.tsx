import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { scheduleAPI } from '../../services/api';

interface MemberProgressChartProps {
  memberId: string;
}

interface WeeklyStat {
  day: string;
  total: number;
  completed: number;
  percentage: number;
}

const MemberProgressChart = ({ memberId }: MemberProgressChartProps) => {
  const [data, setData] = useState<WeeklyStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consistency, setConsistency] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await scheduleAPI.getMemberStats(memberId);
        setData(res.data.weeklyCompletion);
        setConsistency(res.data.overallConsistency || 0);
      } catch (err) {
        console.error('Failed to load stats', err);
        setError('Could not load progress data');
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchStats();
    }
  }, [memberId]);

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Loading charts...
      </div>
    );

  if (error)
    return (
      <div className="h-64 flex items-center justify-center text-red-400">
        {error}
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="h-64 flex items-center justify-center flex-col text-gray-400">
        <span className="text-4xl mb-2">📊</span>
        <p>No workout data available</p>
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-bold text-gray-800">Weekly Consistency</h4>
          <p className="text-sm text-gray-500">Exercises completed vs assigned</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-blue-600">{consistency}%</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Overall Rate
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(val) => val.substring(0, 3)}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage >= 80 ? '#22C55E' : entry.percentage >= 50 ? '#3B82F6' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MemberProgressChart;
