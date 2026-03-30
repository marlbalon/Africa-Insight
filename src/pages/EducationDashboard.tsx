import React, { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Wifi, BookOpen, Users, Globe } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { DataChart } from '../components/DataChart';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { AfricaMap } from '../components/AfricaMap';
import { AFRICAN_COUNTRIES } from '../constants';
import { DownloadReportButton } from '../components/DownloadReportButton';
import { cn } from '../utils';

const generateEduData = (query: string) => {
  return AFRICAN_COUNTRIES.map((country, index) => {
    const seed = country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const value = 30 + (seed % 60);
    const trend = value > 70 ? 'up' : value < 40 ? 'down' : 'stable';
    return { id: country, name: country, value, trend };
  });
};

interface EducationDashboardProps {
  searchQuery?: string;
  userLocality?: string;
  viewPreference?: 'country' | 'africa';
}

export const EducationDashboard: React.FC<EducationDashboardProps> = ({ 
  searchQuery = '',
  userLocality = '',
  viewPreference = 'africa'
}) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const eduData = useMemo(() => generateEduData(searchQuery), [searchQuery]);

  const countrySpecificData = useMemo(() => {
    if (viewPreference !== 'country' || !userLocality) return null;
    return eduData.find(d => d.name === userLocality);
  }, [eduData, userLocality, viewPreference]);

  const filteredEduData = useMemo(() => {
    if (viewPreference === 'country' && userLocality) {
      return eduData.filter(item => item.name === userLocality);
    }
    if (!searchQuery) return eduData; // Show all countries by default
    return eduData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, eduData, viewPreference, userLocality]);

  const colorScale = (val: number) => {
    if (val < 40) return '#ef4444'; // Low
    if (val < 70) return '#f97316'; // Medium
    return '#39ff14'; // High
  };

  return (
    <div className="p-8 space-y-8" ref={dashboardRef}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {viewPreference === 'country' ? `${userLocality} Education` : 'Education Accessibility'}
          </h2>
          <p className="text-slate-400">
            {viewPreference === 'country' 
              ? `Mapping school enrollment and digital learning connectivity for ${userLocality}.`
              : 'Mapping school enrollment and digital learning connectivity across Africa.'}
          </p>
        </div>
        <DownloadReportButton 
          elementRef={dashboardRef} 
          fileName="education_accessibility_report" 
          title="Education" 
        />
      </div>

      {viewPreference === 'country' && countrySpecificData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-6 rounded-3xl border-neon-purple/30 bg-neon-purple/5 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-black text-neon-purple uppercase tracking-widest">Local Literacy Focus</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userLocality} Enrollment: {countrySpecificData.value}%</h3>
            <p className="text-slate-400 text-sm">Educational access in {userLocality} is {countrySpecificData.value > 60 ? 'Above Average' : 'Developing'}. AI models suggest prioritizing digital infrastructure in rural areas.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-white">{countrySpecificData.value}%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Enrollment</span>
            </div>
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className={cn(
                "block text-2xl font-black",
                countrySpecificData.trend === 'up' ? "text-neon-purple" : "text-orange-400"
              )}>
                {countrySpecificData.trend === 'up' ? '↑' : '↓'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Trend</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Avg Enrollment Rate" value="68%" change="+2.4%" isPositive={true} color="purple" />
        <MetricCard label="Digital Connectivity" value="31%" change="+5.1%" isPositive={true} color="blue" />
        <MetricCard label="Literacy Rate (Youth)" value="74%" change="+1.2%" isPositive={true} color="green" />
        <MetricCard label="Schools with Internet" value="18%" change="+0.8%" isPositive={true} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AfricaMap 
            data={filteredEduData} 
            title="School Enrollment & Digital Access"
            colorScale={colorScale}
          />
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Literacy Progress (10-Year Trend)</h3>
            <DataChart type="line" color="#bc13fe" />
          </div>
        </div>
        <div className="space-y-8">
          <AIInsightsPanel topic="Education and Digital Literacy in Africa" data={eduData} />
          
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Priority Action Areas</h3>
            <div className="space-y-4">
              {[
                { icon: Wifi, title: 'Rural Connectivity', desc: 'Expand satellite internet to 500+ rural schools.' },
                { icon: BookOpen, title: 'Digital Curriculum', desc: 'Implement AI-driven localized learning modules.' },
                { icon: Users, title: 'Teacher Training', desc: 'Upskill 50,000 educators in digital tools.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
