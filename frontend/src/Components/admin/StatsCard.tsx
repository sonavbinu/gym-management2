import React from 'react';

const StatsCard = ({
  title,
  value,
  color = 'bg-gray-200',
  icon,
}: {
  title: string;
  value: number | string;
  color?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div className={`p-4 rounded shadow flex items-center gap-4 ${color}`}>
      <div className="w-12 h-12 flex items-center justify-center rounded bg-white/30">
        {icon}
      </div>
      <div>
        <div className="text-sm text-white/90">{title}</div>
        <div className="text-2xl font-semibold text-white">{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;
