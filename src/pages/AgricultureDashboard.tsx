import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, CloudRain, Thermometer, Upload, Search, ChevronRight, X, Loader2, FileText, Download, Printer, Lock } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { DataChart } from '../components/DataChart';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { AFRICAN_COUNTRIES } from '../constants';
import { analyzeCropImage, getPlantingSchedule } from '../services/geminiService';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '../utils';
import { DownloadReportButton } from '../components/DownloadReportButton';

import { auth } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

const generateAgriData = (query: string) => {
  return AFRICAN_COUNTRIES.map((country, index) => {
    const seed = country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const value = 60 + (seed % 35);
    const trend = value > 80 ? 'up' : value < 70 ? 'down' : 'stable';
    return { id: country, name: country, value, trend };
  });
};

interface AgricultureDashboardProps {
  searchQuery?: string;
  userLocality?: string;
  viewPreference?: 'country' | 'africa';
  user?: FirebaseUser | null;
}

export const AgricultureDashboard: React.FC<AgricultureDashboardProps> = ({ 
  searchQuery = '',
  userLocality = '',
  viewPreference = 'africa',
  user
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [plantingSchedule, setPlantingSchedule] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const agriData = useMemo(() => generateAgriData(searchQuery), [searchQuery]);

  const countrySpecificData = useMemo(() => {
    if (viewPreference !== 'country' || !userLocality) return null;
    return agriData.find(d => d.name === userLocality);
  }, [agriData, userLocality, viewPreference]);

  const filteredAgriData = useMemo(() => {
    if (viewPreference === 'country' && userLocality) {
      return agriData.filter(item => item.name === userLocality);
    }
    if (!searchQuery) return agriData; // Show all countries by default
    return agriData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, agriData, viewPreference, userLocality]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setSelectedImage(base64Data);
      setIsAnalyzing(true);
      setIsModalOpen(true);
      
      toast.info('AI is analyzing your crop image...');
      
      const base64Content = base64Data.split(',')[1];
      const result = await analyzeCropImage(base64Content, file.type);
      
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      if (result.includes('Unable to analyze')) {
        toast.error('Analysis failed. Please try a clearer image.');
      } else {
        toast.success('Analysis complete!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCheckSchedule = async () => {
    const locality = localStorage.getItem('user_locality');
    if (!locality) {
      toast.error('Please set your locality in settings first.');
      return;
    }

    setIsScheduleLoading(true);
    setIsScheduleModalOpen(true);
    toast.info(`Generating planting schedule for ${locality}...`);

    const schedule = await getPlantingSchedule(locality);
    setPlantingSchedule(schedule);
    setIsScheduleLoading(false);
    toast.success('Schedule generated successfully!');
  };

  return (
    <div className="p-8 space-y-8" ref={dashboardRef}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {viewPreference === 'country' ? `${userLocality} Agriculture` : 'Smart Agriculture'}
          </h2>
          <p className="text-slate-400">
            {viewPreference === 'country' 
              ? `AI-powered crop monitoring and yield optimization for ${userLocality}.`
              : 'AI-powered crop monitoring and yield optimization for all 54 African nations.'}
          </p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
          accept="image/*"
        />
        <DownloadReportButton 
          elementRef={dashboardRef} 
          fileName="agriculture_monitoring_report" 
          title="Agriculture" 
        />
      </div>

      {viewPreference === 'country' && countrySpecificData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-6 rounded-3xl border-neon-green/30 bg-neon-green/5 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-4 h-4 text-neon-green" />
              <span className="text-xs font-black text-neon-green uppercase tracking-widest">Localized Forecast</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userLocality} Yield Index: {countrySpecificData.value}%</h3>
            <p className="text-slate-400 text-sm">Conditions in {userLocality} are currently {countrySpecificData.value > 80 ? 'Optimal' : 'Stable'} for major staple crops. AI suggests focusing on irrigation efficiency this month.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-white">{countrySpecificData.value}%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Efficiency</span>
            </div>
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <span className={cn(
                "block text-2xl font-black",
                countrySpecificData.trend === 'up' ? "text-neon-green" : "text-orange-400"
              )}>
                {countrySpecificData.trend === 'up' ? '↑' : '↓'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Trend</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Average Soil Moisture" value="42%" change="+5%" isPositive={true} color="green" />
        <MetricCard label="Predicted Harvest" value="1.2M Tons" change="+12%" isPositive={true} color="blue" />
        <MetricCard label="Pest Risk Level" value="Low" change="-15%" isPositive={true} color="green" />
        <MetricCard label="Water Usage Efficiency" value="78%" change="+2%" isPositive={true} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-morphism p-8 rounded-3xl border-neon-green/20 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-neon-green/20 flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Crop Disease Detection</h3>
              <p className="text-sm text-slate-400 mb-6">Upload a photo of your crop to identify diseases and get treatment advice instantly.</p>
              
              {!user ? (
                <div className="w-full p-4 rounded-xl bg-dark-bg/50 border border-white/5 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Locked Feature</span>
                  </div>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-signup'))}
                    className="w-full py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold hover:bg-neon-green hover:text-dark-bg transition-all"
                  >
                    Sign In to Unlock
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl bg-neon-green text-dark-bg font-black hover:bg-white transition-all"
                >
                  Upload Image
                </button>
              )}
            </div>
            <div className="glass-morphism p-8 rounded-3xl border-neon-blue/20 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-neon-blue/20 flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Planting Predictor</h3>
              <p className="text-sm text-slate-400 mb-6">AI analyzes weather patterns and soil data to suggest the optimal planting window.</p>
              
              {!user ? (
                <div className="w-full p-4 rounded-xl bg-dark-bg/50 border border-white/5 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Locked Feature</span>
                  </div>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-signup'))}
                    className="w-full py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-bold hover:bg-neon-blue hover:text-dark-bg transition-all"
                  >
                    Sign In to Unlock
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleCheckSchedule}
                  className="w-full py-3 rounded-xl bg-neon-blue text-dark-bg font-black hover:bg-white transition-all"
                >
                  Check Schedule
                </button>
              )}
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Environmental Monitoring</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CloudRain className="w-4 h-4 text-neon-blue" /> Rainfall
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Thermometer className="w-4 h-4 text-orange-400" /> Temp
                </div>
              </div>
            </div>
            <DataChart type="line" color="#39ff14" />
          </div>
        </div>

        <div className="space-y-8">
          <AIInsightsPanel topic="African Agriculture and Crop Yields" data={agriData} />
          
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Regional Yield Leaders</h3>
            <div className="space-y-4">
              {filteredAgriData.length > 0 ? (
                filteredAgriData.map((region, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{region.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neon-green">{region.value}%</span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm italic">
                  No matching regions found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl h-[85vh] glass-morphism rounded-[32px] border-neon-green/30 flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-neon-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Crop Analysis</h3>
                    <p className="text-xs text-slate-400">Multimodal Diagnostic Report</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {analysisResult && (
                    <DownloadReportButton 
                      elementRef={reportRef} 
                      fileName={`crop_analysis_${Date.now()}`} 
                      title="Crop Analysis" 
                      backgroundColor="#ffffff"
                    />
                  )}
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900">
                <div ref={reportRef} className="max-w-3xl mx-auto space-y-8 p-4">
                  <div className="border-b-4 border-neon-green pb-6 mb-8">
                    <h1 className="text-3xl font-black text-slate-900">CROP HEALTH DIAGNOSTIC</h1>
                    <p className="text-sm font-bold text-neon-green uppercase tracking-widest">Africa Insight AI Agriculture Module</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Submitted Sample</h4>
                      {selectedImage && (
                        <div className="rounded-2xl overflow-hidden border-4 border-slate-100 shadow-lg">
                          <img src={selectedImage} alt="Crop sample" className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-500 uppercase text-xs tracking-widest">AI Diagnosis</h4>
                      {isAnalyzing ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
                          <p className="text-sm font-medium animate-pulse">Analyzing cellular patterns...</p>
                        </div>
                      ) : (
                        <div className="markdown-body prose prose-slate prose-sm max-w-none">
                          <Markdown>{analysisResult}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Generated by Africa Insight AI • {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl h-[85vh] glass-morphism rounded-[32px] border-neon-blue/30 flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex items-center justify-center">
                    <CloudRain className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Planting Predictor</h3>
                    <p className="text-xs text-slate-400">Localized Seasonal Schedule</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {plantingSchedule && (
                    <DownloadReportButton 
                      elementRef={scheduleRef} 
                      fileName={`planting_schedule_${Date.now()}`} 
                      title="Planting Schedule" 
                      backgroundColor="#ffffff"
                    />
                  )}
                  <button 
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900">
                <div ref={scheduleRef} className="max-w-3xl mx-auto space-y-8 p-4">
                  <div className="border-b-4 border-neon-blue pb-6 mb-8">
                    <h1 className="text-3xl font-black text-slate-900 uppercase">Planting Schedule: {localStorage.getItem('user_locality')}</h1>
                    <p className="text-sm font-bold text-neon-blue uppercase tracking-widest">Africa Insight AI Agriculture Module</p>
                  </div>

                  <div className="space-y-4">
                    {isScheduleLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                        <p className="text-sm font-medium animate-pulse">Fetching seasonal forecasts...</p>
                      </div>
                    ) : (
                      <div className="markdown-body prose prose-slate prose-sm max-w-none">
                        <Markdown>{plantingSchedule}</Markdown>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Generated by Africa Insight AI • {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
