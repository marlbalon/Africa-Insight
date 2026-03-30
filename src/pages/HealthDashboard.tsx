import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AfricaMap } from '../components/AfricaMap';
import { MetricCard } from '../components/MetricCard';
import { DataChart } from '../components/DataChart';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { Filter, Calendar, MapPin, AlertTriangle, Search, ChevronDown, X } from 'lucide-react';
import { cn } from '../utils';
import { AFRICAN_COUNTRIES } from '../constants';
import { DownloadReportButton } from '../components/DownloadReportButton';

const diseases = [
  // Human Diseases
  'Malaria', 'Cholera', 'COVID-19', 'Measles', 'Ebola', 'Yellow Fever', 
  'Tuberculosis', 'HIV/AIDS', 'Meningitis', 'Polio', 'Typhoid', 
  'Lassa Fever', 'Marburg Virus', 'Mpox', 'Zika Virus', 'Dengue Fever',
  
  // Zoonotic & Animal Diseases
  'Rift Valley Fever', 'Anthrax', 'Rabies', 'Avian Influenza (Bird Flu)', 
  'African Swine Fever', 'Foot and Mouth Disease (FMD)', 'Brucellosis',
  'Peste des Petits Ruminants (PPR)', 'Contagious Bovine Pleuropneumonia (CBPP)',
  'Trypanosomiasis (Sleeping Sickness)', 'Bovine Tuberculosis', 'Newcastle Disease',
  'Lumpy Skin Disease', 'East Coast Fever', 'Contagious Caprine Pleuropneumonia'
];

const countries = AFRICAN_COUNTRIES;

interface HealthDashboardProps {
  searchQuery?: string;
  userLocality?: string;
  viewPreference?: 'country' | 'africa';
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ 
  searchQuery: globalSearchQuery = '',
  userLocality = '',
  viewPreference = 'africa'
}) => {
  const [selectedDisease, setSelectedDisease] = useState('Malaria');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Sync global search with disease selection
  React.useEffect(() => {
    if (globalSearchQuery) {
      const match = diseases.find(d => d.toLowerCase() === globalSearchQuery.toLowerCase());
      if (match) {
        setSelectedDisease(match);
      }
    }
  }, [globalSearchQuery]);

  const filteredDiseases = useMemo(() => 
    diseases.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const healthData = useMemo(() => {
    // Generate deterministic mock data based on disease name
    const seed = selectedDisease.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return countries.map((country, index) => {
      const countrySeed = country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const value = ((seed * countrySeed + index) % 100);
      const trend = value > 50 ? 'up' : value < 30 ? 'down' : 'stable';
      return { id: country, name: country, value, trend };
    });
  }, [selectedDisease]);

  const colorScale = (val: number) => {
    if (val > 80) return '#ef4444'; // Red
    if (val > 50) return '#f97316'; // Orange
    return '#22c55e'; // Green
  };

  const metrics = useMemo(() => {
    const seed = selectedDisease.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const localitySeed = userLocality.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // If country preference, adjust metrics slightly to reflect local data
    const multiplier = viewPreference === 'country' ? (localitySeed % 10) / 10 + 0.5 : 1;

    return {
      activeOutbreaks: Math.round(((seed % 20) + 5) * multiplier),
      highRiskRegions: Math.round(((seed % 10) + 2) * multiplier),
      vaccinationRate: Math.min(100, Math.round((50 + (seed % 40)) * (viewPreference === 'country' ? 0.9 + (localitySeed % 20) / 100 : 1))),
      accuracy: 85 + (seed % 10)
    };
  }, [selectedDisease, userLocality, viewPreference]);

  const countrySpecificData = useMemo(() => {
    if (viewPreference !== 'country' || !userLocality) return null;
    return healthData.find(d => d.name === userLocality);
  }, [healthData, userLocality, viewPreference]);

  return (
    <div className="p-8 space-y-8" ref={dashboardRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {viewPreference === 'country' ? `${userLocality} Health Focus` : 'One Health Dashboard'}
          </h2>
          <p className="text-slate-400">
            {viewPreference === 'country' 
              ? `Localized monitoring for ${userLocality} and surrounding regions.`
              : 'Integrated monitoring of human, zoonotic, and livestock disease outbreaks.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DownloadReportButton 
            elementRef={dashboardRef} 
            fileName={`health_report_${selectedDisease.toLowerCase()}`} 
            title="Health" 
          />
          {/* Custom Searchable Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="glass-morphism px-4 py-2 rounded-xl flex items-center gap-3 border-white/5 cursor-pointer hover:border-neon-blue/50 transition-all min-w-[200px]"
            >
              <Filter className="w-4 h-4 text-neon-blue" />
              <span className="text-sm font-bold text-white flex-1">{selectedDisease}</span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-full glass-morphism rounded-xl border-white/10 z-50 overflow-hidden shadow-2xl"
                >
                  <div className="p-2 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search disease..."
                        className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-neon-blue/30"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchTerm && (
                        <X 
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 cursor-pointer hover:text-white" 
                          onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredDiseases.length > 0 ? (
                      filteredDiseases.map((d) => (
                        <div 
                          key={d}
                          onClick={() => {
                            setSelectedDisease(d);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className={cn(
                            "px-4 py-2 text-sm cursor-pointer transition-colors",
                            selectedDisease === d ? "bg-neon-blue/20 text-neon-blue" : "text-slate-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {d}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-500 text-center italic">No diseases found</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-morphism px-4 py-2 rounded-xl flex items-center gap-2 border-white/5">
            <Calendar className="w-4 h-4 text-neon-blue" />
            <span className="text-sm font-bold text-white">Last 30 Days</span>
          </div>
        </div>
      </div>

      {viewPreference === 'country' && countrySpecificData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-6 rounded-3xl border-neon-blue/30 bg-neon-blue/5 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-neon-blue" />
              <span className="text-xs font-black text-neon-blue uppercase tracking-widest">Local Priority</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userLocality} Status: {countrySpecificData.value > 70 ? 'High Risk' : 'Stable'}</h3>
            <p className="text-slate-400 text-sm">Our AI models indicate a {countrySpecificData.trend === 'up' ? 'rising' : 'declining'} trend in {selectedDisease} cases within your locality. Immediate preventive measures are recommended.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-white">{countrySpecificData.value}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Risk Index</span>
            </div>
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className={cn(
                "block text-2xl font-black",
                countrySpecificData.trend === 'up' ? "text-red-400" : "text-green-400"
              )}>
                {countrySpecificData.trend === 'up' ? '↑' : '↓'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Trend</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Active Outbreaks" value={metrics.activeOutbreaks} change="+2" isPositive={false} color="blue" />
        <MetricCard label="High Risk Regions" value={metrics.highRiskRegions} change="-1" isPositive={true} color="purple" />
        <MetricCard label="Vaccination Rate" value={`${metrics.vaccinationRate}%`} change="+4.2%" isPositive={true} color="green" />
        <MetricCard label="AI Prediction Accuracy" value={`${metrics.accuracy}%`} change="+1.5%" isPositive={true} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AfricaMap 
            data={healthData} 
            title={`${selectedDisease} Risk Heatmap`}
            colorScale={colorScale}
          />
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Incident Trends</h3>
            <DataChart type="area" color="#00f3ff" />
          </div>
        </div>
        <div className="space-y-8">
          <AIInsightsPanel topic={`Health and ${selectedDisease} outbreaks`} data={healthData} />
          
          <div className="glass-morphism p-6 rounded-2xl border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-white">Active Alerts</h3>
            </div>
            <div className="space-y-4">
              {[
                { region: 'Lagos, Nigeria', msg: `Spike in ${selectedDisease} cases detected.`, time: '2h ago' },
                { region: 'Kinshasa, DRC', msg: `${selectedDisease} risk level: CRITICAL.`, time: '5h ago' },
              ].map((alert, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-red-400">{alert.region}</span>
                    <span className="text-[10px] text-slate-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{alert.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
