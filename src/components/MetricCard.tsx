import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { cn } from '../utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  color?: 'blue' | 'purple' | 'green';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, isPositive, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    purple: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5',
    green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-morphism p-6 rounded-2xl border-white/5 flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-lg", colorMap[color])}>
          <Activity className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          isPositive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-1 font-mono">{value}</h3>
      </div>
    </motion.div>
  );
};
