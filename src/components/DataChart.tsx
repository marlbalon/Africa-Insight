import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';

const mockData = [
  { name: 'Jan', value: 400, trend: 240 },
  { name: 'Feb', value: 300, trend: 139 },
  { name: 'Mar', value: 200, trend: 980 },
  { name: 'Apr', value: 278, trend: 390 },
  { name: 'May', value: 189, trend: 480 },
  { name: 'Jun', value: 239, trend: 380 },
  { name: 'Jul', value: 349, trend: 430 },
];

export const DataChart: React.FC<{ type?: 'bar' | 'line' | 'area', color?: string, data?: any[] }> = ({ 
  type = 'bar', 
  color = '#00f3ff',
  data = mockData 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border-white/10 shadow-xl">
          <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-white">
            Value: <span style={{ color }}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorArea)" strokeWidth={3} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
