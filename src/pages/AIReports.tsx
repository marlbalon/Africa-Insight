import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Calendar, Search, Sparkles, ChevronRight, X, Loader2, Printer, Lock } from 'lucide-react';
import { cn } from '../utils';
import { generateFullReport } from '../services/geminiService';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadReportButton } from '../components/DownloadReportButton';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';

const initialReports = [
  { id: 1, title: 'Quarterly Health Outlook: Q1 2026', type: 'Health', date: 'Mar 01, 2026', status: 'Generated', content: '' },
  { id: 2, title: 'Agricultural Yield Predictions: East Africa', type: 'Agriculture', date: 'Feb 25, 2026', status: 'Generated', content: '' },
  { id: 3, title: 'Education Connectivity Gap Analysis', type: 'Education', date: 'Feb 18, 2026', status: 'Archived', content: '' },
  { id: 4, title: 'Infrastructure Development Trends 2025', type: 'Infrastructure', date: 'Jan 12, 2026', status: 'Archived', content: '' },
];

interface AIReportsProps {
  searchQuery?: string;
  userLocality?: string;
  viewPreference?: 'country' | 'africa';
  user?: FirebaseUser | null;
}

export const AIReports: React.FC<AIReportsProps> = ({ 
  searchQuery: globalSearchQuery = '',
  userLocality = '',
  viewPreference = 'africa',
  user
}) => {
  const [reports, setReports] = useState(initialReports);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const effectiveSearchQuery = globalSearchQuery || localSearchQuery;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const scope = viewPreference === 'country' ? userLocality : 'Africa';
    const topic = effectiveSearchQuery 
      ? `Strategic Analysis: ${effectiveSearchQuery} in ${scope}` 
      : `Comprehensive ${scope} Development Review 2026`;
    
    const mockData = { 
      regions: viewPreference === 'country' ? [userLocality] : ['East', 'West', 'North', 'South', 'Central'], 
      indicators: ['GDP', 'Health', 'Agri', 'Infrastructure', 'Education'],
      query: effectiveSearchQuery,
      scope: scope,
      locality: userLocality
    };
    
    toast.info("Generating your custom report using real-time AI search...");
    
    const content = await generateFullReport(topic, mockData);
    
    const newReport = {
      id: Date.now(),
      title: topic,
      type: activeCategory !== 'All' ? activeCategory : 'Strategic',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Generated',
      content: content || 'Failed to generate content.'
    };
    
    setReports([newReport, ...reports]);
    setIsGenerating(false);
    setSelectedReport(newReport);
    setIsModalOpen(true);
    toast.success("New strategic report generated successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) || 
                         report.type.toLowerCase().includes(effectiveSearchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || report.type.startsWith(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {viewPreference === 'country' ? `${userLocality} AI Insights` : 'AI Insights & Reports'}
          </h2>
          <p className="text-slate-400">
            {viewPreference === 'country' 
              ? `Generate and export comprehensive AI-driven analysis reports for ${userLocality}.`
              : 'Generate and export comprehensive AI-driven analysis reports.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Lock className="w-3 h-3" />
              Sign in to generate
            </div>
          )}
          <button 
            onClick={user ? handleGenerateReport : () => window.dispatchEvent(new CustomEvent('open-signup'))}
            disabled={isGenerating}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50",
              user 
                ? "bg-neon-purple text-white hover:bg-neon-purple/80 shadow-neon-purple/20" 
                : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            )}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : (user ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
            {isGenerating ? 'Generating Detailed Report...' : (user ? 'Generate New Report' : 'Sign In to Generate')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism p-6 rounded-2xl border-white/5">
            <h3 className="font-bold text-white mb-4">Filters</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Health', 'Agriculture', 'Education', 'Infrastructure'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all text-xs",
                        activeCategory === cat 
                          ? "bg-neon-purple text-white border-neon-purple shadow-lg shadow-neon-purple/20" 
                          : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {cat === 'Agriculture' ? 'Agri' : cat === 'Education' ? 'Edu' : cat === 'Infrastructure' ? 'Infra' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-morphism p-4 rounded-2xl border-white/5 flex items-center gap-4">
            <Search className="w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder={globalSearchQuery ? `Searching for: ${globalSearchQuery}` : "Search reports by title or keyword..."} 
              className="flex-1 bg-transparent text-sm text-white focus:outline-none" 
            />
            {localSearchQuery && (
              <button onClick={() => setLocalSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setSelectedReport(report);
                    setIsModalOpen(true);
                  }}
                  className="glass-morphism p-6 rounded-2xl border-white/5 hover:border-neon-purple/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-neon-purple transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-neon-purple transition-colors">{report.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-500">{report.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-xs font-bold text-neon-blue">{report.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                      report.status === 'Generated' ? "bg-neon-green/10 text-neon-green" : "bg-slate-800 text-slate-500"
                    )}>
                      {report.status}
                    </span>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-morphism p-12 rounded-2xl border-white/5 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-white font-bold">No reports found</h4>
                  <p className="text-slate-500 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
                <button 
                  onClick={() => { setLocalSearchQuery(''); setActiveCategory('All'); }}
                  className="text-neon-purple text-sm font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isModalOpen && selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-5xl h-[90vh] glass-morphism rounded-[32px] border-neon-purple/30 flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedReport.title}</h3>
                    <p className="text-xs text-slate-400">Generated on {selectedReport.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <DownloadReportButton 
                    elementRef={reportRef} 
                    fileName={`${selectedReport.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`} 
                    title="Strategic" 
                    backgroundColor="#ffffff"
                  />
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 bg-white text-slate-900">
                <div ref={reportRef} id="report-content" className="max-w-3xl mx-auto space-y-8">
                  {/* PDF Header (Visible in PDF) */}
                  <div className="border-b-4 border-neon-purple pb-8 mb-12">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900">AFRICA INSIGHT</h1>
                        <p className="text-sm font-bold text-neon-purple uppercase tracking-widest">Strategic Intelligence Report</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase">Report ID: {selectedReport.id}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Date: {selectedReport.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="markdown-body prose prose-slate max-w-none">
                    {selectedReport.content ? (
                      <Markdown>{selectedReport.content}</Markdown>
                    ) : (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-2">1. Executive Summary</h2>
                        <p>This report provides a comprehensive analysis of regional development indicators across the African continent. Leveraging real-time data streams from health, agriculture, and infrastructure sectors, our AI models have identified critical patterns that demand immediate strategic attention.</p>
                        
                        <h2 className="text-2xl font-bold border-b pb-2">2. Regional Data Analysis</h2>
                        <p>Our analysis indicates a significant divergence in development trajectories between Sub-Saharan and North African regions. While digital connectivity is surging in the East, infrastructure gaps remain a primary bottleneck for trade in the Central regions.</p>
                        <div className="bg-slate-100 p-6 rounded-xl border-l-4 border-neon-blue">
                          <p className="font-bold italic">"The correlation between digital literacy and agricultural yield optimization has reached a historic high of 0.84 in the West African corridor."</p>
                        </div>

                        <h2 className="text-2xl font-bold border-b pb-2">3. Socio-Economic Impact</h2>
                        <p>The integration of AI in healthcare delivery has already reduced response times to localized outbreaks by an average of 34%. However, the economic impact of climate-driven migration continues to stress urban infrastructure in coastal hubs.</p>
                        
                        <div className="h-[400px]" /> {/* Page break simulation */}
                        
                        <h2 className="text-2xl font-bold border-b pb-2">4. Predictive Modeling</h2>
                        <p>Over the next 24 months, we anticipate a 15% increase in cross-border energy trade as regional micro-grids become interconnected. AI models predict that investment in 'Smart Irrigation' will be the single largest driver of GDP growth in the Sahel region by 2028.</p>

                        <h2 className="text-2xl font-bold border-b pb-2">5. Strategic Recommendations</h2>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Prioritize 'Digital-First' educational curricula in rural hubs.</li>
                          <li>Establish regional data-sharing protocols for pandemic preparedness.</li>
                          <li>Incentivize private sector investment in decentralized solar infrastructure.</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* PDF Footer */}
                  <div className="mt-20 pt-8 border-t border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">© 2026 Africa Insight AI Platform • Confidential Strategic Document</p>
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
