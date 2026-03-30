import React, { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Droplets, Zap, Hospital, MapPin, Construction, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { DataChart } from '../components/DataChart';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { AfricaMap } from '../components/AfricaMap';
import { AFRICAN_COUNTRIES } from '../constants';
import { DownloadReportButton } from '../components/DownloadReportButton';
import { cn } from '../utils';

const generateInfraData = (query: string) => {
  return AFRICAN_COUNTRIES.map((country, index) => {
    const seed = country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const value = 15 + (seed % 75);
    const trend = value > 60 ? 'up' : value < 30 ? 'down' : 'stable';
    return { id: country, name: country, value, trend };
  });
};

interface InfrastructureDashboardProps {
  searchQuery?: string;
  userLocality?: string;
  viewPreference?: 'country' | 'africa';
}

export const InfrastructureDashboard: React.FC<InfrastructureDashboardProps> = ({ 
  searchQuery = '',
  userLocality = '',
  viewPreference = 'africa'
}) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const infraData = useMemo(() => generateInfraData(searchQuery), [searchQuery]);

  const countrySpecificData = useMemo(() => {
    if (viewPreference !== 'country' || !userLocality) return null;
    return infraData.find(d => d.name === userLocality);
  }, [infraData, userLocality, viewPreference]);

  const filteredInfraData = useMemo(() => {
    if (viewPreference === 'country' && userLocality) {
      return infraData.filter(item => item.name === userLocality);
    }
    if (!searchQuery) return infraData; // Show all countries by default
    return infraData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, infraData, viewPreference, userLocality]);

  const colorScale = (val: number) => {
    if (val < 30) return '#ef4444'; // Critical
    if (val < 60) return '#f97316'; // Developing
    return '#00f3ff'; // Stable
  };

  return (
    <div className="p-8 space-y-8" ref={dashboardRef}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {viewPreference === 'country' ? `${userLocality} Infrastructure` : 'Infrastructure & Water'}
          </h2>
          <p className="text-slate-400">
            {viewPreference === 'country' 
              ? `Planning sustainable energy, water, and healthcare solutions for ${userLocality}.`
              : 'Planning sustainable energy, water, and healthcare solutions for the continent.'}
          </p>
        </div>
        <DownloadReportButton 
          elementRef={dashboardRef} 
          fileName="infrastructure_development_report" 
          title="Infrastructure" 
        />
      </div>

      {viewPreference === 'country' && countrySpecificData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-6 rounded-3xl border-neon-blue/30 bg-neon-blue/5 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Construction className="w-4 h-4 text-neon-blue" />
              <span className="text-xs font-black text-neon-blue uppercase tracking-widest">Local Infrastructure Index</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userLocality} Development: {countrySpecificData.value}%</h3>
            <p className="text-slate-400 text-sm">Infrastructure in {userLocality} is currently {countrySpecificData.value > 50 ? 'Stable' : 'Critical'}. AI suggests prioritizing water sanitation projects in the northern districts.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-white">{countrySpecificData.value}%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Progress</span>
            </div>
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className={cn(
                "block text-2xl font-black",
                countrySpecificData.trend === 'up' ? "text-neon-blue" : "text-orange-400"
              )}>
                {countrySpecificData.trend === 'up' ? '↑' : '↓'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Trend</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Clean Water Access" value="58%" change="+1.5%" isPositive={true} color="blue" />
        <MetricCard label="Electricity Grid Coverage" value="44%" change="+3.2%" isPositive={true} color="blue" />
        <MetricCard label="Healthcare Proximity" value="32%" change="+0.5%" isPositive={true} color="blue" />
        <MetricCard label="Road Connectivity" value="28%" change="+1.1%" isPositive={true} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AfricaMap 
            data={filteredInfraData} 
            title="Infrastructure Development Index"
            colorScale={colorScale}
          />
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Investment Trends (USD Billions)</h3>
            <DataChart type="bar" color="#00f3ff" />
          </div>
        </div>
        <div className="space-y-8">
          <AIInsightsPanel topic="Infrastructure, Water, and Energy in Africa" data={infraData} />
          
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {[
                { icon: Droplets, title: 'Solar Desalination', desc: 'Optimal for coastal regions in Somalia and Namibia.' },
                { icon: Zap, title: 'Micro-Grids', desc: 'Decentralized solar hubs for 2,000+ rural villages.' },
                { icon: Hospital, title: 'Mobile Clinics', desc: 'Deploy 200 units to high-risk outbreak zones.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-neon-blue" />
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
